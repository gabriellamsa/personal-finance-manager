import "server-only";

import type { Prisma } from "@prisma/client";

import { getCategoryForUser } from "@/features/categories/categories.service";
import type {
  TransactionFilterInput,
  TransactionFormInput,
} from "@/features/transactions/transactions.schemas";
import type {
  TransactionListItem,
  TransactionListResult,
} from "@/features/transactions/transactions.types";
import { prisma } from "@/lib/db/prisma";
import { NotFoundError, ValidationError } from "@/lib/http/errors";
import { parseDateInput } from "@/lib/utils/date";

function toTransactionListItem(
  transaction: Prisma.TransactionGetPayload<{
    include: {
      category: {
        select: {
          color: true;
          id: true;
          name: true;
          type: true;
        };
      };
    };
  }>,
): TransactionListItem {
  return {
    amountInCents: transaction.amountInCents,
    category: {
      color: transaction.category.color,
      id: transaction.category.id,
      name: transaction.category.name,
      type: transaction.category.type,
    },
    createdAt: transaction.createdAt.toISOString(),
    description: transaction.description,
    id: transaction.id,
    notes: transaction.notes,
    occurredOn: transaction.occurredOn.toISOString(),
    type: transaction.type,
  };
}

async function assertCategoryMatchesType(
  userId: string,
  categoryId: string,
  type: TransactionFormInput["type"],
) {
  const category = await getCategoryForUser(userId, categoryId);

  if (category.type !== type) {
    throw new ValidationError(
      "The selected category type does not match the transaction type.",
      {
        categoryId: ["Choose a category that matches the transaction type."],
      },
    );
  }

  return category;
}

function buildTransactionWhereClause(
  userId: string,
  filters: TransactionFilterInput,
): Prisma.TransactionWhereInput {
  return {
    categoryId: filters.categoryId,
    occurredOn: {
      gte: filters.from ? parseDateInput(filters.from) : undefined,
      lte: filters.to ? parseDateInput(filters.to) : undefined,
    },
    type: filters.type,
    userId,
  };
}

export async function listTransactions(
  userId: string,
  filters: TransactionFilterInput,
): Promise<TransactionListResult> {
  const where = buildTransactionWhereClause(userId, filters);

  const [transactions, transactionCount, groupedTotals] = await Promise.all([
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
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
      where,
    }),
    prisma.transaction.count({ where }),
    prisma.transaction.groupBy({
      _sum: {
        amountInCents: true,
      },
      by: ["type"],
      where,
    }),
  ]);

  const totalIncomeInCents =
    groupedTotals.find((item) => item.type === "INCOME")?._sum.amountInCents ?? 0;
  const totalExpensesInCents =
    groupedTotals.find((item) => item.type === "EXPENSE")?._sum.amountInCents ?? 0;

  return {
    page: filters.page,
    pageCount: Math.max(1, Math.ceil(transactionCount / filters.pageSize)),
    pageSize: filters.pageSize,
    summary: {
      balanceInCents: totalIncomeInCents - totalExpensesInCents,
      totalExpensesInCents,
      totalIncomeInCents,
      transactionCount,
    },
    transactions: transactions.map(toTransactionListItem),
  };
}

export async function createTransaction(
  userId: string,
  input: TransactionFormInput,
) {
  await assertCategoryMatchesType(userId, input.categoryId, input.type);

  const transaction = await prisma.transaction.create({
    data: {
      amountInCents: Math.round(input.amount * 100),
      categoryId: input.categoryId,
      description: input.description,
      notes: input.notes,
      occurredOn: parseDateInput(input.occurredOn),
      type: input.type,
      userId,
    },
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
  });

  return toTransactionListItem(transaction);
}

export async function updateTransaction(
  userId: string,
  transactionId: string,
  input: TransactionFormInput,
) {
  const existingTransaction = await prisma.transaction.findFirst({
    select: {
      id: true,
    },
    where: {
      id: transactionId,
      userId,
    },
  });

  if (!existingTransaction) {
    throw new NotFoundError("The selected transaction was not found.");
  }

  await assertCategoryMatchesType(userId, input.categoryId, input.type);

  const transaction = await prisma.transaction.update({
    data: {
      amountInCents: Math.round(input.amount * 100),
      categoryId: input.categoryId,
      description: input.description,
      notes: input.notes,
      occurredOn: parseDateInput(input.occurredOn),
      type: input.type,
    },
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
    where: {
      id: transactionId,
    },
  });

  return toTransactionListItem(transaction);
}

export async function deleteTransaction(userId: string, transactionId: string) {
  const existingTransaction = await prisma.transaction.findFirst({
    select: {
      id: true,
    },
    where: {
      id: transactionId,
      userId,
    },
  });

  if (!existingTransaction) {
    throw new NotFoundError("The selected transaction was not found.");
  }

  await prisma.transaction.delete({
    where: {
      id: transactionId,
    },
  });

  return {
    deleted: true,
    id: transactionId,
  };
}
