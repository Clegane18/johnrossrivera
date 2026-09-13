---
id: measure-after-animation-settles
trigger: fold, above the fold, viewport, breakpoint, screenshot, playwright, measure, layout, hero, getBoundingClientRect
scope: build
learned: 2026-09-13
evidence: Three fold measurements reported to the user were each ~20px wrong, and a placement decision was justified with them. Cause: measured while framer-motion was still mid-animation from initial={{y:20}}.
---

**Lesson:** Before measuring layout in this repo, assert the animation has settled; every hero element starts 20px low under `initial={{ y: 20 }}`, so a rect read too early is silently 20px off in a direction that looks plausible.

**Why:** `waitUntil:"domcontentloaded"` plus a fixed `waitForTimeout` is not enough. `getBoundingClientRect` returns real numbers the whole time, so nothing errors and nothing looks wrong. It produced "metrics 87/100 visible at 1440" when the truth was 100/100 with 7px to spare, and a claim that a below-the-metrics placement overflowed the fold, which was used to override what the user had asked for.

**Do:**
- `waitUntil:"networkidle"`, then poll until the element's computed `opacity` is 1 AND its `transform` is `none`/identity. Do not trust a bare timeout.
- Scroll the page once before measuring. These use `whileInView` with `once:true`, so an element that was never in view has never animated.
- The same trap ruins screenshots, but loudly: shoot too early and the hero renders BLANK at opacity 0. A blank hero is this bug, not a broken build.
- Sanity-check the direction: if several measurements are all wrong by the same ~20px, that is the `y:20` offset, not browser chrome.
