import "server-only";

import { createHash } from "node:crypto";

import { Prisma } from "@prisma/client";

import { getCategoryForUser } from "@/features/categories/categories.service";
import type { TransactionImportInput } from "@/features/integrations/transaction-import.schemas";
import { prisma } from "@/lib/db/prisma";
import { SourceRecordConflictError, ValidationError } from "@/lib/http/errors";
import { parseDateInput } from "@/lib/utils/date";

type ImportResult = {
  sourceRecordId: string;
  sourceSystem: string;
  status: "already_imported" | "created";
  transactionId: string;
};

function createPayloadHash(input: TransactionImportInput) {
  const canonicalPayload = JSON.stringify({
    amountInCents: input.transaction.amountInCents,
    categoryId: input.transaction.categoryId,
    description: input.transaction.description,
    notes: input.transaction.notes ?? null,
    occurredOn: input.transaction.occurredOn,
    sourceRecordId: input.sourceRecordId,
    sourceSystem: input.sourceSystem,
    type: input.transaction.type,
  });

  return createHash("sha256").update(canonicalPayload).digest("hex");
}

function isUniqueConstraintError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
  );
}

async function resolveExistingImport(
  userId: string,
  input: TransactionImportInput,
  payloadHash: string,
): Promise<ImportResult | null> {
  const existing = await prisma.transactionImport.findUnique({
    select: {
      payloadHash: true,
      transactionId: true,
    },
    where: {
      userId_sourceSystem_sourceRecordId: {
        sourceRecordId: input.sourceRecordId,
        sourceSystem: input.sourceSystem,
        userId,
      },
    },
  });

  if (!existing) {
    return null;
  }

  if (existing.payloadHash !== payloadHash) {
    throw new SourceRecordConflictError();
  }

  return {
    sourceRecordId: input.sourceRecordId,
    sourceSystem: input.sourceSystem,
    status: "already_imported",
    transactionId: existing.transactionId,
  };
}

export async function importTransaction(
  userId: string,
  input: TransactionImportInput,
): Promise<ImportResult> {
  const category = await getCategoryForUser(userId, input.transaction.categoryId);

  if (category.type !== input.transaction.type) {
    throw new ValidationError(
      "The selected category type does not match the transaction type.",
      { categoryId: ["Choose a category that matches the transaction type."] },
    );
  }

  const payloadHash = createPayloadHash(input);
  const existing = await resolveExistingImport(userId, input, payloadHash);

  if (existing) {
    return existing;
  }

  try {
    const transaction = await prisma.transaction.create({
      data: {
        amountInCents: input.transaction.amountInCents,
        categoryId: input.transaction.categoryId,
        description: input.transaction.description,
        importMetadata: {
          create: {
            payloadHash,
            sourceRecordId: input.sourceRecordId,
            sourceSystem: input.sourceSystem,
            userId,
          },
        },
        notes: input.transaction.notes,
        occurredOn: parseDateInput(input.transaction.occurredOn),
        type: input.transaction.type,
        userId,
      },
      select: { id: true },
    });

    return {
      sourceRecordId: input.sourceRecordId,
      sourceSystem: input.sourceSystem,
      status: "created",
      transactionId: transaction.id,
    };
  } catch (error) {
    if (!isUniqueConstraintError(error)) {
      throw error;
    }

    const racedImport = await resolveExistingImport(userId, input, payloadHash);

    if (!racedImport) {
      throw error;
    }

    return racedImport;
  }
}
