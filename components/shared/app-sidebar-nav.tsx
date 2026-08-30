"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";

type AppSidebarNavProps = {
  items: ReadonlyArray<{
    href: string;
    label: string;
  }>;
  variant?: "mobile" | "sidebar";
};

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebarNav({
  items,
  variant = "sidebar",
}: AppSidebarNavProps) {
  const pathname = usePathname();
  const isMobile = variant === "mobile";

  return (
    <nav
      aria-label={isMobile ? "Mobile navigation" : "Primary navigation"}
      className={isMobile ? "grid grid-cols-4" : "space-y-1"}
    >
      {items.map((item) => {
        const isActive = isActivePath(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex min-w-0 items-center justify-center font-medium transition-colors",
              isMobile
                ? "border-b-2 px-1 py-3 text-[11px] sm:text-xs"
                : "justify-between rounded-lg border-l-2 px-3 py-2.5 text-sm",
              isActive && isMobile && "border-accent bg-accent/12 text-foreground",
              !isActive && isMobile &&
                "border-transparent text-foreground/60 hover:bg-foreground/5 hover:text-foreground",
              isActive && !isMobile &&
                "border-accent bg-accent/18 text-foreground",
              !isActive && !isMobile &&
                "border-transparent text-foreground/65 hover:bg-foreground/5 hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
