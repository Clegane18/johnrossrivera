import { describe, expect, it } from "vitest";

import {
  ACTION_PROJECTS,
  ACTION_SECTIONS,
  MAX_ACTIONS,
  TOUR_EXPERIENCE,
  TOUR_WORK,
  actionLabel,
  applyIntent,
  detectIntent,
  parseAgentReply,
  tourStepInfo,
  visibleText,
} from "./page-actions";

describe("tours", () => {
  it("starts the full work or experience tour by name", () => {
    expect(parseAgentReply("Sure, here we go.\n<<tour work>>").tour).toEqual(TOUR_WORK);
    expect(parseAgentReply("Let's walk through it.\n<<tour experience>>").tour).toEqual(TOUR_EXPERIENCE);
    expect(TOUR_WORK.steps.length).toBeGreaterThanOrEqual(5);
    expect(TOUR_EXPERIENCE.steps[0]).toEqual({ kind: "experience", id: "crystal-vision" });
  });

  it("builds a custom tour from valid project ids only, for compare questions", () => {
    const { tour, actions } = parseAgentReply(
      "Here they are side by side.\n<<tour projects:provenly, kol-dashboard, made-up>>\n<<show section:contact>>"
    );
    expect(tour?.steps).toEqual([
      { kind: "project", id: "provenly" },
      { kind: "project", id: "kol-dashboard" },
    ]);
    // The tour drives the page, so one-off actions are dropped.
    expect(actions).toEqual([]);
  });

  it("does not make a tour out of a single valid project", () => {
    expect(parseAgentReply("x\n<<tour projects:provenly, nope>>").tour).toBeUndefined();
  });

  it("describes every step from the site's own data", () => {
    for (const step of [...TOUR_WORK.steps, ...TOUR_EXPERIENCE.steps]) {
      const info = tourStepInfo(step);
      expect(info.title.length).toBeGreaterThan(0);
      expect(info.line.length).toBeGreaterThan(0);
    }
  });
});

describe("intent", () => {
  it("recognises the guided requests a visitor types", () => {
    expect(detectIntent("Walk me through John's work")).toBe("tour-work");
    expect(detectIntent("can you take me through his projects one by one")).toBe("tour-work");
    expect(detectIntent("Walk me through his experience")).toBe("tour-experience");
    expect(detectIntent("Compare provenly and the KOL Dashboard")).toBe("compare");
    expect(detectIntent("Send an email to John about a NestJS role")).toBe("draft");
    expect(detectIntent("write him a message for me")).toBe("draft");
    expect(detectIntent("What's his strongest project?")).toBeNull();
    expect(detectIntent("Does he have NestJS experience?")).toBeNull();
  });

  it("starts the tour even when the model forgot the directive", () => {
    const reply = parseAgentReply("John has built a lot of things.\n<<show work>>");
    expect(applyIntent(reply, "tour-work", "walk me through his work").tour).toEqual(TOUR_WORK);
  });

  it("builds a compare tour from the projects the visitor named", () => {
    const reply = parseAgentReply("They differ in scope.");
    const { tour } = applyIntent(reply, "compare", "Compare provenly and the KOL Dashboard");
    expect(tour?.steps.map((s) => s.id).sort()).toEqual(["kol-dashboard", "provenly"]);
  });

  it("leaves a reply alone when the model already got it right", () => {
    const reply = parseAgentReply("Here.\n<<tour experience>>");
    expect(applyIntent(reply, "tour-work", "walk me through")).toBe(reply);
  });
});

describe("email drafts", () => {
  const reply =
    "Here's a draft. Add your name and email, then press Send.\n<<email>>\nHi John,\n\nI'm hiring a NestJS engineer and liked your Rola work. Are you open to a call this week?\n<</email>>";

  it("pulls the draft out and keeps it out of the chat text", () => {
    const { text, draft } = parseAgentReply(reply);
    expect(text).toBe("Here's a draft. Add your name and email, then press Send.");
    expect(draft).toContain("I'm hiring a NestJS engineer");
    expect(draft?.startsWith("Hi John")).toBe(true);
  });

  it("never shows a half-written draft while it streams", () => {
    for (let i = 1; i <= reply.length; i++) {
      expect(visibleText(reply.slice(0, i))).not.toMatch(/Hi John|<</);
    }
  });

  it("labels experience chips by role and company", () => {
    expect(actionLabel({ kind: "experience", id: "crystal-vision" })).toMatch(/^Showing .+Crystal Vision$/);
  });
});

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
