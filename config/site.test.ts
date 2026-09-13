import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { siteConfig } from "@/config/site";
import { buildSystemPrompt, ANSWER_RULES } from "@/lib/ai/system-prompt";
import { experiences } from "@/lib/data/experience";
import { profile } from "@/lib/data/profile";
import { projects } from "@/lib/data/projects";
import { skills } from "@/lib/data/skills";

// The hero's stack row is the one place the fold states a technology. It is a POINTER to
// lib/data/skills.ts, not a second list, for the same reason siteConfig.heroMetrics links each
// tile to the case study behind it: a claim in the fold that the section below does not repeat is
// a claim a reader can catch out. These tests are what make "subset" true rather than intended.
describe("heroStack is a pointer to the skills list, not a second copy", () => {
  const everySkill = new Set(skills.flatMap((group) => group.items));

  it("features only technologies the Skills section also lists", () => {
    for (const tech of siteConfig.heroStack) {
      expect(
        everySkill.has(tech),
        `heroStack lists "${tech}", which is absent from lib/data/skills.ts. Add it to a skills group or drop it from the hero.`
      ).toBe(true);
    }
  });

  it("stays short enough to read as chosen", () => {
    // Every source on portfolio heroes lands on the same number: past roughly eight entries a
    // stack list stops reading as a shortlist and starts reading as everything the author has
    // ever opened. The cap is here so a later edit has to argue with a failing test.
    expect(siteConfig.heroStack.length).toBeLessThanOrEqual(8);
    expect(siteConfig.heroStack.length).toBeGreaterThan(0);
  });

  it("has no duplicates", () => {
    expect(new Set(siteConfig.heroStack).size).toBe(siteConfig.heroStack.length);
  });
});

// One copy of the availability sentence, read by the navbar label AND the hero role card. It used
// to live under siteConfig.navbar, where the hero could not reach it without a second copy.
describe("availability is stated once", () => {
  it("is a top-level config value", () => {
    expect(siteConfig.availability).toBeTruthy();
  });

  it("is no longer duplicated under navbar", () => {
    expect(siteConfig.navbar).not.toHaveProperty("availabilityText");
  });
});

// Em dashes read as machine-written in 2026, and this site's whole argument is that a person
// built it. Serializing the exported objects checks the STRINGS a visitor can actually read while
// ignoring the source comments around them, so this cannot be satisfied by reformatting a comment.
describe("no em dashes in visitor-facing copy", () => {
  const surfaces: [string, unknown][] = [
    ["config/site.ts", siteConfig],
    ["lib/data/profile.ts", profile],
    ["lib/data/projects.ts", projects],
    ["lib/data/experience.ts", experiences],
    ["lib/data/skills.ts", skills],
  ];

  for (const [name, value] of surfaces) {
    it(`${name} is free of em dashes`, () => {
      const json = JSON.stringify(value);
      const at = json.indexOf("—");
      const context = at === -1 ? "" : json.slice(Math.max(0, at - 90), at + 40);
      expect(at, `em dash in ${name} near: ...${context}`).toBe(-1);
    });
  }

  // The hole this test exists to close. The check above serializes the exported data objects, which
  // covers every string in config/ and lib/data/ and NOTHING written directly into JSX. Two em
  // dashes were sitting in components as the HTML entity `&mdash;` (a visible date range in
  // ExperienceEntry and the chat widget's tooltip), so they were neither the U+2014 character a
  // grep would find nor a value any exported object holds. They survived the sweep, this file's
  // first version, lint, and 91 passing tests, and were caught only by curling the rendered page.
  //
  // Scanning source text rather than data is what makes the entity form reachable at all. It stays
  // limited to entities on purpose: raw em dashes are still legitimate in the ~213 source COMMENTS,
  // so asserting on the character here would fail on all of them, while an entity has no reason to
  // exist in this codebase at any time.
  it("no HTML-entity em dashes anywhere in app or component source", () => {
    const roots = ["app", "components", "lib", "hooks", "config", "types"];
    const entities = ["&mdash;", "&#8212;", "&#x2014;"];
    const offenders: string[] = [];

    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(path);
          continue;
        }
        // Test files are excluded, and must be: this very file has to name the entities in
        // order to search for them, so including it would make the test fail on its own source.
        // Nothing in a *.test.ts file is shipped to a visitor either way.
        if (!/\.(ts|tsx|css)$/.test(entry.name)) continue;
        if (/\.test\.(ts|tsx)$/.test(entry.name)) continue;
        const text = readFileSync(path, "utf8");
        text.split("\n").forEach((line, i) => {
          for (const entity of entities) {
            if (line.includes(entity)) offenders.push(`${path}:${i + 1} ${entity}`);
          }
        });
      }
    };

    for (const root of roots) walk(root);
    expect(offenders, `entity em dash at:\n${offenders.join("\n")}`).toEqual([]);
  });

  // The chat is the one surface that writes its own prose, so the prompt has to carry the rule
  // rather than merely obey it. Both halves are asserted, and the rule is deliberately phrased
  // WITHOUT the character it forbids: a model imitates the punctuation of its own prompt, so
  // spelling the glyph out here would be the one place on the site still demonstrating it.
  it("the system prompt neither uses nor permits an em dash", () => {
    expect(buildSystemPrompt()).not.toContain("—");
    expect(ANSWER_RULES).toContain("Never use an em dash");
  });
});
