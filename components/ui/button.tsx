import * as React from "react";

import { cn } from "@/lib/utils/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "ghost" | "primary" | "secondary";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, type = "button", variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-60",
          variant === "primary" &&
            "bg-accent text-accent-foreground shadow-[0_12px_30px_rgba(15,118,110,0.18)] hover:bg-[#0c635d]",
          variant === "secondary" &&
            "border border-border bg-card-strong text-foreground hover:bg-white",
          variant === "ghost" &&
            "text-foreground/72 hover:bg-white/60 hover:text-foreground",
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
