import { useState, useCallback, useRef } from "react";
import type { ChatMessage } from "@/types";

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
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
    setIsStreaming(true);
    isStreamingRef.current = true;
    streamBufferRef.current = "";
    typedContentRef.current = "";
    setTypedContent("");
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const historyToSend = nextMessages.slice(-10);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyToSend }),
      });

      if (!response.ok) {
        const status = response.status;
        let message = "Oops! Nuggets had a hiccup. Please try again.";
        try {
          const json = await response.json();
          if (json?.message) message = json.message;
        } catch {
          if (status === 400) {
            message =
              "Something went wrong with that message. Please try again.";
          } else if (status >= 500) {
            message =
              "Nuggets is having trouble right now. Please try again in a bit.";
          }
        }
        throw new Error(message);
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
    } catch (err) {
      let msg = "Oops! Nuggets had a hiccup. Please try again.";
      if (err instanceof Error) {
        if (
          err.name === "TypeError" ||
          err.message.toLowerCase().includes("fetch")
        ) {
          msg = "Connection issue. Please check your internet and try again.";
        } else {
          msg = err.message;
        }
      }
      setError(msg);
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
    error,
    sendMessage,
  };
}
