import type { Metadata } from "next";

import { SignInForm } from "@/features/auth/components/sign-in-form";
import {
  getAuthFeedback,
  isProtectedAppPath,
  resolveAuthRedirectPath,
} from "@/lib/auth/navigation";

export const metadata: Metadata = {
  title: "Sign in",
};

type SignInPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
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
    message: getSearchParam(params.message),
    reason: getSearchParam(params.reason),
    redirectTo: requestedRedirectTo,
  });

  return <SignInForm feedback={feedback} redirectTo={redirectTo} />;
}
