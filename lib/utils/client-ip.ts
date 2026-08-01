// Resolves a request's client IP for rate-limit KEYING only — never use this for authorization or
// anything security-sensitive beyond "which bucket does this request count against".
//
// Deployment context: this app runs on Vercel. Vercel's edge network strips any client-supplied
// `x-vercel-*` and `x-forwarded-for` headers and re-sets them itself from the real connection before
// the request reaches this function — a caller cannot forge these values on THIS deployment
// (https://vercel.com/docs/edge-network/headers). That means, unlike a bare reverse-proxy setup,
// taking the FIRST hop below is not a spoofing hole here; do not "fix" this to the last hop.
//
// Preference order:
// 1. `x-vercel-forwarded-for` — Vercel's own header, set at the edge from the real client
//    connection. Prefer it first because it is the header Vercel explicitly documents for this
//    purpose and is present on every request that reaches a Vercel serverless/edge function.
// 2. `x-real-ip` — set by some proxies/CDNs; not guaranteed on Vercel, kept as a fallback for
//    non-Vercel environments (e.g. local reverse proxies) this code might run behind.
// 3. The first entry of `x-forwarded-for`. On an untrusted multi-proxy chain the first entry is
//    normally the least trustworthy hop (a proxy appends to the end, so the first hop can be
//    whatever the client sent) — but per the deployment note above, Vercel overwrites this header
//    with the real client IP and does not forward a client-supplied value, so on this deployment the
//    first hop is exactly as trustworthy as any other. It is kept as the third, not first,
//    preference purely because `x-vercel-forwarded-for` is the more explicit signal when present.
// 4. A constant fallback so an unresolved IP still buckets into one shared rate-limit key instead of
//    disabling the limiter (e.g. `Map.get(undefined)` never matching).
export function getClientIp(request: Request): string {
  const vercelForwarded = request.headers.get("x-vercel-forwarded-for");
  if (vercelForwarded) return vercelForwarded.split(",")[0].trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  return "unknown";
}
