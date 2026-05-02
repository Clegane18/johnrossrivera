import { cn } from "@/lib/utils/cn";
import { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "card-hover-glow rounded-2xl border border-border bg-card text-card-foreground shadow-sm transition-shadow duration-300 hover:shadow-md",
        className
      )}
      {...props}
    />
  );
}

type CardContentProps = HTMLAttributes<HTMLDivElement>;

export function CardContent({ className, ...props }: CardContentProps) {
  return <div className={cn("p-6", className)} {...props} />;
}
