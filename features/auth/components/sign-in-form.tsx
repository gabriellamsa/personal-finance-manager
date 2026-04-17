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
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AUTH_ROUTES } from "@/lib/constants/auth";
import {
  buildAuthRouteHref,
  type AuthFeedback,
  resolveAuthRedirectPath,
} from "@/lib/auth/navigation";
import { getClientErrorMessage } from "@/lib/http/client";
import { type ApiFailure, type ApiSuccess } from "@/lib/http/response";
import { type SignInInput, signInSchema } from "@/features/auth/auth.schemas";

type SessionResponse =
  | ApiSuccess<{
      user: {
        email: string;
        id: string;
        name: string;
      };
    }>
  | ApiFailure;

type SignInFormProps = {
  feedback?: AuthFeedback | null;
  redirectTo?: string;
};

export function SignInForm({ feedback, redirectTo }: SignInFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<SignInInput>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(signInSchema),
  });

  async function handleSubmit(values: SignInInput) {
    setFormError(null);
    const destination = resolveAuthRedirectPath(redirectTo);

    try {
      const response = await fetch("/api/auth/login", {
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
        router.replace(destination);
        router.refresh();
      });
    } catch (error) {
      setFormError(
        getClientErrorMessage(error, "Unable to sign in right now. Please try again."),
      );
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>
          Sign in to manage your balance, transactions, categories, and reports.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={form.handleSubmit(handleSubmit)} noValidate>
          {feedback ? (
            <FormMessage tone={feedback.tone}>
              <p className="font-semibold">{feedback.title}</p>
              <p className="mt-1">{feedback.description}</p>
            </FormMessage>
          ) : null}

          <fieldset className="space-y-5" disabled={form.formState.isSubmitting}>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                autoFocus
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
                autoComplete="current-password"
                placeholder="Enter your password"
                {...form.register("password")}
              />
              {form.formState.errors.password ? (
                <p className="text-sm text-danger">
                  {form.formState.errors.password.message}
                </p>
              ) : null}
            </div>

            {formError ? <FormMessage tone="error">{formError}</FormMessage> : null}

            <Button
              className="w-full"
              type="submit"
              disabled={form.formState.isSubmitting}
              aria-busy={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </fieldset>

          <p className="text-sm text-foreground/62">
            New here?{" "}
            <Link
              className="font-semibold text-accent"
              href={buildAuthRouteHref(AUTH_ROUTES.signUp, redirectTo)}
            >
              Create an account
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
