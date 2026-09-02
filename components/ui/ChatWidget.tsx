"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Info, Mail, Send, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useChat } from "@/hooks/useChat";
import { useCommandPalette } from "@/hooks/useCommandPalette";
import { useSound } from "@/hooks/useSound";
import { siteConfig } from "@/config/site";

// ── Message render helpers ──────────────────────────────────────────────────
const BOLD_RE = /\*\*(.+?)\*\*/g;
const LINK_RE =
  /(?:\*\s*)?([\w][\w\s&\-/.()]{0,50}?):\s*(https?:\/\/[^\s\n,]+)|(https?:\/\/[^\s\n,]+)/g;
const HL_RE =
  /(John Ross Rivera|John Ross|Smart-lift AI|KOL Dashboard|Rola Competition Platform|Rola Access Platform|Sniff Sense AI|Crystal Vision|G&F Auto Supply|Bulacan State University|Philippines)/gi;

function hlText(s: string, k: number): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  HL_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = HL_RE.exec(s)) !== null) {
    if (m.index > last) out.push(s.slice(last, m.index));
    out.push(
      <span key={k++} className="font-semibold text-foreground">
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
        className="text-foreground underline underline-offset-2 transition-colors hover:text-muted-foreground"
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
  const [showTech, setShowTech] = useState(false);
  const [atContact, setAtContact] = useState(false);
  const hintShownRef = useRef(false);
  const {
    messages,
    input,
    setInput,
    isStreaming,
    isTyping,
    typedContent,
    fallback,
    sendMessage,
    remaining,
  } = useChat();
  const { play } = useSound();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typedContent]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("nuggets:open", { detail: isOpen }));
  }, [isOpen]);

  // Step aside over the contact form.
  //
  // The launcher is fixed at bottom-24 right-6, which on a 375px screen lands it squarely on the
  // Email input and the Message textarea — the two fields a recruiter has to fill to reach John at
  // all. There is nowhere on a phone to put a floating circle that never collides with anything, so
  // rather than move it, it retreats where the collision actually costs something. By the contact
  // section the visitor has stopped asking about him and started writing to him; a chat launcher
  // has nothing left to offer, and the form does.
  useEffect(() => {
    const section = document.getElementById("contact");
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => setAtContact(entry.isIntersecting),
      { rootMargin: "-25% 0px -10% 0px" }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // The hint waits for the visitor to leave the hero, and not only for a timer.
  //
  // It used to fire 2s after load wherever they were, which on a phone and on tablet put a 176px
  // bubble directly over "View My Work" — the hero's primary CTA — for five seconds of the first
  // ten. The one moment the visitor is most likely to act on the page was the moment something
  // else was parked on the button. Gating on a scroll past the fold keeps the invitation and moves
  // it to a point where nothing is competing with it.
  useEffect(() => {
    if (isOpen || hintShownRef.current) return;

    let showTimer: ReturnType<typeof setTimeout>;
    let hideTimer: ReturnType<typeof setTimeout>;

    function pastHero() {
      return window.scrollY > window.innerHeight * 0.6;
    }

    function arm() {
      if (hintShownRef.current) return;
      hintShownRef.current = true;
      window.removeEventListener("scroll", onScroll);
      showTimer = setTimeout(() => {
        // Checked again on fire, not only on arm. Scrolling down and back up inside the delay put
        // the bubble over the hero CTA anyway — the one place it must never land.
        if (!pastHero()) {
          hintShownRef.current = false;
          window.addEventListener("scroll", onScroll, { passive: true });
          return;
        }
        setShowHint(true);
        hideTimer = setTimeout(() => setShowHint(false), 5000);
      }, 600);
    }

    function onScroll() {
      if (pastHero()) arm();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // ⌘K / Ctrl+K opens the chat. When it is already open, focus the input rather than toggling it
  // shut — a shortcut that closes what you just reached for feels broken.
  useCommandPalette(
    useCallback(() => {
      setIsOpen(true);
      inputRef.current?.focus();
    }, [])
  );

  // Both send paths (Enter and the button) go through here so the sound cannot be wired to one and
  // forgotten on the other. play() is a no-op unless the visitor opted in.
  const handleSend = () => {
    play("send");
    sendMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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
                <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full ring-1 ring-border">
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
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-foreground" />
                    </span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                      Online
                    </span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowTech((v) => !v)}
                  className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                  aria-label="How Nuggets works"
                  aria-expanded={showTech}
                  aria-controls="nuggets-tech-panel"
                >
                  <Info className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* How Nuggets works — collapsible engineering note */}
            <AnimatePresence initial={false}>
              {showTech && (
                <motion.div
                  id="nuggets-tech-panel"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0 overflow-hidden border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/60"
                >
                  <div className="space-y-1.5 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      {siteConfig.chat.techNote.heading}
                    </p>
                    <ul className="space-y-1">
                      {siteConfig.chat.techNote.points.map((pt) => (
                        <li
                          key={pt}
                          className="flex gap-1.5 text-[11px] leading-snug text-zinc-600 dark:text-zinc-300"
                        >
                          <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-muted-foreground" />
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
                      <div className="relative h-7 w-7 flex-shrink-0 overflow-hidden rounded-full ring-1 ring-border">
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
                      <div className="max-w-[82%] rounded-2xl rounded-br-sm bg-foreground px-4 py-2.5 text-sm text-background">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-4 py-2.5 text-sm leading-relaxed text-zinc-800 shadow-sm dark:bg-zinc-800 dark:text-zinc-100">
                        {isActiveAssistant ? (
                          isTyping ? (
                            <>
                              {renderMsg(typedContent)}
                              <span className="animate-pulse text-muted-foreground">
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

              {/* An outage is styled as a NOTICE, not an error. A red "!" box reads as a broken
                  site, and the visitor is often a recruiter — so when the chat cannot answer, the
                  job of this block is to keep the conversion path open, not to report a fault. */}
              {fallback && (
                <div
                  role="alert"
                  className="flex flex-col gap-2 rounded-xl border border-border bg-muted px-3 py-2.5 text-xs text-foreground"
                >
                  <span>{fallback.message}</span>

                  {/* amber-700, not amber-600: white on amber-600 is 3.19:1 and fails WCAG AA for
                      normal text (needs 4.5:1). amber-700 is 5.02:1, hover amber-800 is 7.09:1.
                      No dark: override — the ratio is text vs button fill, so it does not change
                      with the page background. */}
                  {fallback.showContact && (
                    <a
                      href={`mailto:${siteConfig.email}`}
                      className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-foreground px-2.5 py-1.5 font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                      Email John directly
                    </a>
                  )}
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
                  className="max-h-24 w-full resize-none overflow-y-auto rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-foreground"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isStreaming}
                  aria-label="Send message"
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-foreground text-background transition-opacity hover:opacity-90 disabled:opacity-30"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
              {remaining !== null && (
                <p className="mt-1.5 text-right font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
                  {remaining} {remaining === 1 ? "ask" : "asks"} left this hour
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <div
        className={cn(
          "fixed bottom-24 right-6 z-[70] transition-opacity duration-300 lg:bottom-6",
          isOpen && "max-md:hidden",
          // Desktop has room beside the form, so the retreat is a phone/tablet rule only.
          atContact && "pointer-events-none opacity-0 lg:pointer-events-auto lg:opacity-100"
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
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground opacity-25" />
          )}
          <motion.button
            onClick={() => setIsOpen((prev) => !prev)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.93 }}
            className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full shadow-[0_0_20px_rgba(251,146,60,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
