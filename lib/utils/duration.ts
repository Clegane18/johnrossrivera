// Duration formatting for the experience timeline.
//
// Pure and exported so the gate can test it: the dates in lib/data are written as "May 2026", and a
// silent parse failure here would render "NaN mos" on the page without breaking a build or a type.

const MONTHS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

/** Parse "May 2026" into a comparable month index. Returns null on anything unexpected. */
export function parseMonthYear(value: string): number | null {
  const match = /^([A-Za-z]{3,})\s+(\d{4})$/.exec(value.trim());

  if (!match) {
    return null;
  }

  const month = MONTHS.indexOf(match[1].slice(0, 3).toLowerCase());

  if (month === -1) {
    return null;
  }

  return Number(match[2]) * 12 + month;
}

/**
 * "May 2026" + "Jun 2026" -> "2 mos". Inclusive of both endpoints, which is the convention every
 * CV and LinkedIn profile uses — a role spanning Jan to Feb reads as 2 months, not 1.
 *
 * `now` is injected rather than read from the clock so the output is deterministic and testable;
 * the caller passes today's date for a "Present" role.
 */
export function formatDuration(
  startDate: string,
  endDate: string,
  now: Date
): string | null {
  const start = parseMonthYear(startDate);

  const end =
    endDate === "Present"
      ? now.getFullYear() * 12 + now.getMonth()
      : parseMonthYear(endDate);

  if (start === null || end === null || end < start) {
    return null;
  }

  const months = end - start + 1;
  const years = Math.floor(months / 12);
  const rest = months % 12;

  const parts: string[] = [];

  if (years > 0) {
    parts.push(`${years} yr${years === 1 ? "" : "s"}`);
  }

  if (rest > 0 || years === 0) {
    parts.push(`${rest} mo${rest === 1 ? "" : "s"}`);
  }

  return parts.join(" ");
}

/** "RR Remo Trucking" -> "RR". Avatar initials, so no logo assets are needed. */
export function companyInitials(company: string): string {
  const words = company
    .replace(/[^A-Za-z0-9&\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "?";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return (words[0][0] + words[1][0]).toUpperCase();
}
