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
  "Transaction and category architecture ready for scalable CRUD",
  "Dashboard-ready data model for financial analytics and charts",
] as const;

export default async function MarketingPage() {
  await redirectIfAuthenticated();

  return (
    <main className="app-shell-grid min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-16">
        <header className="flex flex-col gap-6 rounded-[32px] border border-border bg-card px-6 py-6 shadow-[0_24px_60px_rgba(20,33,61,0.08)] backdrop-blur lg:flex-row lg:items-center lg:justify-between">
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

        <section className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div className="space-y-7">
            <div className="inline-flex rounded-full border border-border bg-white/70 px-4 py-2 text-sm font-medium text-foreground/70">
              Production-minded portfolio project
            </div>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-tight text-foreground sm:text-6xl">
                Build clarity around your money, one reliable system at a time.
              </h1>
              <p className="max-w-2xl text-lg text-foreground/68">
                Personal Finance Management System is a full-stack application for
                registering transactions, organizing categories, and monitoring
                balance performance with product-grade engineering foundations.
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

          <Card className="bg-[#14213d] text-white">
            <CardHeader>
              <CardDescription className="text-white/68">
                Current foundation
              </CardDescription>
              <CardTitle className="text-white">
                Architecture and authentication baseline are now in place.
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-white/78">
              {featureHighlights.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/12 bg-white/6 px-4 py-3"
                >
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardDescription>Security</CardDescription>
              <CardTitle>Credential flow designed for real users</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-foreground/68">
              Password hashing uses Argon2id and sessions are signed with JWTs in
              secure HTTP-only cookies.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Domain</CardDescription>
              <CardTitle>Finance-first schema</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-foreground/68">
              Transactions are stored as integer cents, categorized by type, and
              structured for reporting and dashboard aggregations.
            </CardContent>
          </Card>

          <Card>
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
