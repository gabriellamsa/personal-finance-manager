import { z } from "zod";

import {
  isSupportedCurrencyCode,
  isSupportedTimeZone,
} from "@/lib/preferences/user-preferences";
import {
  displayNameSchema,
  emailSchema,
} from "@/features/auth/auth.schemas";

export const updateProfileSchema = z.object({
  currencyCode: z
    .string()
    .trim()
    .length(3, "Currency code must be 3 characters long.")
    .transform((value) => value.toUpperCase())
    .refine(isSupportedCurrencyCode, "Choose a supported currency code."),
  email: emailSchema,
  name: displayNameSchema,
  timezone: z
    .string()
    .trim()
    .min(1, "Time zone is required.")
    .refine(isSupportedTimeZone, "Choose a supported time zone."),
});

export type UpdateProfileFormValues = z.input<typeof updateProfileSchema>;
export type UpdateProfileInput = z.output<typeof updateProfileSchema>;
