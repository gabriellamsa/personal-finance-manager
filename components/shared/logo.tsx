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
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#14213d] text-sm font-bold text-white shadow-[0_10px_24px_rgba(20,33,61,0.25)]">
        PF
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground/45">
          Finance
        </span>
        <span className="text-base font-semibold">Personal Finance</span>
      </span>
    </Link>
  );
}
