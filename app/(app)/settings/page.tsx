import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChangePasswordForm } from "@/features/auth/components/change-password-form";
import { ProfileForm } from "@/features/profile/components/profile-form";
import { getProfileSettings } from "@/features/profile/profile.service";
import { requireCurrentUser } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/formatters/date";
import {
  getCurrencyOptions,
  getTimeZoneOptions,
} from "@/lib/preferences/user-preferences";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const sessionUser = await requireCurrentUser();
  const profile = await getProfileSettings(sessionUser.id);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/50">
          Settings
        </p>
        <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">
          Manage your profile and reporting preferences.
        </h1>
        <p className="max-w-2xl text-base text-foreground/66">
          Keep your account details current and define how currency and
          account-localized timestamps are presented across the application.
        </p>
      </div>

      <div className="space-y-6">
        <Card className="bg-card-strong">
          <CardHeader>
            <CardDescription>Profile editor</CardDescription>
            <CardTitle>Update account details and preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm
              currencyOptions={getCurrencyOptions()}
              initialValues={{
                currencyCode: profile.user.currencyCode,
                email: profile.user.email,
                name: profile.user.name,
                timezone: profile.user.timezone,
              }}
              previewTimestamp={new Date().toISOString()}
              timezoneOptions={getTimeZoneOptions()}
            />
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2 xl:items-start">
          <Card className="bg-card-strong">
            <CardHeader>
              <CardDescription>Account security</CardDescription>
              <CardTitle>Change password and invalidate older sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm leading-6 text-foreground/64">
                After a successful password change, older signed sessions become
                invalid and the current browser receives a fresh session token.
              </p>
              <ChangePasswordForm />
            </CardContent>
          </Card>

          <Card className="bg-card-strong">
            <CardHeader>
              <CardDescription>Account overview</CardDescription>
              <CardTitle>Current profile snapshot</CardTitle>
            </CardHeader>
            <CardContent className="grid border-t border-border sm:grid-cols-2">
              <div className="border-b border-border py-4 sm:col-span-2">
                <p className="text-sm font-medium text-foreground/62">Email</p>
                <p className="mt-1 break-all text-base font-semibold text-foreground">
                  {profile.user.email}
                </p>
              </div>

              <div className="border-b border-border py-4 sm:border-r sm:pr-4">
                <p className="text-sm font-medium text-foreground/62">
                  Transactions
                </p>
                <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground">
                  {profile.transactionCount}
                </p>
              </div>
              <div className="border-b border-border py-4 sm:pl-4">
                <p className="text-sm font-medium text-foreground/62">
                  Custom categories
                </p>
                <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground">
                  {profile.customCategoryCount}
                </p>
              </div>

              <div className="border-b border-border py-4 sm:border-b-0 sm:border-r sm:pr-4">
                <p className="text-sm font-medium text-foreground/62">
                  Account created
                </p>
                <p className="mt-1 font-mono text-sm font-medium tabular-nums text-foreground">
                  {formatDateTime(profile.user.createdAt, profile.user.timezone)}
                </p>
              </div>

              <div className="py-4 sm:pl-4">
                <p className="text-sm font-medium text-foreground/62">
                  Last profile update
                </p>
                <p className="mt-1 font-mono text-sm font-medium tabular-nums text-foreground">
                  {formatDateTime(profile.user.updatedAt, profile.user.timezone)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card-strong">
          <CardHeader>
            <CardDescription>Preference behavior</CardDescription>
            <CardTitle>How your settings affect financial data</CardTitle>
          </CardHeader>
          <CardContent className="grid border-t border-border md:grid-cols-3">
            <div className="border-b border-border py-5 md:border-r md:border-b-0 md:pr-5">
              <p className="font-semibold text-foreground">Currency formatting</p>
              <p className="mt-2 text-sm leading-6 text-foreground/64">
                Financial amounts use your preferred currency throughout the
                dashboard, transactions, and category reporting.
              </p>
            </div>
            <div className="border-b border-border py-5 md:border-r md:border-b-0 md:px-5">
              <p className="font-semibold text-foreground">Transaction dates</p>
              <p className="mt-2 text-sm leading-6 text-foreground/64">
                Transaction dates remain calendar-based, preserving the day you
                selected when your time zone changes.
              </p>
            </div>
            <div className="py-5 md:pl-5">
              <p className="font-semibold text-foreground">Account timestamps</p>
              <p className="mt-2 text-sm leading-6 text-foreground/64">
                Creation and profile-update timestamps are localized using your
                selected time zone.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
