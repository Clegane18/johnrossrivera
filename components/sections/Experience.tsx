import { ExperienceEntry } from "@/components/ui/ExperienceEntry";
import { Reveal } from "@/components/ui/Reveal";
import { siteConfig } from "@/config/site";
import { experiences } from "@/lib/data/experience";
import type { ExperienceGroup } from "@/types";

// Grouped rather than one sequence.
//
// Four entries previously ran as "Present" at once, three of them freelance or personal, which made
// a single timeline read as padding and buried the actual employment history. Splitting states what
// each entry is up front: a recruiter scanning for "where has he actually worked" finds it in the
// first group, and the personal work is clearly labelled rather than quietly implied to be a job.

const GROUP_ORDER: ExperienceGroup[] = ["work", "personal", "academic"];

const GROUP_LABEL: Record<ExperienceGroup, string> = {
  work: "Work",
  personal: "Personal projects",
  academic: "Academic",
};

// Reverse-chronological, with anything still running first.
//
// The list used to render in lib/data array order, which put RR Remo Trucking — freelance, two
// months, finished — above Crystal Vision, the full-time role that is still current. A recruiter
// reads the first entry under "Work" as the answer to "what is he doing now", so the top of the
// section said "a two-month contract that ended" about someone in a job. Deriving the order from
// the dates means adding the next role cannot reintroduce it.
function endedAt(endDate: string): number {
  if (/^present$/i.test(endDate.trim())) return Number.POSITIVE_INFINITY;
  const parsed = Date.parse(`1 ${endDate}`);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function Experience() {
  // One timestamp for the whole render, so every "Present" duration is measured against the same
  // moment and a re-render cannot produce two different answers on one page.
  const now = new Date();

  return (
    <section id="experience" className="section-padding">
      <div className="section-container">
        <Reveal className="mb-10 sm:mb-12 md:mb-14">
          <h2 className="section-heading">
            {siteConfig.sectionLabels.experience}
          </h2>
        </Reveal>

        <div className="flex flex-col gap-12 sm:gap-16">
          {GROUP_ORDER.map((group) => {
            // `hiddenOnPage` entries stay in lib/data for the chat but do not render here.
            const entries = experiences
              .filter((e) => e.group === group && !e.hiddenOnPage)
              .sort((a, b) => endedAt(b.endDate) - endedAt(a.endDate));

            // A group with no entries renders nothing — no empty heading when, say, the academic
            // entry is eventually retired.
            if (entries.length === 0) {
              return null;
            }

            return (
              <Reveal key={group} y={16}>
                <h3 className="mb-6 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {GROUP_LABEL[group]}
                </h3>

                <ol className="flex flex-col gap-10 sm:gap-12">
                  {entries.map((experience) => (
                    <ExperienceEntry
                      key={experience.id}
                      experience={experience}
                      now={now}
                    />
                  ))}
                </ol>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
