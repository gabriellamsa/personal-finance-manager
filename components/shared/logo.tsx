import Link from "next/link";

import { cn } from "@/lib/utils/cn";

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-3 text-foreground", className)}
    >
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-xs font-bold tracking-tight text-accent">
        PF
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-foreground/45">
          Finance
        </span>
        <span className="mt-1 text-sm font-semibold tracking-[-0.01em]">Personal Finance</span>
      </span>
    </Link>
  );
}
