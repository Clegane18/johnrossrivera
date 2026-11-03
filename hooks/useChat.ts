import { useState, useCallback, useRef } from "react";
import {
  AGENT_EVENT,
  TOUR_EVENT,
  applyIntent,
  detectIntent,
  parseAgentReply,
  visibleText,
} from "@/lib/ai/page-actions";
import { chatFallback } from "@/lib/utils/chat-fallback";
import type { ChatFallback, ChatMessage } from "@/types";

// The first thing anyone reads in the panel, and the line that sets what this is.
//
// It used to open "Woof! I'm Nuggets — John's very own dog assistant... (Virtual tummy scratches
// also accepted)". The visitor being greeted is usually a recruiter, and that greeting made an
// assistant grounded on real project data read as a novelty. It now says what it is and what it
// knows, which is also the more interesting claim: the answers come from the same files the page
// renders, so they cannot contradict what the visitor just scrolled past.
const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "I'm Nuggets, the assistant for John Ross Rivera's portfolio. Ask about his experience, his projects, or how something was built. I answer from the same project data this site is built on.",
};

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typedContent, setTypedContent] = useState("");
  const [fallback, setFallback] = useState<ChatFallback | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [limit, setLimit] = useState<number | null>(null);

  const streamBufferRef = useRef("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isStreamingRef = useRef(false);
  const typedContentRef = useRef("");

  const stopTyping = useCallback((finalContent: string) => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsTyping(false);
    setMessages((prev) => {
      const updated = [...prev];
      const last = updated[updated.length - 1];
      if (last?.role === "assistant") {
        updated[updated.length - 1] = { ...last, content: finalContent };
      }
      return updated;
    });
    setTypedContent("");
    typedContentRef.current = "";
  }, []);

  const startTypingInterval = useCallback(() => {
    if (intervalRef.current !== null) return;
    setIsTyping(true);
    intervalRef.current = setInterval(() => {
      if (streamBufferRef.current.length > 0) {
        const chars = streamBufferRef.current.slice(0, 2);
        streamBufferRef.current = streamBufferRef.current.slice(2);
        typedContentRef.current += chars;
        const snapshot = typedContentRef.current;
        setTypedContent(snapshot);
      } else if (!isStreamingRef.current) {
        stopTyping(typedContentRef.current);
      }
    }, 14);
  }, [stopTyping]);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setFallback(null);
    setIsStreaming(true);
    isStreamingRef.current = true;
    streamBufferRef.current = "";
    typedContentRef.current = "";
    setTypedContent("");
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    // Captured here rather than encoded into the thrown Error, so the catch can tell an HTTP
    // failure (which has a status, and therefore a specific fallback) from a transport failure
    // (which has none). Left null for network errors — chatFallback(null) is the connection case.
    let failureStatus: number | null = null;
    let failureMessage: string | null = null;

    try {
      // Role and content only: `actions` and `tour` are UI state and the API schema does not take
      // them. A draft goes back inside its markers, so "make it shorter" can revise it.
      // Last 6, not 10: the prompt, this history and the 400-token reply must fit Groq's free-tier
      // 8,000 tokens per minute (see lib/ai/system-prompt.ts), or the request is refused with a 413.
      const historyToSend = nextMessages
        .slice(-6)
        .map(({ role, content, draft }) => ({
          role,
          content: draft ? `${content}\n<<email>>\n${draft}\n<</email>>` : content,
        }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyToSend }),
      });

      const remainingHeader = response.headers.get("X-RateLimit-Remaining");
      if (remainingHeader !== null) setRemaining(Number(remainingHeader));
      const limitHeader = response.headers.get("X-RateLimit-Limit");
      if (limitHeader !== null) setLimit(Number(limitHeader));

      if (!response.ok) {
        failureStatus = response.status;
        try {
          const json = await response.json();
          if (typeof json?.message === "string") failureMessage = json.message;
        } catch {
          // Body was not JSON. The status alone is enough to choose a fallback.
        }
        throw new Error("chat-unavailable");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream.");

      // The raw reply can end with page-action directives (lib/ai/page-actions.ts). Only the
      // visible part is fed to the typing animation: `visibleText` is recomputed over the whole
      // reply after each chunk and only ever grows, so the new tail is what gets typed.
      const decoder = new TextDecoder();
      let raw = "";
      let shownLength = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        raw += decoder.decode(value, { stream: true });
        const visible = visibleText(raw);
        if (visible.length > shownLength) {
          streamBufferRef.current += visible.slice(shownLength);
          shownLength = visible.length;
        }
        startTypingInterval();
      }

      const { text, actions, tour, draft } = applyIntent(
        parseAgentReply(raw),
        detectIntent(trimmed),
        trimmed
      );
      if (text.length > shownLength) {
        streamBufferRef.current += text.slice(shownLength);
        startTypingInterval();
      }
      if (actions.length > 0 || tour || draft) {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role === "assistant") {
            updated[updated.length - 1] = {
              ...last,
              ...(actions.length > 0 && { actions }),
              ...(tour && { tour }),
              ...(draft && { draft }),
            };
          }
          return updated;
        });
      }
      // A tour drives the page itself, one step at a time, so it never comes with one-off actions.
      if (tour) {
        window.dispatchEvent(new CustomEvent(TOUR_EVENT, { detail: tour }));
      } else if (actions.length > 0) {
        window.dispatchEvent(new CustomEvent(AGENT_EVENT, { detail: actions }));
      }
    } catch {
      // failureStatus is null for anything that never produced an HTTP response — a dropped
      // connection, a missing stream body — which is exactly the case chatFallback treats as a
      // connection problem rather than an outage.
      setFallback(chatFallback(failureStatus, failureMessage));
      streamBufferRef.current = "";
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsTyping(false);
      setTypedContent("");
      typedContentRef.current = "";
      setMessages((prev) => {
        const updated = [...prev];
        if (updated[updated.length - 1]?.content === "") {
          updated.pop();
        }
        return updated;
      });
    } finally {
      setIsStreaming(false);
      isStreamingRef.current = false;
    }
  }, [input, isStreaming, messages, startTypingInterval]);

  return {
    messages,
    input,
    setInput,
    isStreaming,
    isTyping,
    typedContent,
    fallback,
    sendMessage,
    remaining,
    limit,
  };
}
