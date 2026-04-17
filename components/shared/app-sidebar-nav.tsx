"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";

type AppSidebarNavProps = {
  items: ReadonlyArray<{
    href: string;
    label: string;
  }>;
};

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebarNav({ items }: AppSidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {items.map((item) => {
        const isActive = isActivePath(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition",
              isActive
                ? "bg-white text-foreground shadow-[0_10px_24px_rgba(20,33,61,0.08)]"
                : "text-foreground/72 hover:bg-white hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
