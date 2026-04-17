"use client";

import { useRouter } from "next/navigation";
import {
  startTransition,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { CategoryListItem } from "@/features/categories/categories.types";
import {
  transactionFormSchema,
  type TransactionFormInput,
  type TransactionFormValues,
} from "@/features/transactions/transactions.schemas";
import type { TransactionListItem } from "@/features/transactions/transactions.types";
import type { ApiFailure, ApiSuccess } from "@/lib/http/response";
import { toDateInputValue } from "@/lib/utils/date";

type TransactionResponse =
  | ApiSuccess<{
      transaction: {
        id: string;
      };
    }>
  | ApiFailure;

type TransactionFormProps = {
  categories: CategoryListItem[];
  mode?: "create" | "edit";
  onCancel?: () => void;
  onCompleted?: () => void;
  transaction?: TransactionListItem;
};

function getInitialValues(
  categories: CategoryListItem[],
  transaction?: TransactionListItem,
): TransactionFormValues {
  if (transaction) {
    return {
      amount: transaction.amountInCents / 100,
      categoryId: transaction.category.id,
      description: transaction.description,
      notes: transaction.notes ?? undefined,
      occurredOn: toDateInputValue(transaction.occurredOn),
      type: transaction.type,
    };
  }

  const expenseCategory = categories.find((category) => category.type === "EXPENSE");

  return {
    amount: 0,
    categoryId: expenseCategory?.id ?? categories[0]?.id ?? "",
    description: "",
    notes: "",
    occurredOn: toDateInputValue(new Date()),
    type: "EXPENSE",
  };
}

export function TransactionForm({
  categories,
  mode = "create",
  onCancel,
  onCompleted,
  transaction,
}: TransactionFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<TransactionFormValues, undefined, TransactionFormInput>({
    defaultValues: getInitialValues(categories, transaction),
    resolver: zodResolver(transactionFormSchema),
  });

  const selectedType = useWatch({
    control: form.control,
    name: "type",
  });
  const selectedCategoryId = useWatch({
    control: form.control,
    name: "categoryId",
  });

  const availableCategories = useMemo(
    () => categories.filter((category) => category.type === selectedType),
    [categories, selectedType],
  );

  useEffect(() => {
    if (!availableCategories.length) {
      return;
    }

    const hasSelectedCategory = availableCategories.some(
      (category) => category.id === selectedCategoryId,
    );

    if (!hasSelectedCategory) {
      form.setValue("categoryId", availableCategories[0].id, {
        shouldValidate: true,
      });
    }
  }, [availableCategories, form, selectedCategoryId]);

  async function handleSubmit(values: TransactionFormInput) {
    setFormError(null);
    setSuccessMessage(null);

    const response = await fetch(
      mode === "create"
        ? "/api/transactions"
        : `/api/transactions/${transaction?.id}`,
      {
        body: JSON.stringify(values),
        headers: {
          "content-type": "application/json",
        },
        method: mode === "create" ? "POST" : "PATCH",
      },
    );

    const result = (await response.json()) as TransactionResponse;

    if (!response.ok && "error" in result) {
      setFormError(result.error.message);
      return;
    }

    setSuccessMessage(
      mode === "create"
        ? "Transaction created successfully."
        : "Transaction updated successfully.",
    );

    if (mode === "create") {
      form.reset(getInitialValues(categories));
    }

    onCompleted?.();

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(handleSubmit)} noValidate>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor={`description-${mode}-${transaction?.id ?? "new"}`}>
          Description
        </Label>
        <Input
          id={`description-${mode}-${transaction?.id ?? "new"}`}
          placeholder="Describe the transaction"
          {...form.register("description")}
        />
        {form.formState.errors.description ? (
          <p className="text-sm text-danger">
            {form.formState.errors.description.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`amount-${mode}-${transaction?.id ?? "new"}`}>Amount</Label>
        <Input
          id={`amount-${mode}-${transaction?.id ?? "new"}`}
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          {...form.register("amount")}
        />
        {form.formState.errors.amount ? (
          <p className="text-sm text-danger">{form.formState.errors.amount.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`occurredOn-${mode}-${transaction?.id ?? "new"}`}>
          Occurred on
        </Label>
        <Input
          id={`occurredOn-${mode}-${transaction?.id ?? "new"}`}
          type="date"
          {...form.register("occurredOn")}
        />
        {form.formState.errors.occurredOn ? (
          <p className="text-sm text-danger">
            {form.formState.errors.occurredOn.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`type-${mode}-${transaction?.id ?? "new"}`}>Type</Label>
        <Select id={`type-${mode}-${transaction?.id ?? "new"}`} {...form.register("type")}>
          <option value="EXPENSE">Expense</option>
          <option value="INCOME">Income</option>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`category-${mode}-${transaction?.id ?? "new"}`}>Category</Label>
        <Select
          id={`category-${mode}-${transaction?.id ?? "new"}`}
          {...form.register("categoryId")}
        >
          {availableCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
        {form.formState.errors.categoryId ? (
          <p className="text-sm text-danger">
            {form.formState.errors.categoryId.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor={`notes-${mode}-${transaction?.id ?? "new"}`}>Notes</Label>
        <Textarea
          id={`notes-${mode}-${transaction?.id ?? "new"}`}
          placeholder="Optional context for this transaction"
          {...form.register("notes")}
        />
        {form.formState.errors.notes ? (
          <p className="text-sm text-danger">{form.formState.errors.notes.message}</p>
        ) : null}
      </div>

      {formError ? <p className="md:col-span-2 text-sm text-danger">{formError}</p> : null}
      {successMessage ? (
        <p className="md:col-span-2 text-sm text-accent">{successMessage}</p>
      ) : null}

      <div className="md:col-span-2 flex flex-wrap gap-3">
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          aria-busy={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting
            ? mode === "create"
              ? "Saving..."
              : "Updating..."
            : mode === "create"
              ? "Create transaction"
              : "Save changes"}
        </Button>

        {mode === "edit" && onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
