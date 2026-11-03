import { ContactPanel } from "@/components/home/ContactPanel";
import { ExperienceList } from "@/components/home/ExperienceList";
import { HeroIntro } from "@/components/home/HeroIntro";
import { OpenSourceCard } from "@/components/home/OpenSourceCard";
import { ProofGrid } from "@/components/home/ProofGrid";
import { StackList } from "@/components/home/StackList";
import { WorkDeck } from "@/components/home/WorkDeck";

export default function Home() {
  return (
    <div className="relative">
      {/* Faint dot grid in the top-right corner, fading out. Decorative only. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 h-[520px] w-[280px] [background-image:radial-gradient(var(--border)_1px,transparent_1.2px)] [background-size:12px_12px] [mask-image:radial-gradient(ellipse_at_top_right,#000_10%,transparent_70%)]"
      />
      <div className="relative mx-auto max-w-[816px] px-4 pb-24 sm:px-12">
        <HeroIntro />
        <ProofGrid />
        <WorkDeck />
        <ExperienceList />
        <StackList />
        <OpenSourceCard />
        <ContactPanel />
      </div>
    </div>
  );
}
