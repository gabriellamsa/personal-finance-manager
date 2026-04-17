"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

import { Button } from "@/components/ui/button";
import type { ApiFailure, ApiSuccess } from "@/lib/http/response";

type DeleteResponse =
  | ApiSuccess<{
      deleted: boolean;
      id: string;
    }>
  | ApiFailure;

type DeleteTransactionButtonProps = {
  transactionId: string;
};

export function DeleteTransactionButton({
  transactionId,
}: DeleteTransactionButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleDelete() {
    const shouldDelete = window.confirm(
      "Delete this transaction? This action cannot be undone.",
    );

    if (!shouldDelete) {
      return;
    }

    setIsPending(true);

    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: "DELETE",
      });
      const result = (await response.json()) as DeleteResponse;

      if (!response.ok && "error" in result) {
        window.alert(result.error.message);
        return;
      }

      startTransition(() => {
        router.refresh();
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      className="text-danger hover:bg-danger/8 hover:text-danger"
      disabled={isPending}
      onClick={handleDelete}
    >
      {isPending ? "Deleting..." : "Delete"}
    </Button>
  );
}
