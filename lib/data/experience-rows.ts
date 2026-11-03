import { siteConfig } from "@/config/site";
import { experiences } from "@/lib/data/experience";

/**
 * The Experience section's rows, in display order: current role first, then by end date, newest
 * first, with education last. Shared by the section and by Nuggets' experience tour, so the tour can
 * never step through a list the page does not show.
 */
export interface ExperienceRow {
  id: string;
  year: string;
  title: string;
  org: string;
  meta: string;
  points: string[];
  tech: string[];
}

function sortKey(date: string): number {
  if (date === "Present") return Number.POSITIVE_INFINITY;
  const parsed = Date.parse(`1 ${date}`);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export const experienceRows: ExperienceRow[] = [
  ...experiences
    .filter((e) => !e.hiddenOnPage)
    .sort((a, b) => sortKey(b.endDate) - sortKey(a.endDate))
    .map((e) => ({
      id: e.id,
      year: e.endDate === "Present" ? "Now" : (e.startDate.split(" ").pop() ?? ""),
      title: e.role,
      org: e.company,
      meta: [
        e.employmentType,
        e.workMode,
        `${e.startDate} to ${e.endDate === "Present" ? "now" : e.endDate}`,
      ]
        .filter(Boolean)
        .join(" · "),
      points: e.highlights ?? e.description,
      tech: e.tech,
    })),
  {
    id: "education",
    year: siteConfig.education.years.split(" ")[0],
    title: siteConfig.education.degree.split(",")[0],
    org: siteConfig.education.school,
    meta: siteConfig.education.years.replace(" - ", " to "),
    points: [
      siteConfig.education.degree,
      `Coursework: ${siteConfig.education.coursework.join(", ")}.`,
    ],
    tech: [],
  },
];
