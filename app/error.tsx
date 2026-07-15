"use client";

// Branded fallback for an uncaught error in a route segment (e.g. a Server Component throw). Mirrors
// not-found.tsx so a runtime error never drops the visitor on the raw Next.js error screen.

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="section-padding flex min-h-screen items-center">
      <div className="section-container">
        <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-8 text-center shadow-sm sm:p-10">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Something went wrong
          </p>
          <h1 className="mt-3 font-hero text-5xl font-black uppercase text-foreground sm:text-6xl">
            Unexpected Error
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            A hiccup on this page — it&apos;s not you. Try again, or head back
            to the homepage.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Try Again
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Back To Home
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
