"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { AUTH_ROUTES } from "@/lib/constants/auth";
import { getClientErrorMessage } from "@/lib/http/client";

export function SignOutButton() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSignOut() {
    setErrorMessage(null);
    setIsPending(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Unable to close the current session.");
      }

      startTransition(() => {
        router.replace(`${AUTH_ROUTES.signIn}?message=signed-out`);
        router.refresh();
      });
    } catch (error) {
      setErrorMessage(
        getClientErrorMessage(error, "Unable to sign out right now. Please try again."),
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button
        variant="secondary"
        onClick={handleSignOut}
        disabled={isPending}
        aria-busy={isPending}
      >
        {isPending ? "Signing out..." : "Sign out"}
      </Button>

      {errorMessage ? <FormMessage tone="error">{errorMessage}</FormMessage> : null}
    </div>
  );
}
