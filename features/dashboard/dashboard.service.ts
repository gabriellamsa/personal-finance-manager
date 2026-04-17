import "server-only";

import { prisma } from "@/lib/db/prisma";
import type { TransactionListItem } from "@/features/transactions/transactions.types";
import { formatMonthLabel } from "@/lib/formatters/date";
import { addMonthsUtc, getStartOfMonthUtc } from "@/lib/utils/date";

type DashboardSummary = {
  balanceInCents: number;
  categoryBreakdown: Array<{
    color: string;
    name: string;
    totalAmountInCents: number;
  }>;
  monthlySummary: Array<{
    expenseInCents: number;
    incomeInCents: number;
    label: string;
  }>;
  recentTransactions: TransactionListItem[];
  totalExpensesInCents: number;
  totalIncomeInCents: number;
};

export async function getDashboardSummary(userId: string): Promise<DashboardSummary> {
  const now = new Date();
  const currentMonthStart = getStartOfMonthUtc(now);
  const sixMonthsAgo = addMonthsUtc(currentMonthStart, -5);

  const [totals, recentTransactions, currentMonthExpenses, monthlyTransactions] =
    await Promise.all([
      prisma.transaction.groupBy({
        _sum: {
          amountInCents: true,
        },
        by: ["type"],
        where: {
          userId,
        },
      }),
      prisma.transaction.findMany({
        include: {
          category: {
            select: {
              color: true,
              id: true,
              name: true,
              type: true,
            },
          },
        },
        orderBy: [{ occurredOn: "desc" }, { createdAt: "desc" }],
        take: 5,
        where: {
          userId,
        },
      }),
      prisma.transaction.groupBy({
        _sum: {
          amountInCents: true,
        },
        by: ["categoryId"],
        where: {
          occurredOn: {
            gte: currentMonthStart,
          },
          type: "EXPENSE",
          userId,
        },
      }),
      prisma.transaction.findMany({
        select: {
          amountInCents: true,
          occurredOn: true,
          type: true,
        },
        where: {
          occurredOn: {
            gte: sixMonthsAgo,
          },
          userId,
        },
      }),
    ]);

  const categoryIds = currentMonthExpenses.map((item) => item.categoryId);
  const categories = categoryIds.length
    ? await prisma.category.findMany({
        select: {
          color: true,
          id: true,
          name: true,
        },
        where: {
          id: {
            in: categoryIds,
          },
        },
      })
    : [];

  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const monthlyByLabel = new Map<string, { expenseInCents: number; incomeInCents: number }>();

  for (let offset = 0; offset < 6; offset += 1) {
    const date = addMonthsUtc(currentMonthStart, -5 + offset);
    monthlyByLabel.set(formatMonthLabel(date), {
      expenseInCents: 0,
      incomeInCents: 0,
    });
  }

  for (const transaction of monthlyTransactions) {
    const label = formatMonthLabel(getStartOfMonthUtc(transaction.occurredOn));
    const bucket = monthlyByLabel.get(label);

    if (!bucket) {
      continue;
    }

    if (transaction.type === "INCOME") {
      bucket.incomeInCents += transaction.amountInCents;
    } else {
      bucket.expenseInCents += transaction.amountInCents;
    }
  }

  const totalIncomeInCents =
    totals.find((item) => item.type === "INCOME")?._sum.amountInCents ?? 0;
  const totalExpensesInCents =
    totals.find((item) => item.type === "EXPENSE")?._sum.amountInCents ?? 0;

  return {
    balanceInCents: totalIncomeInCents - totalExpensesInCents,
    categoryBreakdown: currentMonthExpenses
      .map((entry) => {
        const category = categoryById.get(entry.categoryId);

        if (!category) {
          return null;
        }

        return {
          color: category.color,
          name: category.name,
          totalAmountInCents: entry._sum.amountInCents ?? 0,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
      .sort((left, right) => right.totalAmountInCents - left.totalAmountInCents),
    monthlySummary: Array.from(monthlyByLabel.entries()).map(([label, value]) => ({
      expenseInCents: value.expenseInCents,
      incomeInCents: value.incomeInCents,
      label,
    })),
    recentTransactions: recentTransactions.map((transaction) => ({
      amountInCents: transaction.amountInCents,
      category: transaction.category,
      createdAt: transaction.createdAt.toISOString(),
      description: transaction.description,
      id: transaction.id,
      notes: transaction.notes,
      occurredOn: transaction.occurredOn.toISOString(),
      type: transaction.type,
    })),
    totalExpensesInCents,
    totalIncomeInCents,
  };
}
