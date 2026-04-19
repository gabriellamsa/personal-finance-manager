import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .email("Enter a valid email address.")
  .transform((value) => value.toLowerCase());

export const displayNameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters long.")
  .max(60, "Name must be 60 characters or fewer.");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .max(72, "Password must be 72 characters or fewer.")
  .regex(/[a-z]/, "Password must include at least one lowercase letter.")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
  .regex(/[0-9]/, "Password must include at least one number.");

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
});

export const signUpSchema = z
  .object({
    confirmPassword: z.string().min(1, "Confirm your password."),
    email: emailSchema,
    name: displayNameSchema,
    password: passwordSchema,
  })
  .superRefine(({ confirmPassword, password }, context) => {
    if (password !== confirmPassword) {
      context.addIssue({
        code: "custom",
        message: "Passwords do not match.",
        path: ["confirmPassword"],
      });
    }
  });

export const changePasswordSchema = z
  .object({
    confirmNewPassword: z.string().min(1, "Confirm your new password."),
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: passwordSchema,
  })
  .superRefine(({ confirmNewPassword, currentPassword, newPassword }, context) => {
    if (newPassword === currentPassword) {
      context.addIssue({
        code: "custom",
        message: "Choose a new password different from the current one.",
        path: ["newPassword"],
      });
    }

    if (newPassword !== confirmNewPassword) {
      context.addIssue({
        code: "custom",
        message: "New passwords do not match.",
        path: ["confirmNewPassword"],
      });
    }
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
