"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  createCategorySchema,
  type CreateCategoryFormInput,
  type CreateCategoryInput,
} from "@/features/categories/categories.schemas";
import type { ApiFailure, ApiSuccess } from "@/lib/http/response";

type CategoryResponse =
  | ApiSuccess<{
      category: {
        id: string;
      };
    }>
  | ApiFailure;

export function CategoryForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<CreateCategoryFormInput, undefined, CreateCategoryInput>({
    defaultValues: {
      color: "#0F766E",
      name: "",
      type: "EXPENSE",
    },
    resolver: zodResolver(createCategorySchema),
  });

  async function handleSubmit(values: CreateCategoryInput) {
    setFormError(null);
    setSuccessMessage(null);

    const response = await fetch("/api/categories", {
      body: JSON.stringify(values),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    });

    const result = (await response.json()) as CategoryResponse;

    if (!response.ok && "error" in result) {
      setFormError(result.error.message);
      return;
    }

    setSuccessMessage("Custom category created successfully.");
    form.reset({
      color: "#0F766E",
      name: "",
      type: values.type,
    });

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <form className="grid gap-4 md:grid-cols-[1.3fr_0.8fr_0.6fr_auto]" onSubmit={form.handleSubmit(handleSubmit)} noValidate>
      <div className="space-y-2">
        <Label htmlFor="category-name">Category name</Label>
        <Input
          id="category-name"
          placeholder="Add a custom category"
          {...form.register("name")}
        />
        {form.formState.errors.name ? (
          <p className="text-sm text-danger">{form.formState.errors.name.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category-type">Type</Label>
        <Select id="category-type" {...form.register("type")}>
          <option value="EXPENSE">Expense</option>
          <option value="INCOME">Income</option>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category-color">Color</Label>
        <Input id="category-color" type="color" className="px-2" {...form.register("color")} />
      </div>

      <div className="flex items-end">
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
          aria-busy={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Creating..." : "Create category"}
        </Button>
      </div>

      {formError ? (
        <p className="md:col-span-4 text-sm text-danger">{formError}</p>
      ) : null}
      {successMessage ? (
        <p className="md:col-span-4 text-sm text-accent">{successMessage}</p>
      ) : null}
    </form>
  );
}
