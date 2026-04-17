import { z } from "zod";

import { DEFAULT_PAGE_SIZE, TRANSACTION_TYPES } from "@/lib/constants/transactions";

const dateInputSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date.");

export const transactionFormSchema = z.object({
  amount: z.coerce
    .number()
    .positive("Amount must be greater than zero.")
    .max(99999999, "Amount is too large."),
  categoryId: z.string().cuid("Choose a valid category."),
  description: z
    .string()
    .trim()
    .min(2, "Description must be at least 2 characters long.")
    .max(120, "Description must be 120 characters or fewer."),
  notes: z
    .string()
    .trim()
    .max(500, "Notes must be 500 characters or fewer.")
    .optional()
    .transform((value) => value || undefined),
  occurredOn: dateInputSchema,
  type: z.enum(TRANSACTION_TYPES),
});

export const transactionFilterSchema = z
  .object({
    categoryId: z.string().cuid().optional(),
    from: dateInputSchema.optional(),
    page: z.coerce.number().int().positive().default(1),
    to: dateInputSchema.optional(),
    type: z.enum(TRANSACTION_TYPES).optional(),
  })
  .transform((value) => ({
    ...value,
    pageSize: DEFAULT_PAGE_SIZE,
  }));

export type TransactionFormValues = z.input<typeof transactionFormSchema>;
export type TransactionFormInput = z.output<typeof transactionFormSchema>;
export type TransactionFilterInput = z.output<typeof transactionFilterSchema>;
