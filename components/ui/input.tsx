import * as React from "react";

import { cn } from "@/lib/utils/cn";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-lg border border-border bg-card-strong px-3.5 text-sm text-foreground outline-none transition placeholder:text-foreground/35 focus:border-foreground/45 focus:ring-2 focus:ring-accent/45",
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";
