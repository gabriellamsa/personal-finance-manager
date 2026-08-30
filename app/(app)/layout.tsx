import type { ReactNode } from "react";

import { AppSidebarNav } from "@/components/shared/app-sidebar-nav";
import { Logo } from "@/components/shared/logo";
import { SignOutButton } from "@/components/shared/sign-out-button";
import { requireCurrentUser } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/formatters/date";

type AppLayoutProps = {
  children: ReactNode;
};

const navigationItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/transactions", label: "Transactions" },
  { href: "/categories", label: "Categories" },
  { href: "/settings", label: "Settings" },
] as const;

export default async function AppLayout({ children }: AppLayoutProps) {
  const user = await requireCurrentUser();

  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border bg-card-strong lg:hidden">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <Logo />
          <div className="min-w-0 text-right">
            <p className="max-w-36 truncate text-xs font-semibold text-foreground">
              {user.name}
            </p>
            <p className="font-mono text-[10px] text-foreground/55">
              {user.currencyCode} / {user.timezone}
            </p>
          </div>
        </div>
        <AppSidebarNav items={navigationItems} variant="mobile" />
      </header>

      <div className="mx-auto grid min-h-screen max-w-[1440px] lg:grid-cols-[248px_1fr]">
        <aside className="hidden flex-col justify-between border-r border-border bg-card px-5 py-6 lg:sticky lg:top-0 lg:flex lg:h-screen">
          <div className="space-y-8">
            <Logo />

            <AppSidebarNav items={navigationItems} />
          </div>

          <div className="space-y-4 border-t border-border pt-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/42">
                Signed in as
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {user.name}
              </p>
              <p className="text-sm text-foreground/62">{user.email}</p>
              <p className="mt-2 font-mono text-xs text-foreground/62">
                {user.currencyCode} / {user.timezone}
              </p>
              <p className="mt-1 font-mono text-[11px] text-foreground/52">
                Current profile time: {formatDateTime(new Date(), user.timezone)}
              </p>
            </div>

            <SignOutButton />
          </div>
        </aside>

        <section className="min-w-0 bg-background px-4 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
          {children}

          <footer className="mt-10 flex items-center justify-between gap-4 border-t border-border pt-5 lg:hidden">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {user.name}
              </p>
              <p className="truncate text-xs text-foreground/55">{user.email}</p>
            </div>
            <SignOutButton />
          </footer>
        </section>
      </div>
    </main>
  );
}
