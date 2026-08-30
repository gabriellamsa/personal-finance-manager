import * as React from "react";

import { cn } from "@/lib/utils/cn";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-lg border border-border bg-card-strong px-3.5 text-sm text-foreground outline-none transition focus:border-foreground/45 focus:ring-2 focus:ring-accent/45",
        className,
      )}
      {...props}
    />
  );
});

Select.displayName = "Select";
