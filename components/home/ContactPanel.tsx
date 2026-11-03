"use client";

import { SectionHead } from "@/components/home/SectionHead";
import { siteConfig } from "@/config/site";
import {
  contactSchema,
  type ContactFormValues,
} from "@/lib/validations/contact";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Copy, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

// An icon, not a "Copy" text button: in the two-column layout the text button took ~56px from the
// value column, which pushed the email onto a second line mid-word ("…gmail.co / m").
function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={copied ? `${label} copied` : `Copy ${label.toLowerCase()}`}
      title={copied ? "Copied" : "Copy"}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        } catch {
          // Clipboard refused (older browsers, some in-app views): the value is selectable text.
        }
      }}
      className="grid h-7 w-7 place-items-center rounded-md border border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
      )}
    </button>
  );
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none";

export function ContactPanel() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({ resolver: zodResolver(contactSchema) });

  async function onSubmit(data: ContactFormValues) {
    setStatus("idle");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        setStatus("error");
        return;
      }
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  }

  const firstError =
    errors.name?.message ?? errors.email?.message ?? errors.message?.message;

  return (
    <section id="contact" className="pt-20 sm:pt-24">
      <SectionHead number="05" title="say hello" />
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div>
          <h3 className="text-[22px] font-medium leading-snug tracking-[-0.02em] text-foreground [text-wrap:balance]">
            Have a role or a project? I reply within 24 hours.
          </h3>
          <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
            {siteConfig.contact.intro}
          </p>
          <div className="mt-5 border-t border-border">
            {[
              ["Email", siteConfig.email],
              ["Phone", siteConfig.phone],
            ].map(([label, value]) => (
              <div
                key={label}
                className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-2.5 border-b border-border py-2.5 text-[13.5px]"
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                  {label}
                </span>
                {/* One line always; if a very narrow column ever can't fit it, it scrolls in place
                    rather than breaking the address mid-word. */}
                <span className="select-all overflow-x-auto whitespace-nowrap text-foreground">
                  {value}
                </span>
                <CopyButton value={value} label={label} />
              </div>
            ))}
            <div className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-2.5 border-b border-border py-2.5 text-[13.5px]">
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                Based
              </span>
              <span className="text-foreground">{siteConfig.about.location} · GMT+8</span>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-[12.5px] font-medium text-muted-foreground">
              Name
              <input {...register("name")} autoComplete="name" placeholder="Jane Cooper" className={inputClass} />
            </label>
            <label className="flex flex-col gap-1.5 text-[12.5px] font-medium text-muted-foreground">
              Email
              <input
                {...register("email")}
                type="email"
                autoComplete="email"
                placeholder="jane@company.com"
                className={inputClass}
              />
            </label>
          </div>
          <label className="flex flex-col gap-1.5 text-[12.5px] font-medium text-muted-foreground">
            Message
            <textarea
              {...register("message")}
              rows={5}
              placeholder="What are you building, and what do you need from me?"
              className={`${inputClass} resize-y`}
            />
          </label>
          {/* Honeypot, see lib/validations/contact.ts: off-screen, out of the tab order and hidden
              from assistive tech. */}
          <input
            {...register("company")}
            tabIndex={-1}
            aria-hidden="true"
            autoComplete="off"
            className="absolute left-[-9999px] h-px w-px opacity-0"
          />
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <p
              role="status"
              className={`text-[12.5px] ${firstError || status === "error" ? "font-medium text-foreground" : "text-muted-foreground"}`}
            >
              {firstError ??
                (status === "success"
                  ? "Sent. I'll reply within 24 hours."
                  : status === "error"
                    ? `That didn't go through. Email me at ${siteConfig.email}.`
                    : "Usually replies within 24 hours.")}
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-foreground px-4 text-[13.5px] font-medium text-background hover:opacity-85 disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Send message
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
