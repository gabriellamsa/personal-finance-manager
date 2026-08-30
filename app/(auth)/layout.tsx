import type { ReactNode } from "react";

import { Logo } from "@/components/shared/logo";
import { redirectIfAuthenticated } from "@/lib/auth/session";

type AuthLayoutProps = {
  children: ReactNode;
};

export default async function AuthLayout({ children }: AuthLayoutProps) {
  await redirectIfAuthenticated();

  return (
    <main className="min-h-screen bg-card-strong">
      <div className="mx-auto grid min-h-screen max-w-[1440px] lg:grid-cols-[0.85fr_1.15fr]">
        <section className="flex flex-col justify-between gap-12 bg-foreground px-6 py-8 text-white sm:px-10 lg:px-14 lg:py-12">
          <div className="space-y-6">
            <Logo className="text-white" />
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/55">
                Secure personal finance foundation
              </p>
              <h1 className="max-w-lg text-4xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-5xl">
                A clean entry point into your financial operating system.
              </h1>
              <p className="max-w-md text-base text-white/72">
                The account flow is already wired to validation, hashing,
                persistent users, and signed session cookies.
              </p>
            </div>
          </div>

          <div className="grid gap-0 border-t border-white/15">
            <div className="border-b border-white/15 py-4 text-sm text-white/72">
              Built with Next.js 16, Prisma, Zod, React Hook Form, and a custom
              JWT session layer.
            </div>
            <div className="border-b border-white/15 py-4 text-sm text-white/72">
              Already connected to protected pages, transaction CRUD, category
              management, and dashboard reporting.
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center bg-card-strong px-6 py-12 sm:px-10 lg:px-16">
          {children}
        </section>
      </div>
    </main>
  );
}
