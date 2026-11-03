import { SectionHead } from "@/components/home/SectionHead";
import { skills } from "@/lib/data/skills";

export function StackList() {
  return (
    <section id="stack" className="pt-20 sm:pt-24">
      <SectionHead number="03" title="stack" />
      <div className="border-b border-border">
        {skills.map((skill) => (
          <div
            key={skill.id}
            className="grid gap-2 border-t border-border py-3.5 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-4"
          >
            <span className="pt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              {skill.category}
            </span>
            <div>
              <div className="flex flex-wrap gap-1.5">
                {skill.items.map((item) => (
                  <span
                    key={item}
                    className="whitespace-nowrap rounded-md border border-border px-2.5 py-1 font-mono text-xs text-muted-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>
              {skill.note && (
                <p className="mt-3 max-w-[620px] border-l border-border pl-3.5 text-sm leading-relaxed text-muted-foreground">
                  {skill.note}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
