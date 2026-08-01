import { describe, expect, it } from "vitest";

import { experiences } from "@/lib/data/experience";
import { profile } from "@/lib/data/profile";
import { projects } from "@/lib/data/projects";
import { skills } from "@/lib/data/skills";

import {
  ANSWER_RULES,
  PERSONA,
  SCOPE_CONTRACT,
  buildSystemPrompt,
} from "./system-prompt";

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
});
