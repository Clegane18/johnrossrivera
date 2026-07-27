import { describe, expect, it } from "vitest";

import { getShortcutLabel, isTypingTarget } from "./useCommandPalette";

// The hook itself needs a DOM and is not covered here. These two pure helpers carry the parts that
// break silently: a platform check that gets it backwards looks fine in review, and a typing guard
// that misfires steals keystrokes from the contact form without throwing anything.

describe("getShortcutLabel", () => {
  it("shows the Command glyph on Apple platforms", () => {
    for (const platform of ["MacIntel", "iPhone", "iPad", "MacARM"]) {
      expect(getShortcutLabel(platform)).toBe("⌘K");
    }
  });

  it("shows Ctrl everywhere else — a Windows visitor has no ⌘ key", () => {
    for (const platform of ["Win32", "Linux x86_64", ""]) {
      expect(getShortcutLabel(platform)).toBe("Ctrl K");
    }
  });
});

describe("isTypingTarget", () => {
  // Plain objects, not real elements: the vitest environment is "node" (see vitest.config.ts), so
  // there is no DOM here. isTypingTarget is duck-typed precisely so it can be tested without one.
  const el = (tagName: string, isContentEditable = false) =>
    ({ tagName, isContentEditable }) as unknown as EventTarget;

  it("leaves keystrokes alone while the user is typing", () => {
    expect(isTypingTarget(el("INPUT"))).toBe(true);
    expect(isTypingTarget(el("TEXTAREA"))).toBe(true);
    expect(isTypingTarget(el("SELECT"))).toBe(true);
    expect(isTypingTarget(el("DIV", true))).toBe(true);
  });

  it("claims the shortcut everywhere else", () => {
    expect(isTypingTarget(el("DIV"))).toBe(false);
    expect(isTypingTarget(el("BUTTON"))).toBe(false);
    expect(isTypingTarget(el("BODY"))).toBe(false);
  });

  it("does not throw on a null or non-element target", () => {
    expect(isTypingTarget(null)).toBe(false);
    expect(isTypingTarget({} as EventTarget)).toBe(false);
  });
});
