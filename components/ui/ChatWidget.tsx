"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Send, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useChat } from "@/hooks/useChat";
import { siteConfig } from "@/config/site";

// ── Message render helpers ──────────────────────────────────────────────────
const BOLD_RE = /\*\*(.+?)\*\*/g;
const LINK_RE =
  /(?:\*\s*)?([\w][\w\s&\-/.()]{0,50}?):\s*(https?:\/\/[^\s\n,]+)|(https?:\/\/[^\s\n,]+)/g;
const HL_RE =
  /(John Ross Rivera|John Ross|Smart-lift AI|KOL Dashboard|Rola Access Platform|Sniff Sense AI|Crystal Vision|G&F Auto Supply|Bulacan State University|Philippines)/gi;

function hlText(s: string, k: number): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  HL_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = HL_RE.exec(s)) !== null) {
    if (m.index > last) out.push(s.slice(last, m.index));
    out.push(
      <span
        key={k++}
        className="font-semibold text-green-600 dark:text-green-400"
      >
        {m[0]}
      </span>
    );
    last = m.index + m[0].length;
  }
  if (last < s.length) out.push(s.slice(last));
  return out;
}

function renderSegment(text: string, k: number): ReactNode[] {
  const out: ReactNode[] = [];
  let idx = 0;
  LINK_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = LINK_RE.exec(text)) !== null) {
    if (m.index > idx) {
      out.push(...hlText(text.slice(idx, m.index), k));
      k += 100;
    }
    const [full, lbl, url, bare] = m;
    const href = url ?? bare!;
    let label = lbl?.trim();
    if (!label) {
      try {
        label = new URL(bare!).hostname;
      } catch {
        label = bare!;
      }
    }
    out.push(
      <a
        key={k++}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-green-600 underline underline-offset-2 transition-colors hover:text-green-500 dark:text-green-400 dark:hover:text-green-300"
      >
        {label}
      </a>
    );
    idx = m.index + full.length;
  }
  if (idx < text.length) out.push(...hlText(text.slice(idx), k));
  return out;
}

function renderLine(line: string, baseKey: number): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let k = baseKey;
  BOLD_RE.lastIndex = 0;
  let bm: RegExpExecArray | null;
  while ((bm = BOLD_RE.exec(line)) !== null) {
    if (bm.index > last) {
      out.push(...renderSegment(line.slice(last, bm.index), k));
      k += 50;
    }
    out.push(
      <span key={k++} className="font-semibold">
        {bm[1]}
      </span>
    );
    last = bm.index + bm[0].length;
  }
  if (last < line.length) out.push(...renderSegment(line.slice(last), k));
  return out;
}

function renderMsg(text: string): ReactNode {
  const out: ReactNode[] = [];
  text.split("\n").forEach((line, li) => {
    // Strip markdown headings (###, ##, #) and bullet markers (* / -)
    const stripped = line.replace(/^#{1,6}\s+/, "").replace(/^[*-]\s+/, "• ");
    if (li > 0) out.push(<br key={`b${li}`} />);
    out.push(...renderLine(stripped, li * 1000));
  });
  return out;
}
function TypingDots() {
  return (
    <span className="flex items-center gap-1 py-1">
      <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s] dark:bg-zinc-500" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s] dark:bg-zinc-500" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 dark:bg-zinc-500" />
    </span>
  );
}
// ───────────────────────────────────────────────────────────────────────────

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const hintShownRef = useRef(false);
  const {
    messages,
    input,
    setInput,
    isStreaming,
    isTyping,
    typedContent,
    error,
    sendMessage,
  } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typedContent]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("nuggets:open", { detail: isOpen }));
  }, [isOpen]);

  useEffect(() => {
    if (isOpen || hintShownRef.current) return;
    let hideTimer: ReturnType<typeof setTimeout>;
    const showTimer = setTimeout(() => {
      setShowHint(true);
      hintShownRef.current = true;
      hideTimer = setTimeout(() => setShowHint(false), 5000);
    }, 2000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={cn(
              "fixed z-50 flex flex-col overflow-hidden",
              "border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700/60 dark:bg-zinc-900",
              "inset-0",
              "md:inset-auto md:bottom-24 md:right-6 md:h-[520px] md:w-[22rem] md:rounded-2xl",
              "lg:w-96"
            )}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.15 }}
          >
            {/* Header */}
            <div className="flex flex-shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900">
              <div className="flex items-center gap-2.5">
                <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-amber-400">
                  <Image
                    src={siteConfig.chat.avatarPath}
                    alt="Nuggets"
                    fill
                    className="object-cover"
                    sizes="36px"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-none text-zinc-900 dark:text-zinc-100">
                    {siteConfig.chat.name}
                  </p>
                  <span className="mt-1 flex items-center gap-1">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
                    </span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                      Online
                    </span>
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto bg-zinc-50 p-4 dark:bg-zinc-900/50">
              {messages.map((msg, i) => {
                const isActiveAssistant =
                  i === messages.length - 1 &&
                  msg.role === "assistant" &&
                  (isTyping || isStreaming);
                return (
                  <div
                    key={i}
                    className={cn("flex items-end gap-2", {
                      "justify-end": msg.role === "user",
                      "justify-start": msg.role === "assistant",
                    })}
                  >
                    {msg.role === "assistant" && (
                      <div className="relative h-7 w-7 flex-shrink-0 overflow-hidden rounded-full ring-1 ring-amber-400">
                        <Image
                          src={siteConfig.chat.avatarPath}
                          alt="Nuggets"
                          fill
                          className="object-cover"
                          sizes="28px"
                        />
                      </div>
                    )}
                    {msg.role === "user" ? (
                      <div className="max-w-[82%] rounded-2xl rounded-br-sm bg-green-500 px-4 py-2.5 text-sm text-white">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-4 py-2.5 text-sm leading-relaxed text-zinc-800 shadow-sm dark:bg-zinc-800 dark:text-zinc-100">
                        {isActiveAssistant ? (
                          isTyping ? (
                            <>
                              {renderMsg(typedContent)}
                              <span className="animate-pulse text-green-500">
                                |
                              </span>
                            </>
                          ) : (
                            <TypingDots />
                          )
                        ) : msg.content ? (
                          renderMsg(msg.content)
                        ) : (
                          <TypingDots />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-600 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-400">
                  <span className="mt-px flex-shrink-0 font-bold">!</span>
                  <span>{error}</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex-shrink-0 border-t border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Nuggets anything..."
                  disabled={isStreaming}
                  className="max-h-24 w-full resize-none overflow-y-auto rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-green-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isStreaming}
                  aria-label="Send message"
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-green-500 text-white transition-colors hover:bg-green-600 disabled:opacity-30"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-[70]",
          isOpen && "max-md:hidden"
        )}
      >
        <div className="relative">
          {/* Call-to-action hint bubble */}
          <AnimatePresence>
            {showHint && !isOpen && (
              <motion.div
                initial={{ opacity: 0, x: 12, scale: 0.88 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 12, scale: 0.88 }}
                transition={{ type: "spring", stiffness: 380, damping: 22 }}
                className="absolute bottom-2 right-16 w-44 rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold leading-snug text-zinc-800 shadow-[0_8px_24px_rgba(0,0,0,0.18)] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
              >
                Chat with Nuggets to know more about John!
                <span className="absolute right-[-6px] top-1/2 -translate-y-1/2 border-4 border-transparent border-l-white dark:border-l-zinc-900" />
              </motion.div>
            )}
          </AnimatePresence>
          {!isOpen && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-25" />
          )}
          <motion.button
            onClick={() => setIsOpen((prev) => !prev)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.93 }}
            className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full shadow-[0_0_20px_rgba(251,146,60,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={isOpen ? "Close chat" : "Open chat"}
          >
            <Image
              src={siteConfig.chat.avatarPath}
              alt="Nuggets"
              fill
              className="object-cover"
              sizes="56px"
            />
            <AnimatePresence>
              {isOpen && (
                <motion.span
                  key="overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-zinc-900/70"
                >
                  <X className="h-5 w-5 text-white" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </>
  );
}
