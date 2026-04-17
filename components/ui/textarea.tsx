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
        "flex min-h-28 w-full rounded-2xl border border-border bg-white/80 px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-foreground/34 focus:border-accent/40 focus:ring-4 focus:ring-accent/12",
        className,
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
