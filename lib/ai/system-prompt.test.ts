import { describe, expect, it } from "vitest";

import { profile } from "@/lib/data/profile";

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
