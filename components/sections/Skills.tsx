"use client";

import { siteConfig } from "@/config/site";
import { skills } from "@/lib/data/skills";
import { motion } from "framer-motion";
import {
  Bot,
  Code2,
  Cpu,
  Database,
  FileCode2,
  GitBranch,
  Layers,
  Network,
  Package,
  ScanSearch,
  Server,
  Shield,
  ShieldCheck,
  TestTube,
  Wrench,
  type LucideIcon,
} from "lucide-react";

const categoryIconMap: Record<string, LucideIcon> = {
  "Core Stack": Layers,
  "Data & APIs": Database,
  "Testing & Tooling": Wrench,
  "Engineering Leverage": Cpu,
};

const skillIconMap: Record<string, LucideIcon> = {
  TypeScript: Code2,
  React: Layers,
  "Next.js": Layers,
  NestJS: Server,
  "Node.js": Server,
  Laravel: Server,
  PHP: FileCode2,
  MySQL: Database,
  Prisma: Database,
  Sequelize: Database,
  REST: Network,
  "RTK Query": Network,
  JWT: Shield,
  RBAC: Shield,
  Jest: TestTube,
  Playwright: TestTube,
  Git: GitBranch,
  Docker: Package,
  "Agentic dev harness": Bot,
  "Automated code review": ScanSearch,
  "Test generation": TestTube,
  "Secret scanning": ShieldCheck,
};

function getSkillIcon(label: string): LucideIcon {
  return skillIconMap[label] ?? Code2;
}

const allItems = skills.flatMap((s) =>
  s.items.map((item) => ({
    label: item,
    Icon: getSkillIcon(item),
  }))
);

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export function Skills() {
  return (
    <section id="skills" className="section-padding bg-muted/40">
      <div className="section-container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 sm:mb-12 md:mb-14"
        >
          <h2 className="section-heading">{siteConfig.sectionLabels.skills}</h2>
        </motion.div>

        {/* Marquee strip.
            aria-hidden: this is a decorative restatement of the grid below, and the list is rendered
            TWICE inside it so the CSS translate can loop seamlessly. Exposed to assistive tech that
            meant every skill was announced three times before the grid was reached. The grid is the
            accessible source of truth. */}
        <div
          aria-hidden="true"
          className="relative mb-10 overflow-hidden border-y border-border py-3 sm:mb-12 sm:py-4 md:mb-14"
        >
          <div className="flex w-max animate-marquee items-center gap-10 hover:[animation-play-state:paused] motion-reduce:animate-none">
            {[...allItems, ...allItems].map(({ label, Icon }, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 whitespace-nowrap font-mono text-xs uppercase tracking-widest text-muted-foreground"
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Skills grid */}
        {/* Two columns, not three: four categories in a 3-col grid leave one orphaned on its own
            row, and the Engineering Leverage card carries a paragraph that needs the width. */}
        <motion.ul
          className="grid gap-4 sm:grid-cols-2"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {skills.map((skill) => (
            <motion.li key={skill.id} variants={itemVariants}>
              <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-4 inline-flex items-center gap-2">
                  {(() => {
                    const CategoryIcon =
                      categoryIconMap[skill.category] ?? Layers;
                    return (
                      <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                    );
                  })()}
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                    {skill.category}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skill.items.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-foreground"
                    >
                      {(() => {
                        const Icon = getSkillIcon(item);
                        return (
                          <Icon
                            className="h-3 w-3 text-muted-foreground"
                            aria-hidden="true"
                          />
                        );
                      })()}
                      {item}
                    </span>
                  ))}
                </div>
                {skill.note && (
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {skill.note}
                  </p>
                )}
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
