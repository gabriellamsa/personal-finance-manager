import type { Page } from "@playwright/test";

export type TestUser = {
  email: string;
  name: string;
  password: string;
};

export function createTestUser() {
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    email: `e2e-${nonce}@example.com`,
    name: `E2E User ${nonce}`,
    password: "Password123",
  } satisfies TestUser;
}

export async function cleanupTestUser(email: string) {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  await prisma.user.deleteMany({
    where: {
      email,
    },
  });

  await prisma.$disconnect();
}

export async function signUpUser(page: Page, user: TestUser) {
  await page.goto("/sign-up");
  await page.getByLabel("Full name").fill(user.name);
  await page.getByLabel("Email address").fill(user.email);
  await page.getByLabel("Password", { exact: true }).fill(user.password);
  await page.getByLabel("Confirm password", { exact: true }).fill(user.password);
  await page.getByRole("button", { name: "Create account" }).click();
}

export async function signInUser(page: Page, user: TestUser) {
  await page.goto("/sign-in");
  await page.getByLabel("Email address").fill(user.email);
  await page.getByLabel("Password", { exact: true }).fill(user.password);
  await page.getByRole("button", { name: "Sign in" }).click();
}
