"use client";

import { useState } from "react";
import { Check, Send } from "lucide-react";
import { contactSchema } from "@/lib/validations/contact";

const fieldClass =
  "w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none";

/**
 * A message to John that Nuggets drafted for the visitor. It is only ever a draft: the visitor can
 * rewrite every word, has to add who they are, and nothing leaves the page until they press Send.
 * It posts to the same /api/contact route as the contact form, with the same validation and limits.
 */
export function DraftCard({ draft }: { draft: string }) {
  const [message, setMessage] = useState(draft);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function send() {
    // The draft leaves gaps like [Company Name] for the visitor; never send one still in place.
    if (/\[[^\]\n]{1,40}\]/.test(message)) {
      setError("Fill in or delete the parts in [brackets] first.");
      return;
    }
    const parsed = contactSchema.safeParse({ name, email, message });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the fields above.");
      return;
    }
    setError(null);
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div
        role="status"
        className="flex w-full items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-[13px] text-foreground"
      >
        <Check className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
        Sent to John. He usually replies within 24 hours.
      </div>
    );
  }

  return (
    <div className="w-full space-y-2 rounded-lg border border-border bg-card p-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
        Draft to John · edit anything
      </p>
      <textarea
        aria-label="Message to John"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={6}
        className={`${fieldClass} resize-y leading-relaxed`}
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          aria-label="Your name"
          placeholder="Your name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={fieldClass}
        />
        <input
          aria-label="Your email"
          placeholder="Your email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={fieldClass}
        />
      </div>
      {(error || status === "error") && (
        <p role="alert" className="text-[12px] text-foreground">
          {error ?? "That did not send. Try again, or email John directly."}
        </p>
      )}
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] text-muted-foreground">Nothing is sent until you press Send.</p>
        <button
          type="button"
          onClick={send}
          disabled={status === "sending"}
          className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-[12px] font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Send className="h-3 w-3" aria-hidden="true" />
          {status === "sending" ? "Sending" : "Send"}
        </button>
      </div>
    </div>
  );
}
