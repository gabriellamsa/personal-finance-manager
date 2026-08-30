import { expect, test } from "@playwright/test";

import {
  cleanupTestUser,
  createTestUser,
  signInUser,
  signUpUser,
} from "./helpers/test-data";

test("auth forms never fall back to query-string credential submission", async ({
  page,
}) => {
  await page.goto("/sign-in");
  await expect(page.locator("form")).toHaveAttribute("method", "post");

  await page.goto("/sign-up");
  await expect(page.locator("form")).toHaveAttribute("method", "post");
});

test("an invalid stale session cookie does not trap users in a redirect loop", async ({
  context,
  page,
}) => {
  await context.addCookies([
    {
      name: "pfm_session",
      url: "http://localhost:3001",
      value: "invalid-stale-session",
    },
  ]);

  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();

  await page.reload();
  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});

test("user can sign up, sign out, and sign in again", async ({ page }) => {
  const user = createTestUser();

  try {
    await signUpUser(page, user);

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(
      page.getByRole("heading", { name: /welcome back/i }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.getByText("Signed out successfully")).toBeVisible();

    await signInUser(page, user);
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(
      page.getByRole("complementary").getByText(user.email),
    ).toBeVisible();
  } finally {
    await cleanupTestUser(user.email);
  }
});
