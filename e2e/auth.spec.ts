import { expect, test } from "@playwright/test";

import {
  cleanupTestUser,
  createTestUser,
  signInUser,
  signUpUser,
} from "./helpers/test-data";

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
    await expect(page.getByText(user.email)).toBeVisible();
  } finally {
    await cleanupTestUser(user.email);
  }
});
