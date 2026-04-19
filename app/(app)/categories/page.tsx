import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CategoryForm } from "@/features/categories/components/category-form";
import { CategorySections } from "@/features/categories/components/category-sections";
import { listAvailableCategories } from "@/features/categories/categories.service";
import { requireCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Categories",
};

export default async function CategoriesPage() {
  const user = await requireCurrentUser();
  const categories = await listAvailableCategories(user.id);

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

      <CategorySections categories={categories} currencyCode={user.currencyCode} />
    </div>
  );
}
