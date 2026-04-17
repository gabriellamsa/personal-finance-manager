import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { listAvailableCategories } from "@/features/categories/categories.service";
import { TransactionForm } from "@/features/transactions/components/transaction-form";
import { TransactionsList } from "@/features/transactions/components/transactions-list";
import { transactionFilterSchema } from "@/features/transactions/transactions.schemas";
import { listTransactions } from "@/features/transactions/transactions.service";
import { requireCurrentUser } from "@/lib/auth/session";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants/transactions";
import { formatCurrency } from "@/lib/formatters/currency";

export const metadata: Metadata = {
  title: "Transactions",
};

type TransactionsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchParam(
  value: string | string[] | undefined,
) {
  const resolvedValue = Array.isArray(value) ? value[0] : value;
  return resolvedValue ? resolvedValue : undefined;
}

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const user = await requireCurrentUser();
  const categories = await listAvailableCategories(user.id);
  const params = await searchParams;

  const filters = transactionFilterSchema.parse({
    categoryId: getSearchParam(params.categoryId),
    from: getSearchParam(params.from),
    page: getSearchParam(params.page),
    to: getSearchParam(params.to),
    type: getSearchParam(params.type),
  });

  const transactionsResult = await listTransactions(user.id, filters);

  const buildPageHref = (page: number) => {
    const urlSearchParams = new URLSearchParams();

    if (filters.categoryId) {
      urlSearchParams.set("categoryId", filters.categoryId);
    }
    if (filters.from) {
      urlSearchParams.set("from", filters.from);
    }
    if (filters.to) {
      urlSearchParams.set("to", filters.to);
    }
    if (filters.type) {
      urlSearchParams.set("type", filters.type);
    }
    if (page > 1) {
      urlSearchParams.set("page", String(page));
    }

    const query = urlSearchParams.toString();
    return query ? `/transactions?${query}` : "/transactions";
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-foreground/45">
          Transactions
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          Track, filter, and maintain your financial history.
        </h1>
        <p className="max-w-2xl text-base text-foreground/66">
          Transactions are now connected to categories, filters, pagination, and
          real CRUD actions.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        <Card className="bg-card-strong">
          <CardHeader>
            <CardDescription>Filtered balance</CardDescription>
            <CardTitle className="text-3xl">
              {formatCurrency(transactionsResult.summary.balanceInCents, user.currencyCode)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card-strong">
          <CardHeader>
            <CardDescription>Income</CardDescription>
            <CardTitle className="text-3xl text-accent">
              {formatCurrency(
                transactionsResult.summary.totalIncomeInCents,
                user.currencyCode,
              )}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card-strong">
          <CardHeader>
            <CardDescription>Expenses</CardDescription>
            <CardTitle className="text-3xl text-danger">
              {formatCurrency(
                transactionsResult.summary.totalExpensesInCents,
                user.currencyCode,
              )}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card-strong">
          <CardHeader>
            <CardDescription>Results</CardDescription>
            <CardTitle className="text-3xl">
              {transactionsResult.summary.transactionCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="bg-card-strong">
        <CardHeader>
          <CardDescription>New transaction</CardDescription>
          <CardTitle>Create and categorize a financial event</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionForm categories={categories} />
        </CardContent>
      </Card>

      <Card className="bg-card-strong">
        <CardHeader>
          <CardDescription>Filters</CardDescription>
          <CardTitle>Refine the transaction list</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-[0.8fr_1fr_1fr_1fr_auto]" action="/transactions">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select id="type" name="type" defaultValue={filters.type ?? ""}>
                <option value="">All types</option>
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <Select
                id="categoryId"
                name="categoryId"
                defaultValue={filters.categoryId ?? ""}
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="from">From</Label>
              <Input id="from" name="from" type="date" defaultValue={filters.from ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to">To</Label>
              <Input id="to" name="to" type="date" defaultValue={filters.to ?? ""} />
            </div>
            <div className="flex items-end gap-3">
              <Button type="submit" className="w-full">
                Apply filters
              </Button>
              <Link href="/transactions" className="w-full">
                <Button type="button" variant="secondary" className="w-full">
                  Reset
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <TransactionsList
        categories={categories}
        currencyCode={user.currencyCode}
        transactions={transactionsResult.transactions}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-foreground/62">
          Showing up to {DEFAULT_PAGE_SIZE} items per page.
        </p>
        <div className="flex items-center gap-3">
          <Link
            aria-disabled={transactionsResult.page <= 1}
            href={buildPageHref(transactionsResult.page - 1)}
            className={transactionsResult.page <= 1 ? "pointer-events-none opacity-50" : ""}
          >
            <Button variant="secondary">Previous</Button>
          </Link>
          <span className="text-sm font-medium text-foreground/72">
            Page {transactionsResult.page} of {transactionsResult.pageCount}
          </span>
          <Link
            aria-disabled={transactionsResult.page >= transactionsResult.pageCount}
            href={buildPageHref(transactionsResult.page + 1)}
            className={
              transactionsResult.page >= transactionsResult.pageCount
                ? "pointer-events-none opacity-50"
                : ""
            }
          >
            <Button variant="secondary">Next</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
