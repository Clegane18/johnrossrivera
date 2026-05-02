<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This project uses **Next.js 14+ App Router** — APIs, conventions, and file structure differ
significantly from Pages Router and older versions in your training data.

## Critical Next.js 14 App Router Rules

- **`params` and `searchParams` in page components are synchronous in Next.js 14**, but become
  Promises in Next.js 15+. Check `package.json` before writing async page props.
- `"use client"` is required for any component using `useState`, `useEffect`, event handlers,
  or browser APIs. Server components cannot use these.
- `"use server"` is required only for Server Actions (not API routes).
- **API routes** live at `app/api/[route]/route.ts` and export named HTTP method handlers:
  `export async function POST(request: Request) {}` — NOT the old `handler(req, res)` pattern.
- `next/image` requires `width` and `height` or `fill` prop — never use plain `<img>` tags.
- `next/link` renders an `<a>` tag — do not nest `<a>` inside `<Link>`.
- Metadata is exported as a `metadata` object or `generateMetadata` function — not `<Head>`.
- Fonts use `next/font` — not Google Fonts CDN links.
- Read `app/layout.tsx` and one existing page before writing any new page or layout.

## Project Specifics

- Single-repo, single-app — no monorepo, no separate backend server
- Backend = Next.js API Routes in `app/api/` (currently only `/api/contact`)
- Content = TypeScript data files in `lib/data/` — no database, no CMS
- Styling = Tailwind CSS (mobile-first), always use `cn()` from `lib/utils/cn.ts` for dynamic classes
- TypeScript strict mode — no `any`, no type assertions without justification

## Before Writing Any Code

1. Read `project.md` — single source of truth for architecture and conventions
2. Read the nearest existing component/hook/file in the same layer
3. Follow the layer rules in `project.md` — they are enforced, not optional
<!-- END:nextjs-agent-rules -->
