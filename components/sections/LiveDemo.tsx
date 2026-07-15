"use client";

import { siteConfig } from "@/config/site";
import { motion } from "framer-motion";
import { Activity, Loader2, Send, Terminal } from "lucide-react";
import { useState } from "react";

const smoothEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

type PingResult = {
  status: string;
  region: string;
  latencyMs: number;
};

// Shape guaranteed by GET /api/demo — keeps the playground in lockstep with the route contract.
type HealthResponse = {
  status?: string;
  region?: string;
  runtime?: string;
  timestamp?: string;
};

export function LiveDemo() {
  // Health-check / ping panel
  const [pinging, setPinging] = useState(false);
  const [ping, setPing] = useState<PingResult | null>(null);
  const [pingError, setPingError] = useState<string | null>(null);

  // Validated-echo panel
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [echo, setEcho] = useState<string | null>(null);
  const [echoStatus, setEchoStatus] = useState<number | null>(null);
  const [echoLatency, setEchoLatency] = useState<number | null>(null);

  async function handlePing() {
    setPinging(true);
    setPingError(null);
    const started = performance.now();

    try {
      const res = await fetch("/api/demo", { method: "GET" });
      const elapsed = Math.round(performance.now() - started);
      const data = (await res.json()) as HealthResponse;

      setPing({
        status: data.status ?? "unknown",
        region: data.region ?? "unknown",
        latencyMs: elapsed,
      });
    } catch {
      setPingError("Request failed. Check your connection and try again.");
    } finally {
      setPinging(false);
    }
  }

  async function handleEcho() {
    setSending(true);
    setEcho(null);
    const started = performance.now();

    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const elapsed = Math.round(performance.now() - started);
      const data: unknown = await res.json();

      setEchoStatus(res.status);
      setEchoLatency(elapsed);
      setEcho(JSON.stringify(data, null, 2));
    } catch {
      setEchoStatus(null);
      setEchoLatency(null);
      setEcho("Request failed. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  const panelClass =
    "flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:p-6";
  const outputClass =
    "overflow-x-auto rounded-xl border border-border bg-muted/50 p-4 font-mono text-xs leading-relaxed text-foreground";

  return (
    <section id="live-demo" className="section-padding bg-muted/40">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: smoothEase }}
          className="mb-10 sm:mb-12"
        >
          <h2 className="section-heading">
            {siteConfig.sectionLabels.liveDemo}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Not a screenshot. These buttons hit a real Next.js API route running
            server-side — a health check and a Zod-validated endpoint. Try to
            break the validation.
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 md:gap-6">
          {/* Ping panel */}
          <div className={panelClass}>
            <div className="flex items-center gap-2">
              <Activity
                className="h-4 w-4 text-foreground"
                aria-hidden="true"
              />
              <h3 className="font-display text-base font-semibold text-foreground">
                Health check
              </h3>
              <code className="ml-auto rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                GET /api/demo
              </code>
            </div>

            <button
              onClick={handlePing}
              disabled={pinging}
              className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm font-semibold text-background transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50"
            >
              {pinging ? (
                <>
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  Pinging...
                </>
              ) : (
                "Ping the API"
              )}
            </button>

            <div aria-live="polite" className="min-h-[3rem]">
              {pingError && <p className="text-sm text-red-500">{pingError}</p>}
              {ping && !pingError && (
                <div className={outputClass}>
                  <div className="flex flex-wrap gap-x-6 gap-y-1">
                    <span>
                      status:{" "}
                      <span className="text-green-600 dark:text-green-400">
                        {ping.status}
                      </span>
                    </span>
                    <span>region: {ping.region}</span>
                    <span>
                      round-trip:{" "}
                      <span className="tabular-nums">{ping.latencyMs}ms</span>
                    </span>
                  </div>
                  <p className="mt-2 text-[10px] text-muted-foreground">
                    round-trip measured from your browser
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Echo / validation panel */}
          <div className={panelClass}>
            <div className="flex items-center gap-2">
              <Terminal
                className="h-4 w-4 text-foreground"
                aria-hidden="true"
              />
              <h3 className="font-display text-base font-semibold text-foreground">
                Validated echo
              </h3>
              <code className="ml-auto rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                POST /api/demo
              </code>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="demo-text"
                className="text-sm font-medium text-foreground"
              >
                Send up to 200 characters (empty or too long is rejected)
              </label>
              <div className="flex items-end gap-2">
                <input
                  id="demo-text"
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !sending) handleEcho();
                  }}
                  placeholder="Type anything, or leave empty to see a 400..."
                  className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                />
                <button
                  onClick={handleEcho}
                  disabled={sending}
                  aria-label="Send to the API"
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-foreground text-background transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div aria-live="polite" className="min-h-[3rem]">
              {echo && (
                <div className={outputClass}>
                  {echoStatus !== null && (
                    <p className="mb-2 text-[11px] text-muted-foreground">
                      HTTP{" "}
                      <span
                        className={
                          echoStatus >= 200 && echoStatus < 300
                            ? "text-green-600 dark:text-green-400"
                            : "text-amber-600 dark:text-amber-400"
                        }
                      >
                        {echoStatus}
                      </span>
                      {echoLatency !== null && (
                        <>
                          {" · "}
                          <span className="tabular-nums">{echoLatency}ms</span>
                        </>
                      )}
                    </p>
                  )}
                  <pre className="whitespace-pre-wrap break-words">{echo}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
