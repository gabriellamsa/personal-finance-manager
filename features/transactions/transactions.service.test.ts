import { beforeEach, describe, expect, it, vi } from "vitest";

import { NotFoundError, ValidationError } from "@/lib/http/errors";

const transactionFindManyMock = vi.hoisted(() => vi.fn());
const transactionCountMock = vi.hoisted(() => vi.fn());
const transactionGroupByMock = vi.hoisted(() => vi.fn());
const transactionCreateMock = vi.hoisted(() => vi.fn());
const transactionFindFirstMock = vi.hoisted(() => vi.fn());
const transactionUpdateMock = vi.hoisted(() => vi.fn());
const transactionDeleteMock = vi.hoisted(() => vi.fn());
const getCategoryForUserMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    transaction: {
      count: transactionCountMock,
      create: transactionCreateMock,
      delete: transactionDeleteMock,
      findFirst: transactionFindFirstMock,
      findMany: transactionFindManyMock,
      groupBy: transactionGroupByMock,
      update: transactionUpdateMock,
    },
  },
}));

vi.mock("@/features/categories/categories.service", () => ({
  getCategoryForUser: getCategoryForUserMock,
}));

import {
  createTransaction,
  deleteTransaction,
  listTransactions,
  updateTransaction,
} from "@/features/transactions/transactions.service";

describe("transactions.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a transaction with normalized cents and UTC date", async () => {
    getCategoryForUserMock.mockResolvedValue({
      id: "category-1",
      type: "INCOME",
    });
    transactionCreateMock.mockResolvedValue({
      amountInCents: 1234,
      category: {
        color: "#0F766E",
        id: "category-1",
        name: "Salary",
        type: "INCOME",
      },
      createdAt: new Date("2026-04-17T10:00:00.000Z"),
      description: "Salary payment",
      id: "transaction-1",
      notes: "Monthly salary",
      occurredOn: new Date("2026-04-17T00:00:00.000Z"),
      type: "INCOME",
    });

    const result = await createTransaction("user-1", {
      amount: 12.34,
      categoryId: "category-1",
      description: "Salary payment",
      notes: "Monthly salary",
      occurredOn: "2026-04-17",
      type: "INCOME",
    });

    expect(transactionCreateMock).toHaveBeenCalledWith({
      data: {
        amountInCents: 1234,
        categoryId: "category-1",
        description: "Salary payment",
        notes: "Monthly salary",
        occurredOn: new Date("2026-04-17T00:00:00.000Z"),
        type: "INCOME",
        userId: "user-1",
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
    expect(result).toEqual({
      amountInCents: 1234,
      category: {
        color: "#0F766E",
        id: "category-1",
        name: "Salary",
        type: "INCOME",
      },
      createdAt: "2026-04-17T10:00:00.000Z",
      description: "Salary payment",
      id: "transaction-1",
      notes: "Monthly salary",
      occurredOn: "2026-04-17T00:00:00.000Z",
      type: "INCOME",
    });
  });

  it("rejects categories that do not match the transaction type", async () => {
    getCategoryForUserMock.mockResolvedValue({
      id: "category-1",
      type: "EXPENSE",
    });

    await expect(
      createTransaction("user-1", {
        amount: 50,
        categoryId: "category-1",
        description: "Salary payment",
        notes: undefined,
        occurredOn: "2026-04-17",
        type: "INCOME",
      }),
    ).rejects.toBeInstanceOf(ValidationError);

    expect(transactionCreateMock).not.toHaveBeenCalled();
  });

  it("returns paginated transactions with derived totals", async () => {
    transactionFindManyMock.mockResolvedValue([
      {
        amountInCents: 3500,
        category: {
          color: "#0F766E",
          id: "category-1",
          name: "Salary",
          type: "INCOME",
        },
        createdAt: new Date("2026-04-17T10:00:00.000Z"),
        description: "Salary payment",
        id: "transaction-1",
        notes: null,
        occurredOn: new Date("2026-04-17T00:00:00.000Z"),
        type: "INCOME",
      },
    ]);
    transactionCountMock.mockResolvedValue(11);
    transactionGroupByMock.mockResolvedValue([
      {
        _sum: {
          amountInCents: 3500,
        },
        type: "INCOME",
      },
      {
        _sum: {
          amountInCents: 500,
        },
        type: "EXPENSE",
      },
    ]);

    const result = await listTransactions("user-1", {
      categoryId: undefined,
      from: undefined,
      page: 2,
      pageSize: 10,
      to: undefined,
      type: undefined,
    });

    expect(transactionFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
        where: {
          categoryId: undefined,
          occurredOn: {
            gte: undefined,
            lte: undefined,
          },
          type: undefined,
          userId: "user-1",
        },
      }),
    );
    expect(result).toEqual({
      page: 2,
      pageCount: 2,
      pageSize: 10,
      summary: {
        balanceInCents: 3000,
        totalExpensesInCents: 500,
        totalIncomeInCents: 3500,
        transactionCount: 11,
      },
      transactions: [
        {
          amountInCents: 3500,
          category: {
            color: "#0F766E",
            id: "category-1",
            name: "Salary",
            type: "INCOME",
          },
          createdAt: "2026-04-17T10:00:00.000Z",
          description: "Salary payment",
          id: "transaction-1",
          notes: null,
          occurredOn: "2026-04-17T00:00:00.000Z",
          type: "INCOME",
        },
      ],
    });
  });

  it("prevents updates when the transaction does not belong to the user", async () => {
    transactionFindFirstMock.mockResolvedValue(null);

    await expect(
      updateTransaction("user-1", "transaction-1", {
        amount: 10,
        categoryId: "category-1",
        description: "Coffee",
        notes: undefined,
        occurredOn: "2026-04-17",
        type: "EXPENSE",
      }),
    ).rejects.toBeInstanceOf(NotFoundError);

    expect(transactionUpdateMock).not.toHaveBeenCalled();
  });

  it("deletes an owned transaction", async () => {
    transactionFindFirstMock.mockResolvedValue({
      id: "transaction-1",
    });
    transactionDeleteMock.mockResolvedValue({
      id: "transaction-1",
    });

    const result = await deleteTransaction("user-1", "transaction-1");

    expect(transactionDeleteMock).toHaveBeenCalledWith({
      where: {
        id: "transaction-1",
      },
    });
    expect(result).toEqual({
      deleted: true,
      id: "transaction-1",
    });
  });
});
