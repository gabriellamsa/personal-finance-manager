import { z } from "zod";

import { TRANSACTION_TYPES } from "@/lib/constants/transactions";

const occurredOnSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date.")
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
  }, "Choose a valid date.");

const importedTransactionSchema = z
  .object({
    amountInCents: z.number().int().positive().max(2_147_483_647),
    categoryId: z.string().cuid(),
    description: z.string().trim().min(2).max(120),
    notes: z
      .string()
      .trim()
      .max(500)
      .nullish()
      .transform((value) => value || undefined),
    occurredOn: occurredOnSchema,
    type: z.enum(TRANSACTION_TYPES),
  })
  .strict();

export const transactionImportSchema = z
  .object({
    sourceRecordId: z
      .string()
      .trim()
      .min(1)
      .max(128)
      .regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/),
    sourceSystem: z
      .string()
      .trim()
      .min(1)
      .max(64)
      .regex(/^[a-z0-9][a-z0-9-]*$/),
    transaction: importedTransactionSchema,
  })
  .strict();

export type TransactionImportInput = z.output<typeof transactionImportSchema>;
