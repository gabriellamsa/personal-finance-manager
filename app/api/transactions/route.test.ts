import { beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_PAGE_SIZE } from "@/lib/constants/transactions";

const requireApiUserMock = vi.hoisted(() => vi.fn());
const listTransactionsMock = vi.hoisted(() => vi.fn());
const createTransactionMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth/session", () => ({
  requireApiUser: requireApiUserMock,
}));

vi.mock("@/features/transactions/transactions.service", () => ({
  createTransaction: createTransactionMock,
  listTransactions: listTransactionsMock,
}));

const routeModulePromise = import("@/app/api/transactions/route");

describe("/api/transactions route handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireApiUserMock.mockResolvedValue({
      id: "user-1",
    });
  });

  it("normalizes empty filter params for GET requests", async () => {
    const { GET } = await routeModulePromise;

    listTransactionsMock.mockResolvedValue({
      page: 1,
      pageCount: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      summary: {
        balanceInCents: 0,
        totalExpensesInCents: 0,
        totalIncomeInCents: 0,
        transactionCount: 0,
      },
      transactions: [],
    });

    const response = await GET(
      new Request(
        "http://localhost:3000/api/transactions?categoryId=&from=&page=&to=&type=",
      ),
    );

    expect(listTransactionsMock).toHaveBeenCalledWith("user-1", {
      categoryId: undefined,
      from: undefined,
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      to: undefined,
      type: undefined,
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: {
        page: 1,
        pageCount: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        summary: {
          balanceInCents: 0,
          totalExpensesInCents: 0,
          totalIncomeInCents: 0,
          transactionCount: 0,
        },
        transactions: [],
      },
      success: true,
    });
  });

  it("creates a transaction for POST requests", async () => {
    const { POST } = await routeModulePromise;

    createTransactionMock.mockResolvedValue({
      amountInCents: 2500,
      category: {
        color: "#DC2626",
        id: "category-1",
        name: "Housing",
        type: "EXPENSE",
      },
      createdAt: "2026-04-17T10:00:00.000Z",
      description: "Rent",
      id: "transaction-1",
      notes: "April rent",
      occurredOn: "2026-04-17T00:00:00.000Z",
      type: "EXPENSE",
    });

    const response = await POST(
      new Request("http://localhost:3000/api/transactions", {
        body: JSON.stringify({
          amount: 25,
          categoryId: "cmf0000000000000000000001",
          description: "Rent",
          notes: "April rent",
          occurredOn: "2026-04-17",
          type: "EXPENSE",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      }),
    );

    expect(createTransactionMock).toHaveBeenCalledWith("user-1", {
      amount: 25,
      categoryId: "cmf0000000000000000000001",
      description: "Rent",
      notes: "April rent",
      occurredOn: "2026-04-17",
      type: "EXPENSE",
    });
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      data: {
        transaction: {
          amountInCents: 2500,
          category: {
            color: "#DC2626",
            id: "category-1",
            name: "Housing",
            type: "EXPENSE",
          },
          createdAt: "2026-04-17T10:00:00.000Z",
          description: "Rent",
          id: "transaction-1",
          notes: "April rent",
          occurredOn: "2026-04-17T00:00:00.000Z",
          type: "EXPENSE",
        },
      },
      success: true,
    });
  });
});
