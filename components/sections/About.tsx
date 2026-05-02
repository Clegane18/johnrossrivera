"use client";

import { siteConfig } from "@/config/site";
import { motion } from "framer-motion";
import { MapPin, BookOpen } from "lucide-react";

const smoothEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function About() {
  return (
    <section id="about" className="section-padding">
      <div className="section-container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 sm:mb-12 md:mb-14"
        >
          <h2 className="section-heading">{siteConfig.sectionLabels.about}</h2>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
          {/* Bio */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: smoothEase }}
            className="flex flex-col gap-6"
          >
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              {siteConfig.about.bio}
            </p>
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0 text-foreground" />
              <span>{siteConfig.about.location}</span>
            </div>
          </motion.div>

          {/* Education card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: smoothEase }}
          >
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <BookOpen className="h-5 w-5 text-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                    Education
                  </p>
                  <p className="mt-1.5 font-display font-semibold text-foreground">
                    {siteConfig.education.degree}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {siteConfig.education.school}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    {siteConfig.education.years}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {siteConfig.education.coursework.map((course) => (
                      <span
                        key={course}
                        className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground"
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
