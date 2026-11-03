import { describe, expect, it } from "vitest";

import {
  ACTION_PROJECTS,
  ACTION_SECTIONS,
  MAX_ACTIONS,
  actionLabel,
  parseAgentReply,
  visibleText,
} from "./page-actions";

describe("parseAgentReply", () => {
  it("returns the answer without its directives, plus the actions to run", () => {
    const raw =
      "John built the admin console solo.\n<<show project:rola-access-platform>>";
    expect(parseAgentReply(raw)).toEqual({
      text: "John built the admin console solo.",
      actions: [{ kind: "project", id: "rola-access-platform" }],
    });
  });

  it("drops an id that is not on the page, so a hallucinated target does nothing", () => {
    const { text, actions } = parseAgentReply(
      "Sure.\n<<show project:voting-engine>>\n<<show section:about>>"
    );
    expect(actions).toEqual([]);
    expect(text).toBe("Sure.");
  });

  it(`runs at most ${MAX_ACTIONS} actions and ignores duplicates`, () => {
    const { actions } = parseAgentReply(
      [
        "Answer.",
        "<<show section:contact>>",
        "<<show section:contact>>",
        "<<show project:provenly>>",
        "<<show section:stack>>",
      ].join("\n")
    );
    expect(actions).toEqual([
      { kind: "section", id: "contact" },
      { kind: "project", id: "provenly" },
    ]);
  });

  it("tolerates spacing and case the model may vary", () => {
    const { actions } = parseAgentReply("Ok.\n<< Show Section : Contact >>");
    expect(actions).toEqual([{ kind: "section", id: "contact" }]);
  });
});

describe("visibleText", () => {
  it("hides a directive that has only partly arrived", () => {
    expect(visibleText("John wrote it.\n<<show proj")).toBe("John wrote it.");
    expect(visibleText("John wrote it.\n<")).toBe("John wrote it.");
  });

  it("hides malformed directives too, so they never show as text", () => {
    expect(visibleText("Done.\n<<open the deck please>>")).toBe("Done.");
  });

  it("only grows by appending as a reply streams in, so the chat can type out the difference", () => {
    const reply =
      "He closed a fail-open guard on 115 of 123 endpoints.\n<<show project:rola-access-platform>>\n<<show section:contact>>";
    let shown = "";
    for (let i = 1; i <= reply.length; i++) {
      const visible = visibleText(reply.slice(0, i));
      // Every visible string extends what was already shown (allowing a held-back trailing space).
      expect(visible.startsWith(shown.trimEnd())).toBe(true);
      shown = visible;
    }
    expect(shown).toBe("He closed a fail-open guard on 115 of 123 endpoints.");
  });
});

describe("action targets", () => {
  it("offers every rail section and every project the deck shows", () => {
    expect(ACTION_SECTIONS.map((s) => s.id)).toContain("contact");
    expect(ACTION_PROJECTS.map((p) => p.id)).toContain("rola-access-platform");
    expect(ACTION_PROJECTS.length).toBeGreaterThan(0);
  });

  it("labels a chip by what the visitor sees, not by id", () => {
    expect(actionLabel({ kind: "project", id: "pedia-dental" })).toBe(
      "Showing Primolar"
    );
    expect(actionLabel({ kind: "section", id: "open-source" })).toBe(
      "Showing open source"
    );
  });
});
