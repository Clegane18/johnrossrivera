# Conventions

Project-specific ground truth for the agents in `.claude/agents/`. Keep it short — it is read on most
planning tasks, so it competes with the code for the same attention.

Next.js 14 App Router rules live in [`AGENTS.md`](AGENTS.md) and are not repeated here. Read that first
if you are touching routing, metadata, images or API handlers.

---

## What this project is

A personal portfolio and hiring artifact for one person, deployed on Vercel. The audience is recruiters
and hiring managers doing a 30-second skim. There is **no database and no auth** — every fact on the
site is static TypeScript in `lib/data/`, and the only network calls out are Groq (the chat assistant)
and Resend (the contact form).

**Stack:** Next.js 14.2 App Router · React 18 · TypeScript strict · Tailwind 3 · zod 4 · vitest 4 ·
`groq-sdk` · `resend` · framer-motion.

---

## Commands

| Purpose | Command |
| --- | --- |
| Full check (the closing gate) | `npm run verify` |
| Fast check (runs every turn) | `npm run typecheck` |
| Tests, one file | `npx vitest run lib/utils/rate-limit.test.ts` |
| Run the app locally | `npm run dev` |

`npm run verify` is typecheck → lint → tests → harness selftest. A healthy tree exits 0 on all four;
there are no known-red tests here, so any failure is real.

---

## Where things live

| Layer | Path | Owns |
| --- | --- | --- |
| Routes & SEO | `app/` | Pages, the three API handlers, `sitemap.ts`, `robots.ts`, OG/Twitter images |
| Page sections | `components/sections/` | One component per landing-page section |
| Reusable UI | `components/ui/` | Buttons, cards, carousel, chat widget, lightbox |
| Chrome | `components/layout/` | Navbar, footer, mobile dock, deferred widgets |
| **Content** | `lib/data/` | `profile` · `projects` · `experience` · `skills` — the source of truth |
| Validation | `lib/validations/` | One zod schema per API route |
| Pure helpers | `lib/utils/` | Rate limiting, client IP, chat fallback, duration, `cn` |
| Chat prompt | `lib/ai/system-prompt.ts` | Behaviour hand-written, facts derived from `lib/data/` |
| Client hooks | `hooks/` | Theme, sound, scroll spy, carousel, command palette |
| Site copy | `config/site.ts` | Name, metadata, hero copy, hero metrics |
| Shared shapes | `types/index.ts` | `Project`, `Experience`, and friends |

**Read this first:** [`app/api/chat/route.ts`](app/api/chat/route.ts). Every API route follows its
shape — rate-limit by IP, `safeParse` the body with a zod schema from `lib/validations/`, return
`{ success, message }` JSON, and degrade to something useful rather than an error.

Tests are colocated: `foo.ts` and `foo.test.ts` in the same directory. Vitest runs in the `node`
environment and its `include` is `**/*.test.ts` — a `.tsx` component test will not be picked up
without changing [`vitest.config.ts`](vitest.config.ts).

---

## Traps

- **`lib/data/` is the source of truth, and the chat derives from it.** `system-prompt.ts` builds its
  facts out of `profile`, `projects`, `experience` and `skills` precisely so the assistant cannot quote
  a number the visible site contradicts. Hard-coding copy into a component or into the prompt breaks
  that guarantee silently — edit the data file.
- **A project's `id` is its `/work/[slug]` URL** and the target of the hero metric links. Renaming one
  404s every link already in the wild, for a string no recruiter reads.
- **Rate limiting is in-memory and per-instance.** On Vercel serverless it resets on cold start and does
  not span instances. It is best-effort throttling; do not describe it as a guarantee.
- **A chat outage is a routing problem, not an error state.** `chat-fallback.ts` exists because the
  visitor hitting an exhausted token budget is usually a recruiter, and a red error box reads as a
  broken site. Never surface a raw failure — hand them the contact path.
- **`ssr: false` on `next/dynamic` is only legal from a Client Component.** That is the entire reason
  `components/layout/DeferredWidgets.tsx` exists — it keeps `app/layout.tsx` a Server Component while
  still code-splitting the chat widget out of the shared chunk. Do not inline it back.
- **Assets referenced from `config/site.ts` must exist in `public/`.** The resume link has already 404'd
  in production once (`c9890b7`); the path is not typechecked.
- **Formatting is enforced, not negotiated.** Prettier: double quotes, semicolons, 80 columns, and
  Tailwind class ordering via `prettier-plugin-tailwindcss`. Do not hand-sort class names.
- **Commits follow Conventional Commits with a scope** — `fix(api):`, `feat(nav):`, `perf(app):`. The
  subject says what changed for a *user*, not which file moved. `git log -20` is the real reference.

---

## Reporting rules

- **A deferral is not a gap.** These are deliberate and must not be re-raised as findings: there is no
  database, no auth, and no CI workflow in the repo (`.github/` is gitignored) — Vercel builds on push.
  The in-memory rate limiter is a considered choice for this traffic level, not an oversight.
- **A claim that ages carries the date it was measured.** Any count or "every / all / none" statement
  written into a doc or a user-visible string says when it was measured. The numbers in `lib/data/` and
  `config/site.ts` describe real systems and are checked against the CV — do not adjust one without the
  other.
- **A priority label is not permission to start.** What matters and what is next are different
  questions.
