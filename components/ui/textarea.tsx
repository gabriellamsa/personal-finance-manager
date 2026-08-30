import * as React from "react";

import { cn } from "@/lib/utils/cn";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-28 w-full rounded-lg border border-border bg-card-strong px-3.5 py-3 text-sm text-foreground outline-none transition placeholder:text-foreground/35 focus:border-foreground/45 focus:ring-2 focus:ring-accent/45",
        className,
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
