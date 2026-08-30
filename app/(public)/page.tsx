import Link from "next/link";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { redirectIfAuthenticated } from "@/lib/auth/session";
import { AUTH_ROUTES } from "@/lib/constants/auth";

const featureHighlights = [
  "Secure sign-up and sign-in with HTTP-only cookie sessions",
  "Transactions and categories connected to real CRUD and reporting flows",
  "Dashboard summaries and charts powered by real aggregated finance data",
] as const;

export default async function MarketingPage() {
  await redirectIfAuthenticated();

  return (
    <main className="app-shell-grid min-h-screen">
      <div className="mx-auto flex max-w-7xl flex-col px-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-5 border-b border-border py-6 sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <Link href={AUTH_ROUTES.signIn}>
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href={AUTH_ROUTES.signUp}>
              <Button>Create account</Button>
            </Link>
          </div>
        </header>

        <section className="grid gap-12 py-16 lg:grid-cols-[1.25fr_0.75fr] lg:items-end lg:py-24">
          <div className="space-y-8">
            <div className="inline-flex border-l-2 border-accent pl-3 text-xs font-semibold uppercase tracking-[0.16em] text-foreground/65">
              Production-minded portfolio project
            </div>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-foreground sm:text-7xl">
                Build clarity around your money, one reliable system at a time.
              </h1>
              <p className="max-w-2xl text-lg text-foreground/68">
                Personal Finance Manager is a full-stack application for
                registering transactions, organizing categories, and monitoring
                balance performance with a production-minded architecture and
                portfolio-grade UX.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={AUTH_ROUTES.signUp}>
                <Button className="px-6 py-3 text-base">Start with an account</Button>
              </Link>
              <Link href={AUTH_ROUTES.signIn}>
                <Button variant="secondary" className="px-6 py-3 text-base">
                  Explore the sign-in flow
                </Button>
              </Link>
            </div>
          </div>

          <Card className="border-0 bg-foreground text-white">
            <CardHeader>
              <CardDescription className="text-white/68">
                Current foundation
              </CardDescription>
              <CardTitle className="text-white">
                Core finance flows are live and ready for continued refinement.
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-white/15 text-sm text-white/75">
              {featureHighlights.map((item) => (
                <div
                  key={item}
                  className="py-4 first:pt-0 last:pb-0"
                >
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid border-y border-border md:grid-cols-3">
          <Card className="rounded-none border-0 border-b border-border bg-transparent px-0 py-8 md:border-r md:border-b-0 md:px-6 md:first:pl-0">
            <CardHeader>
              <CardDescription>Security</CardDescription>
              <CardTitle>Credential flow designed for real users</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-foreground/68">
              Password hashing uses Argon2id and sessions are signed with JWTs in
              secure HTTP-only cookies.
            </CardContent>
          </Card>

          <Card className="rounded-none border-0 border-b border-border bg-transparent px-0 py-8 md:border-r md:border-b-0 md:px-6">
            <CardHeader>
              <CardDescription>Domain</CardDescription>
              <CardTitle>Finance-first schema</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-foreground/68">
              Transactions are stored as integer cents, categorized by type, and
              structured for reporting and dashboard aggregations.
            </CardContent>
          </Card>

          <Card className="rounded-none border-0 bg-transparent px-0 py-8 md:px-6 md:last:pr-0">
            <CardHeader>
              <CardDescription>Scalability</CardDescription>
              <CardTitle>Feature-based boundaries</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-foreground/68">
              The project separates UI, features, auth, persistence, and HTTP
              contracts to reduce coupling as the product grows.
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
