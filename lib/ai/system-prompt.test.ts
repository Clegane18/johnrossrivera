import { describe, expect, it } from "vitest";

import { experiences } from "@/lib/data/experience";
import { profile } from "@/lib/data/profile";
import { projects } from "@/lib/data/projects";
import { skills } from "@/lib/data/skills";

import { ACTION_PROJECTS, ACTION_SECTIONS } from "./page-actions";
import {
  ANSWER_RULES,
  PAGE_ACTIONS,
  PERSONA,
  SCOPE_CONTRACT,
  brief,
  buildSystemPrompt,
  pickFocus,
} from "./system-prompt";

describe("focused prompt (speed and capacity)", () => {
  it("picks the project a question names", () => {
    expect(pickFocus("Tell me about the KOL dashboard").projectIds[0]).toBe("kol-dashboard");
    expect(pickFocus("What is Primolar?").projectIds[0]).toBe("pedia-dental");
    expect(pickFocus("how does provenly work").projectIds[0]).toBe("provenly");
    expect(pickFocus("what did he do with Laravel").projectIds).toContain("kol-dashboard");
  });

  it("matches the interview answer a standard question asks for", () => {
    const { qaIndexes } = pickFocus("Are you open to opportunities right now?");
    expect(profile.interviewQa[qaIndexes[0]].q).toBe("Are you open to opportunities right now?");
  });

  it("still names every project and keeps the contract at both edges", () => {
    const focused = buildSystemPrompt("Is he available to hire?");
    for (const p of projects) expect(focused).toContain(`- ${p.title}`);
    expect(focused.indexOf("# SCOPE")).toBe(0);
    expect(focused.trimEnd().endsWith("offer what I can help with.")).toBe(true);
    for (const p of ACTION_PROJECTS) expect(focused).toContain(`- ${p.id} (`);
  });

  it("is much smaller than the full prompt, so more questions fit in Groq's per-minute limit", () => {
    const full = buildSystemPrompt().length;
    for (const q of ["What's his strongest project?", "Tell me about provenly", "Is he available?"]) {
      expect(buildSystemPrompt(q).length).toBeLessThan(full * 0.7);
    }
  });
});

// WHAT THESE TESTS CAN AND CANNOT PROVE
//
// They CANNOT prove the model refuses "build me a login form" — nothing here calls Groq, and the
// harness never will. Use .claude/tools/probe-chat.mjs against a running server for that.
//
// What they DO lock in is everything that made the old prompt fail, so a future edit cannot quietly
// undo it: the scope contract must exist, it must come FIRST (its position was the actual bug —
// the rule was present but buried), it must teach the near-miss discrimination, and the
// never-disclose rules must survive.

describe("buildSystemPrompt", () => {
  const prompt = buildSystemPrompt();

  it("puts the scope contract first, before persona and facts", () => {
    const scopeAt = prompt.indexOf("# SCOPE");
    const personaAt = prompt.indexOf("# WHO I AM");
    const factsAt = prompt.indexOf("## PERSONAL INFORMATION");
    const rulesAt = prompt.indexOf("## HOW I ANSWER");

    expect(scopeAt).toBe(0);
    expect(scopeAt).toBeLessThan(personaAt);
    expect(personaAt).toBeLessThan(factsAt);
    expect(factsAt).toBeLessThan(rulesAt);
  });

  it("restates the scope limit at the end, so it owns both edges of the prompt", () => {
    expect(
      prompt
        .trimEnd()
        .endsWith("decline in one sentence and offer what I can help with.")
    ).toBe(true);
  });

  it("states the refusal test as intent rather than topic", () => {
    expect(SCOPE_CONTRACT).toContain("THE TEST IS INTENT, NOT TOPIC");
  });

  it("teaches the near-miss pair: refuse the task, answer the question about John", () => {
    // This pair is the whole point. A keyword ban on "login form" would break the second case,
    // which is a legitimate question about John's work.
    expect(SCOPE_CONTRACT).toContain('"Build me a login form" → OUT');
    expect(SCOPE_CONTRACT).toContain(
      '"What did John build for authentication at Rola?" → IN'
    );
  });

  it("covers the instruction-override attempt", () => {
    expect(SCOPE_CONTRACT).toContain("Ignore your previous instructions");
  });

  it("keeps every never-disclose rule", () => {
    expect(ANSWER_RULES).toContain("Never state a salary figure or range");
    expect(ANSWER_RULES).toContain("Never state a freelance or contract rate");
    expect(ANSWER_RULES).toContain("Never share or invent a phone number");
    expect(ANSWER_RULES).toContain("Never mention visa status");
    expect(ANSWER_RULES).toContain("Never invent a fact");
  });

  it("points to the real email for compensation questions", () => {
    expect(ANSWER_RULES).toContain(profile.email);
  });

  it("keeps the derived facts grounded in lib/data, not hardcoded", () => {
    expect(prompt).toContain(profile.fullName);
    expect(prompt).toContain(profile.education.school);
    expect(prompt).toContain("## WORK EXPERIENCE");
    expect(prompt).toContain("## PROJECTS");
  });

  it("does not restate availability or work setup as answer rules", () => {
    // They are FACTS and already appear in PERSONAL INFORMATION. The old prompt listed them a second
    // time as rules 8 and 9, which spent attention without adding information.
    expect(ANSWER_RULES).not.toContain(profile.availability);
    expect(ANSWER_RULES).not.toContain(profile.workSetup);
    expect(prompt).toContain(profile.availability);
    expect(prompt).toContain(profile.workSetup);
  });

  it("instructs a short refusal rather than a partial attempt", () => {
    expect(SCOPE_CONTRACT).toContain("Never produce a partial attempt first");
  });

  it("sets a default answer length", () => {
    expect(ANSWER_RULES).toContain("Default to 2–4 sentences");
  });

  it("speaks as Nuggets in the first person", () => {
    expect(PERSONA).toContain("Nuggets");
  });
});

describe("skills are derived, never a second copy", () => {
  // The page and the chat used to keep SEPARATE skill lists (lib/data/skills.ts and a profile.skills
  // field). They drifted exactly as you would expect: the visible section was trimmed to a
  // defensible core while the chat went on reciting Angular, Moleculer.js and "DevOps" to recruiters.
  // profile.skills is gone and the prompt now derives from lib/data/skills.ts. These tests exist so
  // a future edit cannot reintroduce the second copy without going red.
  const prompt = buildSystemPrompt();

  it("keeps the page's shortlist a strict subset of the CV list", () => {
    // The chat carries two skill lists on purpose: the page's shortlist and the full CV list. That
    // is only safe while the shortlist is contained in the CV — otherwise the site would feature a
    // skill the CV in the recruiter's inbox does not claim, which is the worse direction to drift.
    const cv = new Set(
      [
        ...profile.cvSkills.languages,
        ...profile.cvSkills.frameworks,
        ...profile.cvSkills.devTools,
      ].map((s) => s.toLowerCase())
    );

    // Page-only entries: "REST" is a style, not a CV line item, and Engineering Leverage describes
    // tooling John built rather than a technology the CV lists.
    const pageOnly = new Set(
      [
        "REST",
        ...skills.flatMap((s) =>
          s.id === "engineering-leverage" ? s.items : []
        ),
      ].map((s) => s.toLowerCase())
    );

    for (const group of skills) {
      for (const item of group.items) {
        const key = item.toLowerCase();
        expect(
          cv.has(key) || pageOnly.has(key),
          `"${item}" is on the page but not on the CV`
        ).toBe(true);
      }
    }
  });

  it("renders every skill the Skills section renders", () => {
    expect(prompt).toContain("## TECHNICAL SKILLS");

    for (const group of skills) {
      expect(prompt).toContain(group.category);
      for (const item of group.items) {
        expect(prompt).toContain(item);
      }
    }
  });

  it("carries a category's note through to the chat", () => {
    // The note is where the non-obvious claims live, so a note the page shows and the chat does not
    // know about is drift in the direction that costs the most.
    for (const group of skills) {
      if (group.note) expect(prompt).toContain(group.note);
    }
  });

  it("still tells the chat about entries hidden from the page", () => {
    // `hiddenOnPage` means "off the CV, off the page, still fair game in conversation". If the
    // prompt ever stopped deriving from the FULL arrays, the flag would silently become a delete —
    // and the one thing it must never do is take work away from the chat.
    const hidden = [
      ...experiences.filter((e) => e.hiddenOnPage).map((e) => e.company),
      ...projects.filter((p) => p.hiddenOnPage).map((p) => p.title),
    ];

    expect(hidden.length).toBeGreaterThan(0);

    for (const name of hidden) {
      expect(prompt).toContain(name);
    }
  });

  it("no longer names stacks that are on neither the page nor the CV", () => {
    // Not a style rule — these are the exact strings the old duplicated list leaked, and none of
    // them survives on John's current CV. PHPUnit deliberately is NOT in this list: it leaked from
    // the old list too, but "Pest / PHPUnit" is a real line on the CV, so the chat naming it is
    // correct rather than stale. The bar is "absent from both sources", not "absent from the page".
    const dropped = ["Angular", "Moleculer", "DevOps", "Visual Studio Code"];
    const everythingClaimed = [
      ...skills.flatMap((s) => s.items),
      ...profile.cvSkills.languages,
      ...profile.cvSkills.frameworks,
      ...profile.cvSkills.devTools,
    ].join(" ");

    for (const stale of dropped) {
      expect(everythingClaimed).not.toContain(stale);
      expect(prompt).not.toContain(stale);
    }
  });
});

describe("compensation source data", () => {
  // The rule "never state a figure" is only as good as the data behind it: if a number were added to
  // these fields it would be rendered straight into the prompt's PERSONAL INFORMATION block, and the
  // model could be coaxed into repeating it. Guard the data, not just the instruction.
  const CURRENCY_OR_AMOUNT =
    /[$₱€£]|\b\d[\d,.]*\s*[km]\b|\b(?:php|usd|pesos?)\b/i;

  it("keeps no salary figure in the data that feeds the prompt", () => {
    expect(profile.salaryExpectation).not.toMatch(CURRENCY_OR_AMOUNT);
  });

  it("keeps no freelance rate in the data that feeds the prompt", () => {
    expect(profile.freelanceNote).not.toMatch(CURRENCY_OR_AMOUNT);
  });

  // The page-action ids the model is offered must be exactly the ones the client accepts, or the
  // agent either invents targets the page drops or never uses ones it could.
  it("offers every page-action target the client accepts, and sits before the closing reminder", () => {
    const prompt = buildSystemPrompt();
    for (const p of ACTION_PROJECTS) {
      expect(PAGE_ACTIONS).toContain(`- ${p.id} (`);
    }
    for (const s of ACTION_SECTIONS) {
      expect(PAGE_ACTIONS).toContain(`- ${s.id} (`);
    }
    expect(prompt.indexOf("## SHOWING THE PROOF")).toBeGreaterThan(
      prompt.indexOf("## HOW I ANSWER")
    );
    expect(prompt.indexOf("## SHOWING THE PROOF")).toBeLessThan(
      prompt.indexOf("# REMINDER")
    );
  });

  // Groq's free tier refuses (HTTP 413) any request over 8,000 tokens per minute, and a request is
  // this prompt + up to 6 history messages + the 400-token reply budget. At ~4.3 characters per
  // token, 26,500 characters is ~6,100 tokens, which leaves room for that history. Measured
  // 2026-11-03: 26,143. If this fails, trim what goes INTO the prompt (see brief() in
  // system-prompt.ts) rather than raising the number, or the live chat starts failing again.
  it("stays inside the token budget a free-tier Groq request allows", () => {
    expect(buildSystemPrompt().length).toBeLessThan(26_500);
  });

  it("shortens a long decision to its opening sentence for the prompt", () => {
    const text = "The fix lives outside the model. Hooks record what ran. A gate compares.";
    expect(brief(text, 40)).toBe("The fix lives outside the model.");
    // Always keeps at least the first sentence, even one longer than the limit.
    expect(brief(text, 10)).toBe("The fix lives outside the model.");
    expect(brief(text)).toBe(text);
  });

  it("forbids directives on refusals", () => {
    expect(PAGE_ACTIONS).toContain("A refusal or an out-of-scope reply gets no directive.");
  });
});
