import { expect, test } from "@playwright/test";

import {
  cleanupTestUser,
  createTestUser,
  signUpUser,
} from "./helpers/test-data";

test("user can manage categories, transactions, profile, and password", async ({
  page,
}) => {
  const user = createTestUser();
  const updatedPassword = "NewPassword123";

  try {
    await signUpUser(page, user);
    await expect(page).toHaveURL(/\/dashboard$/);

    await page.goto("/categories");
    await page.getByLabel("Category name").fill("Pet Care");
    await page.getByLabel("Type").selectOption("EXPENSE");
    await page.getByRole("button", { name: "Create category" }).click();
    await expect(
      page.getByText("Custom category created successfully."),
    ).toBeVisible();
    await expect(page.getByText("Pet Care")).toBeVisible();

    await page.getByRole("button", { name: "Edit" }).click();
    await page.getByLabel(/Category name/i).last().fill("Pet Supplies");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Pet Supplies")).toBeVisible();

    await page.goto("/transactions");
    await page.locator("#description-create-new").fill("Vet visit");
    await page.locator("#amount-create-new").fill("125.50");
    await page.locator("#occurredOn-create-new").fill("2026-04-19");
    await page.locator("#type-create-new").selectOption("EXPENSE");
    await page.locator("#category-create-new").selectOption({ label: "Pet Supplies" });
    await page.locator("#notes-create-new").fill("Annual check-up");
    await page.getByRole("button", { name: "Create transaction" }).click();
    await expect(
      page.getByText("Transaction created successfully."),
    ).toBeVisible();
    await page.reload();
    await expect(page.getByText("Vet visit")).toBeVisible();

    await page.getByRole("button", { name: "Edit" }).first().click();
    await page.locator('input[id^="description-edit-"]').fill("Vet appointment");
    const updateTransactionResponse = page.waitForResponse(
      (response) =>
        response.request().method() === "PATCH" &&
        response.url().includes("/api/transactions/"),
    );
    await page.getByRole("button", { name: "Save changes" }).click();
    await updateTransactionResponse;
    await page.reload();
    await expect(page.getByText("Vet appointment")).toBeVisible();

    page.once("dialog", (dialog) => dialog.accept());
    const deleteTransactionResponse = page.waitForResponse(
      (response) =>
        response.request().method() === "DELETE" &&
        response.url().includes("/api/transactions/"),
    );
    await page.getByRole("button", { name: "Delete" }).first().click();
    await deleteTransactionResponse;
    await page.reload();
    await expect(page.getByText("Vet appointment")).not.toBeVisible();

    await page.goto("/settings");
    const currencyInput = page.locator("#profile-currency");
    const timezoneInput = page.locator("#profile-timezone");

    await currencyInput.clear();
    await currencyInput.fill("BRL");
    await expect(currencyInput).toHaveValue("BRL");

    await timezoneInput.clear();
    await timezoneInput.fill("America/Sao_Paulo");
    await expect(timezoneInput).toHaveValue("America/Sao_Paulo");

    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.request().method() === "PATCH" &&
          response.url().includes("/api/profile"),
      ),
      page.getByRole("button", { name: "Save changes" }).first().click(),
    ]);
    await page.reload();
    await expect(page.getByText("BRL / America/Sao_Paulo")).toBeVisible();

    await page.getByLabel("Current password").fill(user.password);
    await page.getByLabel("New password", { exact: true }).fill(updatedPassword);
    await page.getByLabel("Confirm new password", { exact: true }).fill(
      updatedPassword,
    );
    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.request().method() === "POST" &&
          response.url().includes("/api/auth/change-password"),
      ),
      page.getByRole("button", { name: "Change password" }).click(),
    ]);
    await expect(
      page.getByText(
        "Password updated successfully. Existing sessions were invalidated.",
      ),
    ).toBeVisible();

    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/sign-in/);

    await page.getByLabel("Email address").fill(user.email);
    await page.getByLabel("Password", { exact: true }).fill(updatedPassword);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);

    await page.goto("/categories");
    page.once("dialog", (dialog) => dialog.accept());
    const deleteCategoryResponse = page.waitForResponse(
      (response) =>
        response.request().method() === "DELETE" &&
        response.url().includes("/api/categories/"),
    );
    await page.getByRole("button", { name: "Delete" }).first().click();
    await deleteCategoryResponse;
    await expect(page.getByText("Pet Supplies")).not.toBeVisible();
  } finally {
    await cleanupTestUser(user.email);
  }
});
