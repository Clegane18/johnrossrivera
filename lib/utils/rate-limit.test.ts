import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { rateLimit, type RateLimitEntry } from "@/lib/utils/rate-limit";

const MAX = 3;
const WINDOW = 60_000; // 1 minute

describe("rateLimit", () => {
  let store: Map<string, RateLimitEntry>;

  beforeEach(() => {
    store = new Map();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows the first request and decrements remaining", () => {
    const r = rateLimit(store, "1.1.1.1", MAX, WINDOW);
    expect(r.limited).toBe(false);
    expect(r.remaining).toBe(MAX - 1);
  });

  it("limits once the max is reached within the window", () => {
    for (let i = 0; i < MAX; i++) rateLimit(store, "1.1.1.1", MAX, WINDOW);
    const r = rateLimit(store, "1.1.1.1", MAX, WINDOW);
    expect(r.limited).toBe(true);
    expect(r.remaining).toBe(0);
    expect(r.minutesLeft).toBeGreaterThan(0);
  });

  it("resets after the window elapses", () => {
    for (let i = 0; i < MAX; i++) rateLimit(store, "1.1.1.1", MAX, WINDOW);
    expect(rateLimit(store, "1.1.1.1", MAX, WINDOW).limited).toBe(true);

    vi.advanceTimersByTime(WINDOW + 1);

    const r = rateLimit(store, "1.1.1.1", MAX, WINDOW);
    expect(r.limited).toBe(false);
    expect(r.remaining).toBe(MAX - 1);
  });

  it("tracks separate keys independently", () => {
    for (let i = 0; i < MAX; i++) rateLimit(store, "1.1.1.1", MAX, WINDOW);
    expect(rateLimit(store, "1.1.1.1", MAX, WINDOW).limited).toBe(true);
    expect(rateLimit(store, "2.2.2.2", MAX, WINDOW).limited).toBe(false);
  });

  it("evicts expired entries so the store cannot grow unbounded", () => {
    rateLimit(store, "1.1.1.1", MAX, WINDOW);
    expect(store.size).toBe(1);

    vi.advanceTimersByTime(WINDOW + 1);

    // A call for a different key triggers eviction of the expired one first.
    rateLimit(store, "2.2.2.2", MAX, WINDOW);
    expect(store.has("1.1.1.1")).toBe(false);
    expect(store.size).toBe(1);
  });
});
