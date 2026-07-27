import { useState, useCallback, useRef } from "react";
import { chatFallback } from "@/lib/utils/chat-fallback";
import type { ChatFallback, ChatMessage } from "@/types";

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Woof! I'm Nuggets 🐾 — John's very own dog assistant. Ask me anything about his experience, projects, or skills — I know everything about my human! (Virtual tummy scratches also accepted 🐾)",
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
      const historyToSend = nextMessages.slice(-10);

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

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        streamBufferRef.current += chunk;
        startTypingInterval();
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
