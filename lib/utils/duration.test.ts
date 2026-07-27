import { describe, expect, it } from "vitest";

import { companyInitials, formatDuration, parseMonthYear } from "./duration";

// These render straight onto the page. A bad parse produces "NaN mos" next to a job title, which no
// type check or build catches — so the failure modes are pinned here instead.

const NOW = new Date(2026, 6, 27); // Jul 2026

describe("formatDuration", () => {
  it("matches the durations John gave for the short builds", () => {
    // He said RR Remo took ~1 month and Smart-lift ~1.5. Inclusive month counting is the CV
    // convention: May->Jun reads as 2 mos, Mar->Apr as 2 mos.
    expect(formatDuration("May 2026", "Jun 2026", NOW)).toBe("2 mos");
    expect(formatDuration("Mar 2026", "Apr 2026", NOW)).toBe("2 mos");
  });

  it("counts a single month as 1 mo, not 0", () => {
    expect(formatDuration("May 2026", "May 2026", NOW)).toBe("1 mo");
  });

  it("measures a Present role against the supplied date", () => {
    expect(formatDuration("Aug 2025", "Present", NOW)).toBe("1 yr");
  });

  it("combines years and months", () => {
    expect(formatDuration("Aug 2024", "Nov 2024", NOW)).toBe("4 mos");
    expect(formatDuration("Jan 2024", "Mar 2026", NOW)).toBe("2 yrs 3 mos");
  });

  it("returns null rather than NaN on unparseable input", () => {
    expect(formatDuration("sometime", "Jun 2026", NOW)).toBeNull();
    expect(formatDuration("May 2026", "not a date", NOW)).toBeNull();
    expect(formatDuration("", "", NOW)).toBeNull();
  });

  it("returns null when the end precedes the start", () => {
    expect(formatDuration("Jun 2026", "May 2026", NOW)).toBeNull();
  });
});

describe("parseMonthYear", () => {
  it("accepts short and long month names", () => {
    expect(parseMonthYear("Jan 2020")).toBe(2020 * 12);
    expect(parseMonthYear("January 2020")).toBe(2020 * 12);
    expect(parseMonthYear("dec 2020")).toBe(2020 * 12 + 11);
  });

  it("rejects malformed values", () => {
    for (const bad of ["2020", "Xyz 2020", "Jan", "Jan 20", ""]) {
      expect(parseMonthYear(bad)).toBeNull();
    }
  });
});

describe("companyInitials", () => {
  it("takes the first letter of the first two words", () => {
    expect(companyInitials("RR Remo Trucking")).toBe("RR");
    expect(companyInitials("Crystal Vision")).toBe("CV");
    expect(companyInitials("G&F Auto Supply")).toBe("GA");
  });

  it("falls back to two letters for a single word", () => {
    expect(companyInitials("Shopee")).toBe("SH");
  });

  it("never returns an empty string", () => {
    expect(companyInitials("")).toBe("?");
    expect(companyInitials("   ")).toBe("?");
  });
});
