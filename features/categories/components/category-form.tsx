"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CategoryColorPicker } from "@/features/categories/components/category-color-picker";
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
    color: "#FFD369",
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
  const selectedColor =
    useWatch({ control: form.control, name: "color" }) ?? "#FFD369";

  function handleColorChange(color: string) {
    form.setValue("color", color, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

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
          color: "#FFD369",
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
      className="grid gap-5 md:grid-cols-2 lg:grid-cols-[minmax(0,1.2fr)_minmax(180px,0.6fr)_auto]"
      method="post"
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

      <div className="flex items-end gap-3 md:col-span-2 lg:col-span-1">
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

      <fieldset className="space-y-2 md:col-span-2 lg:col-span-3">
        <legend className="text-sm font-medium text-foreground/78">Color</legend>
        <CategoryColorPicker
          id={`category-color-${category?.id ?? "new"}`}
          value={selectedColor}
          onChange={handleColorChange}
        />
        {form.formState.errors.color ? (
          <p className="text-sm text-danger">
            {form.formState.errors.color.message}
          </p>
        ) : null}
      </fieldset>

      {formError ? (
        <FormMessage className="md:col-span-2 lg:col-span-3" tone="error">
          {formError}
        </FormMessage>
      ) : null}
      {successMessage ? (
        <FormMessage className="md:col-span-2 lg:col-span-3" tone="success">
          {successMessage}
        </FormMessage>
      ) : null}
    </form>
  );
}
