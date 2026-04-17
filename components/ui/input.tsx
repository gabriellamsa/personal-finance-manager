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
        "flex h-12 w-full rounded-2xl border border-border bg-white/80 px-4 text-sm text-foreground outline-none transition placeholder:text-foreground/34 focus:border-accent/40 focus:ring-4 focus:ring-accent/12",
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";
