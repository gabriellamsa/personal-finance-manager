"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from "@/features/auth/auth.schemas";
import { getClientErrorMessage } from "@/lib/http/client";
import { type ApiFailure, type ApiSuccess } from "@/lib/http/response";

type ChangePasswordResponse =
  | ApiSuccess<{
      user: {
        email: string;
        id: string;
        name: string;
      };
    }>
  | ApiFailure;

export function ChangePasswordForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<ChangePasswordInput>({
    defaultValues: {
      confirmNewPassword: "",
      currentPassword: "",
      newPassword: "",
    },
    resolver: zodResolver(changePasswordSchema),
  });

  async function handleSubmit(values: ChangePasswordInput) {
    setFormError(null);
    setSuccessMessage(null);
    form.clearErrors();

    try {
      const response = await fetch("/api/auth/change-password", {
        body: JSON.stringify(values),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      });

      const result = (await response.json()) as ChangePasswordResponse;

      if (!response.ok && "error" in result) {
        for (const [field, messages] of Object.entries(
          result.error.fieldErrors ?? {},
        )) {
          const message = messages?.[0];

          if (!message) {
            continue;
          }

          form.setError(field as keyof ChangePasswordInput, {
            message,
            type: "server",
          });
        }

        setFormError(result.error.message);
        return;
      }

      form.reset({
        confirmNewPassword: "",
        currentPassword: "",
        newPassword: "",
      });
      setSuccessMessage(
        "Password updated successfully. Existing sessions were invalidated.",
      );

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setFormError(
        getClientErrorMessage(
          error,
          "Unable to change your password right now. Please try again.",
        ),
      );
    }
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)} noValidate>
      <div className="space-y-2">
        <Label htmlFor="current-password">Current password</Label>
        <Input
          id="current-password"
          type="password"
          autoComplete="current-password"
          {...form.register("currentPassword")}
        />
        {form.formState.errors.currentPassword ? (
          <p className="text-sm text-danger">
            {form.formState.errors.currentPassword.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-password">New password</Label>
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          {...form.register("newPassword")}
        />
        {form.formState.errors.newPassword ? (
          <p className="text-sm text-danger">
            {form.formState.errors.newPassword.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-new-password">Confirm new password</Label>
        <Input
          id="confirm-new-password"
          type="password"
          autoComplete="new-password"
          {...form.register("confirmNewPassword")}
        />
        {form.formState.errors.confirmNewPassword ? (
          <p className="text-sm text-danger">
            {form.formState.errors.confirmNewPassword.message}
          </p>
        ) : null}
      </div>

      {formError ? <FormMessage tone="error">{formError}</FormMessage> : null}
      {successMessage ? (
        <FormMessage tone="success">{successMessage}</FormMessage>
      ) : null}

      <Button
        type="submit"
        disabled={form.formState.isSubmitting}
        aria-busy={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? "Updating password..." : "Change password"}
      </Button>
    </form>
  );
}
