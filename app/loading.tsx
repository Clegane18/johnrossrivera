// Route-level loading state — shown while a segment streams in.
export default function Loading() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      role="status"
      aria-label="Loading"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
