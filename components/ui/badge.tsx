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
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        variant === "neutral" && "bg-[#14213d]/8 text-[#14213d]",
        variant === "success" && "bg-[#0f766e]/12 text-[#0f766e]",
        variant === "danger" && "bg-[#b91c1c]/12 text-[#b91c1c]",
        className,
      )}
      {...props}
    />
  );
}
