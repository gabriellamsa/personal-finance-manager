import type { Metadata } from "next";

import { SignUpForm } from "@/features/auth/components/sign-up-form";
import {
  getAuthFeedback,
  isProtectedAppPath,
  resolveAuthRedirectPath,
} from "@/lib/auth/navigation";

export const metadata: Metadata = {
  title: "Create account",
};

type SignUpPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;
  const requestedRedirectTo = getSearchParam(params.redirectTo);
  const resolvedRedirectTo = requestedRedirectTo
    ? resolveAuthRedirectPath(requestedRedirectTo)
    : undefined;
  const redirectTo =
    resolvedRedirectTo && isProtectedAppPath(resolvedRedirectTo.split("?")[0])
      ? resolvedRedirectTo
      : undefined;
  const feedback = getAuthFeedback({
    reason: getSearchParam(params.reason),
    redirectTo: requestedRedirectTo,
  });

  return <SignUpForm feedback={feedback} redirectTo={redirectTo} />;
}
