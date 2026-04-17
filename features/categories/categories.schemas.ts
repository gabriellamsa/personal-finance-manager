import { z } from "zod";

import { TRANSACTION_TYPES } from "@/lib/constants/transactions";

export const createCategorySchema = z.object({
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Choose a valid hex color.")
    .default("#0F766E"),
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters long.")
    .max(50, "Category name must be 50 characters or fewer."),
  type: z.enum(TRANSACTION_TYPES),
});

export type CreateCategoryFormInput = z.input<typeof createCategorySchema>;
export type CreateCategoryInput = z.output<typeof createCategorySchema>;
