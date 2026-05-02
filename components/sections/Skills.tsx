"use client";

import { siteConfig } from "@/config/site";
import { skills } from "@/lib/data/skills";
import { motion } from "framer-motion";
import {
  Braces,
  Code2,
  Coffee,
  Cpu,
  Database,
  FileCode2,
  FlaskConical,
  GitBranch,
  Layers,
  Monitor,
  Network,
  Package,
  Palette,
  Server,
  Shield,
  Terminal,
  TestTube,
  Wrench,
  type LucideIcon,
} from "lucide-react";

const categoryIconMap: Record<string, LucideIcon> = {
  Languages: Braces,
  Frameworks: Layers,
  "Dev Tools": Wrench,
};

const skillIconMap: Record<string, LucideIcon> = {
  JavaScript: FileCode2,
  TypeScript: Code2,
  Java: Coffee,
  SQL: Database,
  HTML: Braces,
  CSS: Palette,
  PHP: FileCode2,
  React: Layers,
  "Next.js": Layers,
  Angular: Layers,
  "Moleculer.js": Network,
  Laravel: Server,
  "Tailwind CSS": Palette,
  "Node.js": Server,
  "Express.js": Server,
  "Laravel (Blade)": Server,
  NestJS: Server,
  "Redux Toolkit": Layers,
  "RTK Query": Network,
  Sequelize: Database,
  Prisma: Database,
  "Passport.js": Shield,
  Jest: TestTube,
  Playwright: TestTube,
  Pest: FlaskConical,
  PHPUnit: TestTube,
  Git: GitBranch,
  GitHub: GitBranch,
  Bash: Terminal,
  "Visual Studio Code": Monitor,
  Jira: Package,
  Docker: Package,
  Postman: Network,
  DevOps: Cpu,
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

        {/* Marquee strip */}
        <div className="relative mb-10 overflow-hidden border-y border-border py-3 sm:mb-12 sm:py-4 md:mb-14">
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
        <motion.ul
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
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
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
