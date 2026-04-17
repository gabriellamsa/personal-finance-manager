"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

import { Button } from "@/components/ui/button";
import { AUTH_ROUTES } from "@/lib/constants/auth";

export function SignOutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleSignOut() {
    setIsPending(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      startTransition(() => {
        router.replace(AUTH_ROUTES.signIn);
        router.refresh();
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button
      variant="secondary"
      onClick={handleSignOut}
      disabled={isPending}
      aria-busy={isPending}
    >
      {isPending ? "Signing out..." : "Sign out"}
    </Button>
  );
}
