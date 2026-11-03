import type { ReactNode } from "react";

/** "01 — work" heading used by every home section, with an optional control on the right. */
export function SectionHead({
  number,
  title,
  aside,
}: {
  number: string;
  title: string;
  aside?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-baseline justify-between gap-4">
      <h2 className="font-mono text-[13.5px] font-normal text-muted-foreground">
        <span className="text-foreground">{number}</span> — {title}
      </h2>
      {aside}
    </div>
  );
}
