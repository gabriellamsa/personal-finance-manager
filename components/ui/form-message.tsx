import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type FormMessageProps = {
  children: ReactNode;
  tone?: "error" | "info" | "success";
  className?: string;
};

export function FormMessage({
  children,
  className,
  tone = "info",
}: FormMessageProps) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      aria-live="polite"
      className={cn(
        "rounded-2xl border px-4 py-3 text-sm",
        tone === "error" && "border-danger/20 bg-danger/8 text-danger",
        tone === "info" && "border-border bg-white/80 text-foreground/72",
        tone === "success" && "border-accent/18 bg-accent/8 text-accent",
        className,
      )}
    >
      {children}
    </div>
  );
}
