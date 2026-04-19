import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-foreground/45">
          Settings
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          Manage your profile and reporting preferences.
        </h1>
        <p className="max-w-2xl text-base text-foreground/66">
          Keep your account details current and define how currency and
          account-localized timestamps are presented across the application.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
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

        <div className="space-y-6">
          <Card className="bg-card-strong">
            <CardHeader>
              <CardDescription>Account overview</CardDescription>
              <CardTitle>Current profile snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[22px] border border-border bg-white/72 p-4">
                <p className="text-sm font-medium text-foreground/62">Email</p>
                <p className="mt-1 text-base font-semibold text-foreground">
                  {profile.user.email}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[22px] border border-border bg-white/72 p-4">
                  <p className="text-sm font-medium text-foreground/62">
                    Transactions
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">
                    {profile.transactionCount}
                  </p>
                </div>
                <div className="rounded-[22px] border border-border bg-white/72 p-4">
                  <p className="text-sm font-medium text-foreground/62">
                    Custom categories
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">
                    {profile.customCategoryCount}
                  </p>
                </div>
              </div>

              <div className="rounded-[22px] border border-border bg-white/72 p-4">
                <p className="text-sm font-medium text-foreground/62">
                  Account created
                </p>
                <p className="mt-1 text-base font-semibold text-foreground">
                  {formatDateTime(profile.user.createdAt, profile.user.timezone)}
                </p>
              </div>

              <div className="rounded-[22px] border border-border bg-white/72 p-4">
                <p className="text-sm font-medium text-foreground/62">
                  Last profile update
                </p>
                <p className="mt-1 text-base font-semibold text-foreground">
                  {formatDateTime(profile.user.updatedAt, profile.user.timezone)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card-strong">
            <CardHeader>
              <CardDescription>Time zone behavior</CardDescription>
              <CardTitle>How time-based data is handled</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-foreground/64">
              <p>
                Financial amounts use your preferred currency throughout the dashboard,
                transactions, and category reporting.
              </p>
              <p>
                Transaction dates remain calendar-based, which preserves the day you
                selected even if you later change your time zone.
              </p>
              <p>
                Account timestamps, such as creation and last profile update, are
                localized using your selected time zone.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
