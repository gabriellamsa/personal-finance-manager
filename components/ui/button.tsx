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
          "inline-flex min-h-10 items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/25 disabled:cursor-not-allowed disabled:opacity-60",
          variant === "primary" &&
            "bg-accent text-accent-foreground hover:bg-[#f4c451]",
          variant === "secondary" &&
            "border border-foreground/25 bg-transparent text-foreground hover:bg-foreground hover:text-white",
          variant === "ghost" &&
            "text-foreground/70 hover:bg-foreground/7 hover:text-foreground",
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
