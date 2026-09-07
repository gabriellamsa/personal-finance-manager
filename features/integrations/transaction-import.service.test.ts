import { beforeEach, describe, expect, it, vi } from "vitest";

import { Prisma } from "@prisma/client";

import { SourceRecordConflictError, ValidationError } from "@/lib/http/errors";

const getCategoryForUserMock = vi.hoisted(() => vi.fn());
const findUniqueMock = vi.hoisted(() => vi.fn());
const createTransactionMock = vi.hoisted(() => vi.fn());

vi.mock("@/features/categories/categories.service", () => ({
  getCategoryForUser: getCategoryForUserMock,
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    transaction: { create: createTransactionMock },
    transactionImport: { findUnique: findUniqueMock },
  },
}));

const serviceModulePromise = import("@/features/integrations/transaction-import.service");

const input = {
  sourceRecordId: "bank-export-2026-0001",
  sourceSystem: "transaction-import-recovery-pipeline",
  transaction: {
    amountInCents: 2599,
    categoryId: "cmf0000000000000000000001",
    description: "Synthetic grocery transaction",
    notes: "Synthetic portfolio data",
    occurredOn: "2026-08-01",
    type: "EXPENSE" as const,
  },
};

describe("transaction import service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCategoryForUserMock.mockResolvedValue({ type: "EXPENSE" });
    findUniqueMock.mockResolvedValue(null);
  });

  it("atomically creates a transaction and its import metadata", async () => {
    const { importTransaction } = await serviceModulePromise;
    createTransactionMock.mockResolvedValue({ id: "transaction-1" });

    const result = await importTransaction("user-1", input);

    expect(result.status).toBe("created");
    expect(createTransactionMock).toHaveBeenCalledOnce();
    const createData = createTransactionMock.mock.calls[0]?.[0]?.data;
    expect(createData.amountInCents).toBe(2599);
    expect(createData.importMetadata.create).toMatchObject({
      sourceRecordId: input.sourceRecordId,
      sourceSystem: input.sourceSystem,
      userId: "user-1",
    });
    expect(createData.importMetadata.create.payloadHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("returns already_imported for the same key and canonical payload", async () => {
    const { importTransaction } = await serviceModulePromise;
    createTransactionMock.mockResolvedValueOnce({ id: "transaction-1" });
    await importTransaction("user-1", input);
    const payloadHash = createTransactionMock.mock.calls[0]?.[0]?.data.importMetadata.create.payloadHash;
    findUniqueMock.mockResolvedValue({ payloadHash, transactionId: "transaction-1" });

    const result = await importTransaction("user-1", input);

    expect(result).toMatchObject({ status: "already_imported", transactionId: "transaction-1" });
    expect(createTransactionMock).toHaveBeenCalledOnce();
  });

  it("rejects the same source key with a different payload", async () => {
    const { importTransaction } = await serviceModulePromise;
    findUniqueMock.mockResolvedValue({ payloadHash: "0".repeat(64), transactionId: "transaction-1" });

    await expect(importTransaction("user-1", input)).rejects.toBeInstanceOf(
      SourceRecordConflictError,
    );
    expect(createTransactionMock).not.toHaveBeenCalled();
  });

  it("rejects category and transaction type mismatches", async () => {
    const { importTransaction } = await serviceModulePromise;
    getCategoryForUserMock.mockResolvedValue({ type: "INCOME" });

    await expect(importTransaction("user-1", input)).rejects.toBeInstanceOf(
      ValidationError,
    );
    expect(createTransactionMock).not.toHaveBeenCalled();
  });

  it("recovers a concurrent unique race without creating a duplicate", async () => {
    const { importTransaction } = await serviceModulePromise;
    const error = new Prisma.PrismaClientKnownRequestError("Unique constraint", {
      clientVersion: "6.19.3",
      code: "P2002",
    });
    createTransactionMock.mockRejectedValue(error);
    findUniqueMock
      .mockResolvedValueOnce(null)
      .mockImplementationOnce(async () => {
        const attemptedHash = createTransactionMock.mock.calls[0]?.[0]?.data.importMetadata.create.payloadHash;
        return { payloadHash: attemptedHash, transactionId: "transaction-winner" };
      });

    await expect(importTransaction("user-1", input)).resolves.toMatchObject({
      status: "already_imported",
      transactionId: "transaction-winner",
    });
  });

  it("leaves no import metadata when transaction creation fails", async () => {
    const { importTransaction } = await serviceModulePromise;
    createTransactionMock.mockRejectedValue(new Error("database failure"));

    await expect(importTransaction("user-1", input)).rejects.toThrow("database failure");
    expect(createTransactionMock.mock.calls[0]?.[0]?.data.importMetadata.create).toBeTruthy();
  });
});
