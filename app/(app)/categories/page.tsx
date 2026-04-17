import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Categories",
};

export default function CategoriesPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-foreground/45">
          Categories
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          System and custom categories already have a data model.
        </h1>
        <p className="max-w-2xl text-base text-foreground/66">
          Default categories are defined and seed-ready. The next UI iteration
          will expose management, reporting, and assignment flows here.
        </p>
      </div>

      <Card className="min-h-[260px] bg-card-strong">
        <CardHeader>
          <CardDescription>Upcoming scope</CardDescription>
          <CardTitle>Category management and report segmentation</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-foreground/64">
          This page will evolve into category listing, custom category creation,
          and category-based insights for dashboard charts.
        </CardContent>
      </Card>
    </div>
  );
}
