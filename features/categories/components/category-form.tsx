"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  createCategorySchema,
  type CreateCategoryFormInput,
  type CreateCategoryInput,
} from "@/features/categories/categories.schemas";
import type { CategoryListItem } from "@/features/categories/categories.types";
import { getClientErrorMessage } from "@/lib/http/client";
import type { ApiFailure, ApiSuccess } from "@/lib/http/response";

type CategoryResponse =
  | ApiSuccess<{
      category: {
        id: string;
      };
    }>
  | ApiFailure;

type CategoryFormProps = {
  category?: CategoryListItem;
  mode?: "create" | "edit";
  onCancel?: () => void;
  onCompleted?: () => void;
};

function getInitialValues(category?: CategoryListItem): CreateCategoryFormInput {
  if (category) {
    return {
      color: category.color,
      name: category.name,
      type: category.type,
    };
  }

  return {
    color: "#0F766E",
    name: "",
    type: "EXPENSE",
  };
}

export function CategoryForm({
  category,
  mode = "create",
  onCancel,
  onCompleted,
}: CategoryFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<CreateCategoryFormInput, undefined, CreateCategoryInput>({
    defaultValues: getInitialValues(category),
    resolver: zodResolver(createCategorySchema),
  });

  async function handleSubmit(values: CreateCategoryInput) {
    setFormError(null);
    setSuccessMessage(null);
    try {
      const response = await fetch(
        mode === "create" ? "/api/categories" : `/api/categories/${category?.id}`,
        {
          body: JSON.stringify(values),
          headers: {
            "content-type": "application/json",
          },
          method: mode === "create" ? "POST" : "PATCH",
        },
      );

      const result = (await response.json()) as CategoryResponse;

      if (!response.ok && "error" in result) {
        setFormError(result.error.message);
        return;
      }

      setSuccessMessage(
        mode === "create"
          ? "Custom category created successfully."
          : "Custom category updated successfully.",
      );

      if (mode === "create") {
        form.reset({
          color: "#0F766E",
          name: "",
          type: values.type,
        });
      }

      onCompleted?.();

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setFormError(
        getClientErrorMessage(
          error,
          mode === "create"
            ? "Unable to create the category right now. Please try again."
            : "Unable to update the category right now. Please try again.",
        ),
      );
    }
  }

  return (
    <form
      className="grid gap-4 md:grid-cols-[1.3fr_0.8fr_0.6fr_auto]"
      onSubmit={form.handleSubmit(handleSubmit)}
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor={`category-name-${category?.id ?? "new"}`}>Category name</Label>
        <Input
          id={`category-name-${category?.id ?? "new"}`}
          placeholder="Add a custom category"
          {...form.register("name")}
        />
        {form.formState.errors.name ? (
          <p className="text-sm text-danger">{form.formState.errors.name.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`category-type-${category?.id ?? "new"}`}>Type</Label>
        <Select id={`category-type-${category?.id ?? "new"}`} {...form.register("type")}>
          <option value="EXPENSE">Expense</option>
          <option value="INCOME">Income</option>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`category-color-${category?.id ?? "new"}`}>Color</Label>
        <Input
          id={`category-color-${category?.id ?? "new"}`}
          type="color"
          className="px-2"
          {...form.register("color")}
        />
      </div>

      <div className="flex items-end gap-3">
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
          aria-busy={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Create category"
              : "Save changes"}
        </Button>

        {mode === "edit" && onCancel ? (
          <Button
            type="button"
            className="w-full"
            variant="secondary"
            onClick={onCancel}
          >
            Cancel
          </Button>
        ) : null}
      </div>

      {formError ? (
        <FormMessage className="md:col-span-4" tone="error">
          {formError}
        </FormMessage>
      ) : null}
      {successMessage ? (
        <FormMessage className="md:col-span-4" tone="success">
          {successMessage}
        </FormMessage>
      ) : null}
    </form>
  );
}
