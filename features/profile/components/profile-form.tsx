"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UpdateProfileFormValues } from "@/features/profile/profile.schemas";
import { updateProfileSchema } from "@/features/profile/profile.schemas";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDateTime } from "@/lib/formatters/date";
import { type ApiFailure, type ApiSuccess } from "@/lib/http/response";
import { getClientErrorMessage } from "@/lib/http/client";
import {
  isSupportedCurrencyCode,
  isSupportedTimeZone,
  type PreferenceOption,
} from "@/lib/preferences/user-preferences";

type ProfileFormProps = {
  currencyOptions: PreferenceOption[];
  initialValues: UpdateProfileFormValues;
  previewTimestamp: string;
  timezoneOptions: PreferenceOption[];
};

type ProfileResponse =
  | ApiSuccess<{
      user: {
        currencyCode: string;
        email: string;
        id: string;
        name: string;
        timezone: string;
      };
    }>
  | ApiFailure;

function getFieldErrorMessage(messages?: string[]) {
  return messages?.[0];
}

export function ProfileForm({
  currencyOptions,
  initialValues,
  previewTimestamp,
  timezoneOptions,
}: ProfileFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<UpdateProfileFormValues>({
    defaultValues: initialValues,
    resolver: zodResolver(updateProfileSchema),
  });

  const selectedCurrencyCode =
    useWatch({
      control: form.control,
      name: "currencyCode",
    })?.toUpperCase() ?? initialValues.currencyCode;

  const selectedTimeZone =
    useWatch({
      control: form.control,
      name: "timezone",
    }) ?? initialValues.timezone;

  const hasValidCurrencyPreview = isSupportedCurrencyCode(selectedCurrencyCode);
  const hasValidTimeZonePreview = isSupportedTimeZone(selectedTimeZone);

  async function handleSubmit(values: UpdateProfileFormValues) {
    setFormError(null);
    setSuccessMessage(null);
    form.clearErrors();

    try {
      const response = await fetch("/api/profile", {
        body: JSON.stringify(values),
        headers: {
          "content-type": "application/json",
        },
        method: "PATCH",
      });

      const result = (await response.json()) as ProfileResponse;

      if (!response.ok && "error" in result) {
        for (const [field, messages] of Object.entries(
          result.error.fieldErrors ?? {},
        )) {
          const message = getFieldErrorMessage(messages);

          if (!message) {
            continue;
          }

          form.setError(field as keyof UpdateProfileFormValues, {
            message,
            type: "server",
          });
        }

        setFormError(result.error.message);
        return;
      }

      if ("data" in result) {
        form.reset({
          currencyCode: result.data.user.currencyCode,
          email: result.data.user.email,
          name: result.data.user.name,
          timezone: result.data.user.timezone,
        });
      }

      setSuccessMessage("Profile and preferences updated successfully.");

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setFormError(
        getClientErrorMessage(
          error,
          "Unable to save your profile right now. Please try again.",
        ),
      );
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={form.handleSubmit(handleSubmit)}
        noValidate
      >
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="profile-name">Full name</Label>
          <Input
            id="profile-name"
            autoComplete="name"
            placeholder="Jane Doe"
            {...form.register("name")}
          />
          {form.formState.errors.name ? (
            <p className="text-sm text-danger">
              {form.formState.errors.name.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="profile-email">Email address</Label>
          <Input
            id="profile-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...form.register("email")}
          />
          {form.formState.errors.email ? (
            <p className="text-sm text-danger">
              {form.formState.errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-currency">Preferred currency</Label>
          <Input
            id="profile-currency"
            autoCapitalize="characters"
            autoComplete="off"
            list="currency-options"
            maxLength={3}
            placeholder="USD"
            spellCheck={false}
            {...form.register("currencyCode")}
          />
          <datalist id="currency-options">
            {currencyOptions.map((option) => (
              <option key={option.value} value={option.value} label={option.label} />
            ))}
          </datalist>
          <p className="text-xs text-foreground/58">
            Use a 3-letter ISO currency code such as USD, BRL, or EUR.
          </p>
          {form.formState.errors.currencyCode ? (
            <p className="text-sm text-danger">
              {form.formState.errors.currencyCode.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-timezone">Time zone</Label>
          <Input
            id="profile-timezone"
            autoComplete="off"
            list="timezone-options"
            placeholder="America/New_York"
            spellCheck={false}
            {...form.register("timezone")}
          />
          <datalist id="timezone-options">
            {timezoneOptions.map((option) => (
              <option key={option.value} value={option.value} />
            ))}
          </datalist>
          <p className="text-xs text-foreground/58">
            Use a valid IANA time zone such as UTC or America/Sao_Paulo.
          </p>
          {form.formState.errors.timezone ? (
            <p className="text-sm text-danger">
              {form.formState.errors.timezone.message}
            </p>
          ) : null}
        </div>

        {formError ? (
          <FormMessage className="md:col-span-2" tone="error">
            {formError}
          </FormMessage>
        ) : null}

        {successMessage ? (
          <FormMessage className="md:col-span-2" tone="success">
            {successMessage}
          </FormMessage>
        ) : null}

        <div className="md:col-span-2">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            aria-busy={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Saving changes..." : "Save changes"}
          </Button>
        </div>
      </form>

      <div className="space-y-4 rounded-[24px] border border-border bg-white/72 p-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/45">
            Preview
          </p>
          <p className="text-lg font-semibold text-foreground">
            Preference impact
          </p>
          <p className="text-sm text-foreground/64">
            These settings update financial formatting across the product and
            define your account-localized timestamps.
          </p>
        </div>

        <div className="space-y-3 rounded-[20px] border border-border bg-card px-4 py-4">
          <div>
            <p className="text-sm font-medium text-foreground/62">Sample amount</p>
            {hasValidCurrencyPreview ? (
              <p className="text-xl font-semibold text-foreground">
                {formatCurrency(123456, selectedCurrencyCode)}
              </p>
            ) : (
              <p className="text-sm text-foreground/62">
                Enter a supported currency code to preview formatting.
              </p>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground/62">
              Current profile time
            </p>
            {hasValidTimeZonePreview ? (
              <p className="text-base font-semibold text-foreground">
                {formatDateTime(previewTimestamp, selectedTimeZone)}
              </p>
            ) : (
              <p className="text-sm text-foreground/62">
                Enter a supported time zone to preview localization.
              </p>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground/62">Selected zone</p>
            <p className="text-sm text-foreground">{selectedTimeZone}</p>
          </div>
        </div>

        <div className="rounded-[20px] border border-border bg-card px-4 py-4 text-sm text-foreground/64">
          Transaction dates remain tied to the calendar day you selected, so
          changing the time zone will not shift existing entries to a different day.
        </div>
      </div>
    </div>
  );
}
