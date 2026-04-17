import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CategoryBreakdownChart } from "@/features/dashboard/components/category-breakdown-chart";
import { MonthlySummaryChart } from "@/features/dashboard/components/monthly-summary-chart";
import { getDashboardSummary } from "@/features/dashboard/dashboard.service";
import { requireCurrentUser } from "@/lib/auth/session";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await requireCurrentUser();
  const summary = await getDashboardSummary(user.id);

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
        <Card className="bg-card-strong">
          <CardHeader>
            <CardDescription>Total balance</CardDescription>
            <CardTitle className="text-3xl">
              {formatCurrency(summary.balanceInCents, user.currencyCode)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-foreground/64">
            Net result across all recorded transactions.
          </CardContent>
        </Card>
        <Card className="bg-card-strong">
          <CardHeader>
            <CardDescription>Income</CardDescription>
            <CardTitle className="text-3xl text-accent">
              {formatCurrency(summary.totalIncomeInCents, user.currencyCode)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-foreground/64">
            Total income recorded in the current dataset.
          </CardContent>
        </Card>
        <Card className="bg-card-strong">
          <CardHeader>
            <CardDescription>Expenses</CardDescription>
            <CardTitle className="text-3xl text-danger">
              {formatCurrency(summary.totalExpensesInCents, user.currencyCode)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-foreground/64">
            Total expenses available for budget and trend analysis.
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="min-h-[280px] bg-card-strong">
          <CardHeader>
            <CardDescription>Recent transactions</CardDescription>
            <CardTitle>Latest financial activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {summary.recentTransactions.length ? (
              summary.recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex flex-col gap-3 rounded-[22px] border border-border bg-white/75 px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          transaction.type === "INCOME" ? "success" : "danger"
                        }
                      >
                        {transaction.type === "INCOME" ? "Income" : "Expense"}
                      </Badge>
                      <Badge variant="neutral">{transaction.category.name}</Badge>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-foreground/62">
                        {formatDate(transaction.occurredOn)}
                      </p>
                    </div>
                  </div>
                  <p
                    className={
                      transaction.type === "INCOME"
                        ? "text-lg font-semibold text-accent"
                        : "text-lg font-semibold text-danger"
                    }
                  >
                    {transaction.type === "INCOME" ? "+" : "-"}
                    {formatCurrency(transaction.amountInCents, user.currencyCode)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-foreground/64">
                No recent transactions yet. Start by adding income or expenses in
                the transactions section.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="min-h-[280px] bg-card-strong">
          <CardHeader>
            <CardDescription>Current month breakdown</CardDescription>
            <CardTitle>Expenses by category</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryBreakdownChart
              currencyCode={user.currencyCode}
              data={summary.categoryBreakdown}
            />
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card-strong">
        <CardHeader>
          <CardDescription>Monthly summary</CardDescription>
          <CardTitle>Income vs expenses over the last six months</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlySummaryChart
            currencyCode={user.currencyCode}
            data={summary.monthlySummary}
          />
        </CardContent>
      </Card>
    </div>
  );
}
