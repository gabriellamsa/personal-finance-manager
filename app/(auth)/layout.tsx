import type { ReactNode } from "react";

import { Logo } from "@/components/shared/logo";
import { redirectIfAuthenticated } from "@/lib/auth/session";

type AuthLayoutProps = {
  children: ReactNode;
};

export default async function AuthLayout({ children }: AuthLayoutProps) {
  await redirectIfAuthenticated();

  return (
    <main className="min-h-screen px-6 py-8 sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col gap-8 rounded-[36px] border border-border bg-card p-6 shadow-[0_24px_80px_rgba(20,33,61,0.08)] backdrop-blur lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:gap-0 lg:p-8">
        <section className="flex flex-col justify-between gap-10 rounded-[30px] bg-[#14213d] px-6 py-8 text-white lg:px-8">
          <div className="space-y-6">
            <Logo className="text-white" />
            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/58">
                Secure personal finance foundation
              </p>
              <h1 className="text-4xl font-semibold leading-tight">
                A clean entry point into your financial operating system.
              </h1>
              <p className="max-w-md text-base text-white/72">
                The account flow is already wired to validation, hashing,
                persistent users, and signed session cookies.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-2xl border border-white/12 bg-white/6 p-4 text-sm text-white/78">
              Built with Next.js 16, Prisma, Zod, React Hook Form, and a custom
              JWT session layer.
            </div>
            <div className="rounded-2xl border border-white/12 bg-white/6 p-4 text-sm text-white/78">
              Already connected to protected pages, transaction CRUD, category
              management, and dashboard reporting.
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-0 py-2 lg:px-8">
          {children}
        </section>
      </div>
    </main>
  );
}
