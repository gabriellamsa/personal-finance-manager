import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthenticationError } from "@/lib/http/errors";

const requireApiUserMock = vi.hoisted(() => vi.fn());
const importTransactionMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth/session", () => ({
  requireApiUser: requireApiUserMock,
}));

vi.mock("@/features/integrations/transaction-import.service", () => ({
  importTransaction: importTransactionMock,
}));

const routeModulePromise = import("@/app/api/integrations/transactions/import/route");

const validBody = {
  sourceRecordId: "bank-export-2026-0001",
  sourceSystem: "transaction-import-recovery-pipeline",
  transaction: {
    amountInCents: 2599,
    categoryId: "cmf0000000000000000000001",
    description: "Synthetic grocery transaction",
    notes: "Synthetic portfolio data",
    occurredOn: "2026-08-01",
    type: "EXPENSE",
  },
};

function createRequest(body: unknown, requestId = "integration-test-001") {
  return new Request(
    "http://localhost:3000/api/integrations/transactions/import",
    {
      body: JSON.stringify(body),
      headers: {
        "content-type": "application/json",
        "x-request-id": requestId,
      },
      method: "POST",
    },
  );
}

describe("POST /api/integrations/transactions/import", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireApiUserMock.mockResolvedValue({ id: "user-1" });
  });

  it("rejects unauthenticated imports and preserves request correlation", async () => {
    const { POST } = await routeModulePromise;
    requireApiUserMock.mockRejectedValue(new AuthenticationError());

    const response = await POST(createRequest(validBody));

    expect(response.status).toBe(401);
    expect(response.headers.get("x-request-id")).toBe("integration-test-001");
    expect(importTransactionMock).not.toHaveBeenCalled();
  });

  it("rejects invalid and unexpected fields", async () => {
    const { POST } = await routeModulePromise;

    const response = await POST(
      createRequest({
        ...validBody,
        userId: "attacker-selected-user",
        transaction: { ...validBody.transaction, amountInCents: 25.99 },
      }),
    );

    expect(response.status).toBe(400);
    expect(importTransactionMock).not.toHaveBeenCalled();
  });

  it.each([
    ["source system", { ...validBody, sourceSystem: "Invalid Source" }],
    ["source record ID", { ...validBody, sourceRecordId: "unsafe value" }],
    ["calendar date", { ...validBody, transaction: { ...validBody.transaction, occurredOn: "2026-02-30" } }],
  ])("rejects an invalid %s", async (_label, body) => {
    const { POST } = await routeModulePromise;
    const response = await POST(createRequest(body));

    expect(response.status).toBe(400);
    expect(importTransactionMock).not.toHaveBeenCalled();
  });

  it("normalizes nullable notes from integration clients", async () => {
    const { POST } = await routeModulePromise;
    importTransactionMock.mockResolvedValue({
      sourceRecordId: validBody.sourceRecordId,
      sourceSystem: validBody.sourceSystem,
      status: "created",
      transactionId: "transaction-1",
    });

    const response = await POST(
      createRequest({
        ...validBody,
        transaction: { ...validBody.transaction, notes: null },
      }),
    );

    expect(response.status).toBe(201);
    expect(importTransactionMock).toHaveBeenCalledWith("user-1", {
      ...validBody,
      transaction: { ...validBody.transaction, notes: undefined },
    });
  });

  it.each([
    ["created", 201],
    ["already_imported", 200],
  ] as const)("returns %s with the documented contract", async (status, httpStatus) => {
    const { POST } = await routeModulePromise;
    importTransactionMock.mockResolvedValue({
      sourceRecordId: validBody.sourceRecordId,
      sourceSystem: validBody.sourceSystem,
      status,
      transactionId: "transaction-1",
    });

    const response = await POST(createRequest(validBody));

    expect(response.status).toBe(httpStatus);
    expect(response.headers.get("x-request-id")).toBe("integration-test-001");
    await expect(response.json()).resolves.toEqual({
      data: {
        import: {
          sourceRecordId: validBody.sourceRecordId,
          sourceSystem: validBody.sourceSystem,
          status,
        },
        transaction: { id: "transaction-1" },
      },
      success: true,
    });
    expect(importTransactionMock).toHaveBeenCalledWith("user-1", validBody);
  });
});
