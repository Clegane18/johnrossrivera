import { describe, expect, it } from "vitest";

import { chatFallback } from "./chat-fallback";

// The behaviour that matters on a hiring artifact: when the chat cannot answer, a recruiter must
// still be handed a route to John. These tests pin WHICH failures offer that route, because getting
// it wrong is silent — the chat still "works", it just quietly stops converting.

describe("chatFallback", () => {
  it("offers the email route when the chat is out of budget (429)", () => {
    const f = chatFallback(429);

    expect(f.showContact).toBe(true);
    expect(f.canRetry).toBe(true);
  });

  it("offers the email route when the server is at fault (5xx)", () => {
    for (const status of [500, 502, 503]) {
      expect(chatFallback(status).showContact).toBe(true);
    }
  });

  it("does NOT push email for a rejected message (400) — the chat still works", () => {
    const f = chatFallback(400);

    expect(f.showContact).toBe(false);
    expect(f.canRetry).toBe(true);
  });

  it("treats a null status as a connection problem, not an outage", () => {
    const f = chatFallback(null);

    expect(f.showContact).toBe(false);
    expect(f.message).toMatch(/connection/i);
  });

  it("prefers the server's own message when it sends one", () => {
    const f = chatFallback(429, "🐾 Nuggets is catching her breath!");

    expect(f.message).toBe("🐾 Nuggets is catching her breath!");
  });

  it("never shows the API's developer copy for a rejected message", () => {
    // The real 400 body is `{"message":"Validation failed.","errors":[…Zod issues…]}`. Only the 429
    // responses are written for a visitor to read, so 400 copy must come from here, not the server.
    // Reachable in normal use: paste over the 2000-character cap.
    const f = chatFallback(400, "Validation failed.");

    expect(f.message).not.toBe("Validation failed.");
    expect(f.message).not.toMatch(/validation|invalid request/i);
  });

  it("still produces a message when the server sends none", () => {
    for (const status of [400, 429, 500, null]) {
      const f = chatFallback(status, null);

      expect(f.message.length).toBeGreaterThan(0);
    }
  });

  it("never leaks a raw status code or stack trace to the visitor", () => {
    for (const status of [400, 429, 500, 502, null]) {
      const { message } = chatFallback(status, null);

      expect(message).not.toMatch(/\b[45]\d{2}\b/);
      expect(message).not.toMatch(/error:|stack|undefined|null/i);
    }
  });

  it("does not let a server message suppress the email route on an outage", () => {
    // The server controls the copy, but NOT whether the escape hatch renders. Otherwise a reworded
    // 429 body could quietly remove the only conversion path left during an outage.
    expect(chatFallback(429, "anything at all").showContact).toBe(true);
    expect(chatFallback(500, "anything at all").showContact).toBe(true);
  });
});
