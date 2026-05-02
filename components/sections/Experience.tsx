"use client";

import { siteConfig } from "@/config/site";
import { experiences } from "@/lib/data/experience";
import { motion } from "framer-motion";
import {
  Code2,
  Database,
  Layers,
  Network,
  Server,
  Shield,
  TestTube,
  type LucideIcon,
} from "lucide-react";

const techIconMap: Record<string, LucideIcon> = {
  TypeScript: Code2,
  "Next.js": Layers,
  "Next.js 16": Layers,
  "React 19": Layers,
  "Node.js": Server,
  "NestJS 11": Server,
  "Express.js": Server,
  MySQL: Database,
  PostgreSQL: Database,
  Sequelize: Database,
  Prisma: Database,
  JWT: Shield,
  RBAC: Shield,
  "RTK Query": Network,
  Jest: TestTube,
  Playwright: TestTube,
};

function getTechIcon(label: string): LucideIcon {
  return techIconMap[label] ?? Code2;
}

export function Experience() {
  return (
    <section id="experience" className="section-padding">
      <div className="section-container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 sm:mb-12 md:mb-14"
        >
          <h2 className="section-heading">
            {siteConfig.sectionLabels.experience}
          </h2>
        </motion.div>

        {/* Timeline */}
        <ol className="relative flex flex-col gap-8 border-l border-border pl-6 sm:gap-10 sm:pl-8">
          {experiences.map((exp, index) => (
            <motion.li
              key={exp.id}
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {/* Timeline dot */}
              <span className="absolute -left-[1.65rem] top-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-foreground bg-background sm:-left-10">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
              </span>

              <div className="mb-3 flex flex-col gap-1">
                <span className="font-mono text-xs tracking-wider text-muted-foreground">
                  {exp.startDate} &mdash; {exp.endDate}
                </span>
                <h3 className="font-display text-lg font-semibold text-foreground sm:text-xl">
                  {exp.role}
                </h3>
                <p className="text-sm font-medium text-muted-foreground">
                  {exp.company}
                </p>
              </div>

              <ul className="mb-4 flex flex-col gap-1.5">
                {exp.description.map((point, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-sm text-muted-foreground"
                  >
                    <span className="bg-foreground/40 mt-2 h-1 w-1 shrink-0 rounded-full" />
                    {point}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-2">
                {exp.tech.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-muted-foreground"
                  >
                    {(() => {
                      const Icon = getTechIcon(t);
                      return <Icon className="h-3 w-3" aria-hidden="true" />;
                    })()}
                    {t}
                  </span>
                ))}
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
