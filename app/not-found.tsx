import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section-padding flex min-h-screen items-center">
      <div className="section-container">
        <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-8 text-center shadow-sm sm:p-10">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Error 404
          </p>
          <h1 className="mt-3 font-hero text-5xl font-black uppercase text-foreground sm:text-6xl">
            Page Not Found
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            The page you are looking for may have been moved or removed. Use the
            shortcuts below to continue exploring the portfolio.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Back To Home
            </Link>
            <Link
              href="/#projects"
              className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              View Projects
            </Link>
            <Link
              href="/#contact"
              className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Contact Me
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
