---
id: em-dash-sweep-pairs
trigger: em dash, em dashes, AI slop, punctuation, rewrite copy, find and replace, sweep, prose
scope: build
learned: 2026-09-10
evidence: 92 em dashes swept from site copy; 3 sentences became run-ons, all where the original used a PAIR of dashes as parentheses. Typecheck, lint and 91 tests were green on all 3.
---

**Lesson:** Count the em dashes in the sentence before replacing one; a PAIR is a parenthetical and needs two-sided punctuation, so replacing only the opening dash with a colon turns the closing aside into a phantom list item.

**Why:** `"the mobile app — 37 modules, 61 data models — on Node.js"` became `"...61 data models, on
Node.js"`, where "on Node.js" reads as a fourth count instead of the sentence resuming. Invisible to
every gate here: grammatical, typechecks, and the guard test asserts only that the character is gone,
never that the result reads well.

**Do:**
- Split by sentence first. Two dashes in one sentence means parentheses, not a colon: see the
  correct pattern at `lib/data/experience.ts:71`.
- One dash means a colon, a comma, or a full stop, chosen by what follows it.
- After any prose sweep, re-read the rewritten sentences. A green `npm run verify` says nothing
  about whether the copy still parses to a human, and this copy is what recruiters read.
- Search the ENTITY forms too: `&mdash;`, `&#8212;`, `&#x2014;`. Two lived in JSX and a character
  grep never saw them; `config/site.test.ts` now scans source text, since serializing the exported
  data objects reaches nothing written inline in a component.
- Verify the RENDERED page, not the source: `curl -s localhost:3000 | grep -c "—"`. That is what
  caught both. A comment inside a `beforeInteractive` inline `<Script>` ships in every page HTML.
- A date range is the one dash that should STAY, as an en dash (`&ndash;`). The tell is an em dash
  used as a sentence break, not a dash meaning "to".
- The remaining ~812 em dashes are in code comments (`app`, `components`, `lib`) and `.claude/`
  harness docs. Same rule applies, and comments are where paired dashes are most common.
