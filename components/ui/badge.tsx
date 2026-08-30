import * as React from "react";

import { cn } from "@/lib/utils/cn";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "danger" | "neutral" | "success";
};

export function Badge({
  className,
  variant = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        variant === "neutral" && "border-foreground/15 bg-foreground/5 text-foreground/75",
        variant === "success" && "border-accent bg-accent/25 text-foreground",
        variant === "danger" && "border-danger/20 bg-danger/8 text-danger",
        className,
      )}
      {...props}
    />
  );
}
