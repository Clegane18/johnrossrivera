import { cn } from "@/lib/utils/cn";
import { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "tech";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        {
          "bg-foreground text-background": variant === "default",
          "border border-foreground text-foreground": variant === "outline",
          "hover:border-foreground/40 border border-border font-mono tracking-wide text-muted-foreground":
            variant === "tech",
        },
        className
      )}
      {...props}
    />
  );
}
