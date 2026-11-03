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
import {
  SHORTCUT_KEY,
  useCommandPalette,
  useShortcutModifier,
} from "@/hooks/useCommandPalette";
import { useSound } from "@/hooks/useSound";
import { siteConfig } from "@/config/site";
import { AGENT_EVENT, actionLabel } from "@/lib/ai/page-actions";

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
      // text-current, not text-foreground: the page token is near-black in light mode,
      // while the bubble sets its own colour. Inheriting the bubble's colour keeps the
      // highlight readable whatever surface it lands on; font-semibold carries the emphasis.
      <span key={k++} className="font-semibold text-current">
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
        className="text-current underline underline-offset-2 transition-opacity hover:opacity-70"
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
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
    </span>
  );
}
// ───────────────────────────────────────────────────────────────────────────

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showTech, setShowTech] = useState(false);
  const [atContact, setAtContact] = useState(false);
  const [atHero, setAtHero] = useState(true);
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
  const modifier = useShortcutModifier();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typedContent]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("nuggets:open", { detail: isOpen }));
  }, [isOpen]);

  // Below md the panel is full screen (inset-0), so a page action would happen behind it. Close the
  // panel there and let the visitor watch; the answer and its chip stay in the history.
  useEffect(() => {
    function onAgent() {
      if (window.matchMedia("(max-width: 767px)").matches) setIsOpen(false);
    }
    window.addEventListener(AGENT_EVENT, onAgent);
    return () => window.removeEventListener(AGENT_EVENT, onAgent);
  }, []);

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

  // Drop the label back to the bare avatar while the hero is on screen.
  //
  // The hero parks its GitHub/LinkedIn/Email column in the bottom-right corner of the stage at lg,
  // which is the corner this launcher lives in. The old 56px circle cleared it; the labelled pill is
  // 172px and, at 1440 exactly, covered LinkedIn and Email — a fixed control sitting on top of two
  // real links. Collapsing to the circle over the hero restores the original footprint precisely
  // where the conflict is, and the label returns for the rest of the page. Nothing is lost at the
  // top: the hero is already carrying the introduction the label would give.
  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) {
      setAtHero(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setAtHero(entry.isIntersecting),
      { rootMargin: "0px 0px -35% 0px" }
    );
    observer.observe(hero);
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
              // The site's own tokens, thin border and squarer corners, so the panel reads as part
              // of the page rather than a third-party widget dropped on top of it.
              "border border-border bg-background shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)]",
              "inset-0",
              "md:inset-auto md:bottom-24 md:right-6 md:h-[520px] md:w-[22rem] md:rounded-xl",
              "lg:bottom-20 lg:w-96"
            )}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.15 }}
          >
            {/* Header */}
            <div className="flex flex-shrink-0 items-center justify-between border-b border-border bg-background px-4 py-3">
              <div className="flex items-center gap-2.5">
                {/* Greyscale, like everything else on the page that is not a project screenshot. */}
                <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-md border border-border">
                  <Image
                    src={siteConfig.chat.avatarPath}
                    alt="Nuggets"
                    fill
                    className="object-cover grayscale"
                    sizes="32px"
                  />
                </div>
                <div>
                  <p className="font-mono text-[13px] font-medium leading-none text-foreground">
                    {siteConfig.chat.name}
                  </p>
                  {/* What it is, not a pulsing "Online" dot.
                      The dot indicated nothing — the panel is open, so of course it is reachable —
                      and it animated forever. The navbar dropped exactly this pattern for exactly
                      this reason; the widget kept it. A plain role line uses the same space to
                      answer the question a first-time visitor actually has. */}
                  <p className="mt-1.5 font-mono text-[10px] uppercase leading-none tracking-[0.08em] text-muted-foreground">
                    {siteConfig.chat.role}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowTech((v) => !v)}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="How Nuggets works"
                  aria-expanded={showTech}
                  aria-controls="nuggets-tech-panel"
                >
                  <Info className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
                  className="flex-shrink-0 overflow-hidden border-b border-border bg-muted/40"
                >
                  <div className="space-y-1.5 px-4 py-3">
                    <p className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground">
                      {siteConfig.chat.techNote.heading}
                    </p>
                    <ul className="space-y-1">
                      {siteConfig.chat.techNote.points.map((pt) => (
                        <li
                          key={pt}
                          className="flex gap-1.5 text-[11px] leading-snug text-muted-foreground"
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
            <div className="flex-1 space-y-3 overflow-y-auto bg-background p-4">
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
                      <div className="relative h-6 w-6 flex-shrink-0 overflow-hidden rounded-md border border-border">
                        <Image
                          src={siteConfig.chat.avatarPath}
                          alt="Nuggets"
                          fill
                          className="object-cover grayscale"
                          sizes="24px"
                        />
                      </div>
                    )}
                    {msg.role === "user" ? (
                      <div className="max-w-[82%] rounded-lg rounded-br-sm bg-foreground px-3.5 py-2.5 text-sm text-background">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="flex max-w-[85%] flex-col items-start gap-1.5">
                        <div className="rounded-lg rounded-bl-sm border border-border bg-card px-3.5 py-2.5 text-sm leading-relaxed text-foreground">
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
                        {/* What this answer did on the page. Clicking replays it, so a visitor who
                            scrolled away can get back to the proof. */}
                        {msg.actions?.map((action) => (
                          <button
                            key={`${action.kind}:${action.id}`}
                            type="button"
                            onClick={() =>
                              window.dispatchEvent(
                                new CustomEvent(AGENT_EVENT, { detail: [action] })
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 font-mono text-[11px] text-muted-foreground transition-colors hover:border-muted-foreground hover:text-foreground"
                          >
                            <span aria-hidden="true">↳</span>
                            {actionLabel(action)}
                          </button>
                        ))}
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
                  className="flex flex-col gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-xs text-foreground"
                >
                  <span>{fallback.message}</span>

                  {/* amber-700, not amber-600: white on amber-600 is 3.19:1 and fails WCAG AA for
                      normal text (needs 4.5:1). amber-700 is 5.02:1, hover amber-800 is 7.09:1.
                      No dark: override — the ratio is text vs button fill, so it does not change
                      with the page background. */}
                  {fallback.showContact && (
                    <a
                      href={`mailto:${siteConfig.email}`}
                      className="inline-flex w-fit items-center gap-1.5 rounded-md bg-foreground px-2.5 py-1.5 font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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
            <div className="flex-shrink-0 border-t border-border bg-background p-3">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Nuggets anything..."
                  disabled={isStreaming}
                  className="max-h-24 w-full resize-none overflow-y-auto rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isStreaming}
                  aria-label="Send message"
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-foreground text-background transition-opacity hover:opacity-90 disabled:opacity-30"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
              {remaining !== null && (
                <p className="mt-1.5 text-right font-mono text-[10px] text-muted-foreground">
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
                // y: -50% with top-1/2 centres the bubble on the launcher. It lives in the motion
                // values, not a Tailwind translate class, because framer-motion owns `transform`
                // here and would overwrite the class.
                initial={{ opacity: 0, x: 12, y: "-50%", scale: 0.92 }}
                animate={{ opacity: 1, x: 0, y: "-50%", scale: 1 }}
                exit={{ opacity: 0, x: 12, y: "-50%", scale: 0.92 }}
                transition={{ type: "spring", stiffness: 380, damping: 22 }}
                /* right-full, NOT a fixed right-16. The launcher is two different widths: a bare
                   56px circle over the hero, and a ~176px labelled pill everywhere else (see the
                   sm:pr-5 and the "Ask Nuggets" label below). right-16 is 64px, which cleared the
                   circle by 8px and landed 112px INSIDE the pill, so the hint painted across the
                   label. right-full pins the bubble's right edge to the launcher's left edge
                   whatever that width happens to be, and mr-3 is the gap the arrow sits in. */
                // One line, centred on the launcher: a four-line bubble sat low and covered page
                // content for its five seconds.
                className="absolute right-full top-1/2 mr-3 whitespace-nowrap rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground shadow-[0_8px_24px_-8px_rgba(0,0,0,0.22)]"
              >
                Ask me about John&rsquo;s work
                <span className="absolute right-[-6px] top-1/2 -translate-y-1/2 border-4 border-transparent border-l-card" />
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button
            onClick={() => setIsOpen((prev) => !prev)}
            whileTap={{ scale: 0.96 }}
            /* A labelled control on anything wider than a phone.
               A bare circular portrait with an orange halo is a mascot: it says "pet" and gives no
               clue what pressing it does. Naming the action is the single biggest thing separating
               a tool from a toy, so the avatar keeps its place as the mark and the label sits beside
               it. Below sm there is no room for the label and the circle stands alone.
               The halo also went: it was `rgba(251,146,60,.35)`, the last orange on a site that was
               deliberately swept to monochrome, so the widget glowed in a colour used nowhere else. */
            // Same vocabulary as the rail's buttons: card fill, thin border, squarer corners, a
            // greyscale mark and the shortcut in mono. The old round photo button read as a widget
            // bolted onto the page.
            className={cn(
              "relative flex h-12 items-center gap-2.5 overflow-hidden rounded-xl border border-border bg-card p-1.5 text-[13px] font-medium text-foreground shadow-[0_10px_30px_-12px_rgba(0,0,0,0.45)] transition-colors duration-200 hover:border-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              // Also collapsed while the panel is open: the close overlay is `inset-0` and was drawn
              // for the bare mark, so over the labelled button it painted across the label.
              !atHero && !isOpen && "sm:pr-3"
            )}
            aria-label={isOpen ? "Close chat" : "Ask Nuggets about John's work"}
          >
            <span className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg border border-border">
              <Image
                src={siteConfig.chat.avatarPath}
                alt=""
                fill
                className="object-cover grayscale"
                sizes="36px"
              />
            </span>
            {!atHero && !isOpen && (
              <span className="hidden items-center gap-2.5 whitespace-nowrap sm:flex">
                Ask {siteConfig.chat.name}
                <span className="flex gap-1" aria-hidden="true">
                  <kbd className="rounded border border-border bg-background px-1.5 font-mono text-[10.5px] font-normal text-muted-foreground">
                    {modifier}
                  </kbd>
                  <kbd className="rounded border border-border bg-background px-1.5 font-mono text-[10.5px] font-normal text-muted-foreground">
                    {SHORTCUT_KEY}
                  </kbd>
                </span>
              </span>
            )}
            <AnimatePresence>
              {isOpen && (
                <motion.span
                  key="overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="absolute inset-0 flex items-center justify-center bg-foreground"
                >
                  <X className="h-5 w-5 text-background" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </>
  );
}
