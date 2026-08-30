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
        "rounded-lg border px-4 py-3 text-sm",
        tone === "error" && "border-danger/20 bg-danger/8 text-danger",
        tone === "info" && "border-border bg-foreground/3 text-foreground/72",
        tone === "success" && "border-accent bg-accent/20 text-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}
