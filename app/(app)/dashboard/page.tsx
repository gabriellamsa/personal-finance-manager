import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Dashboard",
};

const dashboardCards = [
  {
    description: "Total balance",
    summary: "Your financial summary will appear here once transactions are added.",
    title: "$0.00",
  },
  {
    description: "Income",
    summary: "Income totals will aggregate from your categorized entries.",
    title: "$0.00",
  },
  {
    description: "Expenses",
    summary: "Expense totals will power budget and trend visualizations.",
    title: "$0.00",
  },
] as const;

export default async function DashboardPage() {
  const user = await requireCurrentUser();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-foreground/45">
          Dashboard
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          Welcome back, {user.name.split(" ")[0]}.
        </h1>
        <p className="max-w-2xl text-base text-foreground/66">
          The protected area is now active. The next steps will connect real
          transaction data, category reports, charts, and period filters to this
          dashboard.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {dashboardCards.map((card) => (
          <Card key={card.description} className="bg-card-strong">
            <CardHeader>
              <CardDescription>{card.description}</CardDescription>
              <CardTitle className="text-3xl">{card.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-foreground/64">
              {card.summary}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="min-h-[280px] bg-card-strong">
          <CardHeader>
            <CardDescription>Recent transactions</CardDescription>
            <CardTitle>Nothing recorded yet</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-foreground/64">
            Once transactions are created, this section will list the latest
            activity with type, category, amount, and date filters.
          </CardContent>
        </Card>

        <Card className="min-h-[280px] bg-[#14213d] text-white">
          <CardHeader>
            <CardDescription className="text-white/68">
              Monthly summary
            </CardDescription>
            <CardTitle className="text-white">
              Reporting infrastructure is ready to be connected.
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-white/72">
            This panel will evolve into category charts, spending distribution,
            and trend deltas once transaction queries and aggregations are added.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
