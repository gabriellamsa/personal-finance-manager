import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Transactions",
};

export default function TransactionsPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-foreground/45">
          Transactions
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          Transaction management is the next implementation block.
        </h1>
        <p className="max-w-2xl text-base text-foreground/66">
          This route already sits behind authentication and is ready to receive
          list views, filters, pagination, and CRUD flows.
        </p>
      </div>

      <Card className="min-h-[260px] bg-card-strong">
        <CardHeader>
          <CardDescription>Upcoming scope</CardDescription>
          <CardTitle>Filters, table organization, and transaction CRUD</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-foreground/64">
          The next milestone will connect this page to persistent transaction
          queries, period filters, category filters, and editing flows.
        </CardContent>
      </Card>
    </div>
  );
}
