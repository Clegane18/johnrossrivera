"use client";

import { cn } from "@/lib/utils/cn";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "gold";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
          {
            "rounded-full bg-foreground text-background hover:opacity-80":
              variant === "primary" || variant === "gold",
            "rounded-full border border-foreground bg-transparent text-foreground hover:bg-muted":
              variant === "secondary",
            "rounded-md hover:bg-muted hover:text-foreground":
              variant === "ghost",
          },
          {
            "h-9 px-4 text-sm": size === "sm",
            "h-10 px-5 py-2 text-sm": size === "md",
            "h-11 px-8 text-base": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
