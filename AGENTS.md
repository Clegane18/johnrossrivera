<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This project uses **Next.js 14+ App Router** — APIs and conventions differ significantly from Pages Router and older versions in your training data.

## Critical Next.js 14 App Router Rules

- **`params`/`searchParams` are synchronous in Next.js 14** — check `package.json` before writing async page props (they become Promises in Next.js 15+).
- `"use client"` is required for `useState`, `useEffect`, event handlers, or browser APIs.
- `"use server"` is for Server Actions only — not API routes.
- **API routes**: `app/api/[route]/route.ts` exports named HTTP handlers: `export async function POST(request: Request) {}` — NOT `handler(req, res)`.
- `next/image` requires `width`/`height` or `fill` — never `<img>`.
- `next/link` renders `<a>` — do not nest `<a>` inside `<Link>`.
- Metadata exported as `metadata` object or `generateMetadata()` — not `<Head>`.
- Fonts use `next/font` — not Google Fonts CDN links.

<!-- END:nextjs-agent-rules -->
