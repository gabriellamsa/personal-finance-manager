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
    <main className="min-h-screen px-6 py-8 sm:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="flex flex-col justify-between rounded-[32px] border border-border bg-card p-6 shadow-[0_20px_60px_rgba(20,33,61,0.08)] backdrop-blur">
          <div className="space-y-8">
            <Logo />

            <AppSidebarNav items={navigationItems} />
          </div>

          <div className="space-y-4 rounded-[24px] border border-border bg-white/70 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/42">
                Signed in as
              </p>
              <p className="mt-2 text-base font-semibold text-foreground">
                {user.name}
              </p>
              <p className="text-sm text-foreground/62">{user.email}</p>
              <p className="mt-2 text-sm text-foreground/62">
                {user.currencyCode} / {user.timezone}
              </p>
              <p className="text-xs text-foreground/52">
                Current profile time: {formatDateTime(new Date(), user.timezone)}
              </p>
            </div>

            <SignOutButton />
          </div>
        </aside>

        <section className="rounded-[32px] border border-border bg-card p-6 shadow-[0_20px_60px_rgba(20,33,61,0.08)] backdrop-blur sm:p-8">
          {children}
        </section>
      </div>
    </main>
  );
}
