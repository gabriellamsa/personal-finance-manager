import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CategoryForm } from "@/features/categories/components/category-form";
import { listAvailableCategories } from "@/features/categories/categories.service";
import { requireCurrentUser } from "@/lib/auth/session";
import { formatCurrency } from "@/lib/formatters/currency";

export const metadata: Metadata = {
  title: "Categories",
};

export default async function CategoriesPage() {
  const user = await requireCurrentUser();
  const categories = await listAvailableCategories(user.id);

  const incomeCategories = categories.filter((category) => category.type === "INCOME");
  const expenseCategories = categories.filter(
    (category) => category.type === "EXPENSE",
  );

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-foreground/45">
          Categories
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          Organize reporting with system and custom categories.
        </h1>
        <p className="max-w-2xl text-base text-foreground/66">
          System categories are available immediately, and custom categories let
          you adapt the product to your own income and expense structure.
        </p>
      </div>

      <Card className="bg-card-strong">
        <CardHeader>
          <CardDescription>Custom category management</CardDescription>
          <CardTitle>Create a category for your own workflow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <CategoryForm />

          {!categories.some((category) => category.scope === "CUSTOM") ? (
            <div className="rounded-[24px] border border-dashed border-border bg-white/72 p-4 text-sm text-foreground/64">
              You are currently using only system categories. Add custom ones when
              your financial workflow needs more granular reporting.
            </div>
          ) : null}
        </CardContent>
      </Card>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="bg-card-strong">
          <CardHeader>
            <CardDescription>Income categories</CardDescription>
            <CardTitle>{incomeCategories.length} categories available</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {incomeCategories.map((category) => (
              <div
                key={category.id}
                className="rounded-[24px] border border-border bg-white/75 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <p className="text-base font-semibold text-foreground">
                        {category.name}
                      </p>
                      <Badge
                        variant={category.scope === "SYSTEM" ? "neutral" : "success"}
                      >
                        {category.scope === "SYSTEM" ? "System" : "Custom"}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground/62">
                      {category.transactionCount} transactions •{" "}
                      {formatCurrency(category.totalAmountInCents, user.currencyCode)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card-strong">
          <CardHeader>
            <CardDescription>Expense categories</CardDescription>
            <CardTitle>{expenseCategories.length} categories available</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {expenseCategories.map((category) => (
              <div
                key={category.id}
                className="rounded-[24px] border border-border bg-white/75 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <p className="text-base font-semibold text-foreground">
                        {category.name}
                      </p>
                      <Badge
                        variant={category.scope === "SYSTEM" ? "neutral" : "success"}
                      >
                        {category.scope === "SYSTEM" ? "System" : "Custom"}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground/62">
                      {category.transactionCount} transactions •{" "}
                      {formatCurrency(category.totalAmountInCents, user.currencyCode)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
