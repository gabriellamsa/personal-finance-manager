"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AUTH_ROUTES } from "@/lib/constants/auth";
import { type ApiFailure, type ApiSuccess } from "@/lib/http/response";
import { type SignUpInput, signUpSchema } from "@/features/auth/auth.schemas";

type SessionResponse =
  | ApiSuccess<{
      user: {
        email: string;
        id: string;
        name: string;
      };
    }>
  | ApiFailure;

export function SignUpForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<SignUpInput>({
    defaultValues: {
      confirmPassword: "",
      email: "",
      name: "",
      password: "",
    },
    resolver: zodResolver(signUpSchema),
  });

  async function handleSubmit(values: SignUpInput) {
    setFormError(null);

    const response = await fetch("/api/auth/register", {
      body: JSON.stringify(values),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    });

    const result = (await response.json()) as SessionResponse;

    if (!response.ok && "error" in result) {
      setFormError(result.error.message);
      return;
    }

    startTransition(() => {
      router.replace(AUTH_ROUTES.dashboard);
      router.refresh();
    });
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Start tracking income, expenses, and category trends in one place.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-5"
          onSubmit={form.handleSubmit(handleSubmit)}
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              autoComplete="name"
              placeholder="Jane Doe"
              {...form.register("name")}
            />
            {form.formState.errors.name ? (
              <p className="text-sm text-danger">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...form.register("email")}
            />
            {form.formState.errors.email ? (
              <p className="text-sm text-danger">
                {form.formState.errors.email.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a strong password"
              {...form.register("password")}
            />
            {form.formState.errors.password ? (
              <p className="text-sm text-danger">
                {form.formState.errors.password.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your password"
              {...form.register("confirmPassword")}
            />
            {form.formState.errors.confirmPassword ? (
              <p className="text-sm text-danger">
                {form.formState.errors.confirmPassword.message}
              </p>
            ) : null}
          </div>

          {formError ? <p className="text-sm text-danger">{formError}</p> : null}

          <Button
            className="w-full"
            type="submit"
            disabled={form.formState.isSubmitting}
            aria-busy={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Creating account..." : "Create account"}
          </Button>

          <p className="text-sm text-foreground/62">
            Already have an account?{" "}
            <Link className="font-semibold text-accent" href={AUTH_ROUTES.signIn}>
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
