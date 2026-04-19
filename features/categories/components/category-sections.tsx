"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DeleteCategoryButton } from "@/features/categories/components/delete-category-button";
import { CategoryForm } from "@/features/categories/components/category-form";
import type { CategoryListItem } from "@/features/categories/categories.types";
import { formatCurrency } from "@/lib/formatters/currency";

type CategorySectionsProps = {
  categories: CategoryListItem[];
  currencyCode: string;
};

type CategorySectionProps = {
  categories: CategoryListItem[];
  currencyCode: string;
  editingCategoryId: string | null;
  onToggleEditing: (categoryId: string) => void;
  title: string;
};

function CategorySection({
  categories,
  currencyCode,
  editingCategoryId,
  onToggleEditing,
  title,
}: CategorySectionProps) {
  return (
    <Card className="bg-card-strong">
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle>{categories.length} categories available</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.map((category) => {
          const isEditing = editingCategoryId === category.id;
          const isCustomCategory = category.scope === "CUSTOM";

          return (
            <div
              key={category.id}
              className="rounded-[24px] border border-border bg-white/75 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <p className="text-base font-semibold text-foreground">
                      {category.name}
                    </p>
                    <Badge variant={isCustomCategory ? "success" : "neutral"}>
                      {isCustomCategory ? "Custom" : "System"}
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground/62">
                    {category.transactionCount} transactions •{" "}
                    {formatCurrency(category.totalAmountInCents, currencyCode)}
                  </p>
                </div>

                {isCustomCategory ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="rounded-2xl border border-border px-4 py-2 text-sm font-medium text-foreground/72 transition hover:bg-white hover:text-foreground"
                      onClick={() => onToggleEditing(category.id)}
                    >
                      {isEditing ? "Close editor" : "Edit"}
                    </button>
                    <DeleteCategoryButton categoryId={category.id} />
                  </div>
                ) : null}
              </div>

              {isEditing ? (
                <div className="mt-5 rounded-[22px] border border-border bg-card p-5">
                  <CategoryForm
                    category={category}
                    mode="edit"
                    onCancel={() => onToggleEditing(category.id)}
                    onCompleted={() => onToggleEditing(category.id)}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function CategorySections({
  categories,
  currencyCode,
}: CategorySectionsProps) {
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  const incomeCategories = categories.filter((category) => category.type === "INCOME");
  const expenseCategories = categories.filter(
    (category) => category.type === "EXPENSE",
  );

  function handleToggleEditing(categoryId: string) {
    setEditingCategoryId((current) => (current === categoryId ? null : categoryId));
  }

  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <CategorySection
        categories={incomeCategories}
        currencyCode={currencyCode}
        editingCategoryId={editingCategoryId}
        onToggleEditing={handleToggleEditing}
        title="Income categories"
      />
      <CategorySection
        categories={expenseCategories}
        currencyCode={currencyCode}
        editingCategoryId={editingCategoryId}
        onToggleEditing={handleToggleEditing}
        title="Expense categories"
      />
    </section>
  );
}
