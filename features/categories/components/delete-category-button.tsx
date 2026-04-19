"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { ApiFailure, ApiSuccess } from "@/lib/http/response";

type DeleteCategoryResponse =
  | ApiSuccess<{
      deleted: boolean;
      id: string;
    }>
  | ApiFailure;

type DeleteCategoryButtonProps = {
  categoryId: string;
};

export function DeleteCategoryButton({
  categoryId,
}: DeleteCategoryButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleDelete() {
    const shouldDelete = window.confirm(
      "Delete this custom category? This action cannot be undone.",
    );

    if (!shouldDelete) {
      return;
    }

    setIsPending(true);

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      });
      const result = (await response.json()) as DeleteCategoryResponse;

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
