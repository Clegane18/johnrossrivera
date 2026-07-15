import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { projects } from "@/lib/data/projects";

// Derived from lib/data — every project with case-study content has a /work/[slug] page
// (see app/work/[slug]/page.tsx: caseStudies = projects.filter(p => p.problem)).
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;

  const caseStudies: MetadataRoute.Sitemap = projects
    .filter((p) => Boolean(p.problem))
    .map((p) => ({
      url: `${base}/work/${p.id}`,
      changeFrequency: "monthly",
      priority: 0.8,
    }));

  return [
    { url: base, changeFrequency: "monthly", priority: 1 },
    ...caseStudies,
  ];
}
