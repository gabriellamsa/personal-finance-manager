import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import { chromium } from "@playwright/test";

// Run from this repository with the sibling Python environment installed.
// Only a new synthetic account is created; its data is removed in finally.
const baseURL = process.env.PORTFOLIO_DEMO_URL || "http://localhost:3002";
for (const value of [baseURL, process.env.DATABASE_URL]) {
  assert.ok(["localhost", "127.0.0.1"].includes(new URL(value).hostname), "Local destinations only");
}
const pipeline = resolve("../transaction-import-recovery-pipeline");
const output = resolve("docs/evidence");
const jobs = resolve(pipeline, ".pipeline-output", `portfolio-${randomUUID()}`);
await mkdir(output, { recursive: true });
const prisma = new PrismaClient();
const browser = await chromium.launch();
const context = await browser.newContext({ baseURL, viewport: { width: 1440, height: 960 } });
const email = `demo-${randomUUID().slice(0, 8)}@example.com`;
const password = `Demo1-${randomUUID()}`;
const evidence = { capturedAt: new Date().toISOString(), environment: "local synthetic demonstration", scenarios: [] };
let userId;

async function runPipeline(label, filename, apply, expectedExit, expected) {
  const jobOutput = resolve(jobs, label);
  const result = spawnSync(resolve(pipeline, ".venv/bin/python"), [
    "-m", "transaction_import_pipeline.cli", "run", `samples/${filename}`, ...(apply ? ["--apply"] : []),
  ], {
    cwd: pipeline, encoding: "utf8",
    env: { ...process.env, PFM_BASE_URL: baseURL, PFM_USER_EMAIL: email, PFM_USER_PASSWORD: password, PIPELINE_OUTPUT_DIR: jobOutput },
  });
  // Never print raw child output: retain only the safe aggregate report.
  assert.equal(result.status, expectedExit, `${label}: unexpected CLI exit`);
  const directories = await readdir(jobOutput);
  assert.equal(directories.length, 1);
  const summary = JSON.parse(await readFile(resolve(jobOutput, directories[0], "summary.json"), "utf8"));
  for (const [key, value] of Object.entries(expected)) assert.equal(summary[key], value, `${label}: ${key}`);
  const safe = Object.fromEntries(["received", "valid", "created", "already_imported", "rejected_validation", "rejected_category", "source_conflicts", "retry_count"].map(key => [key, summary[key]]));
  evidence.scenarios.push({ name: label, exitCode: result.status, ...safe });
}

try {
  const response = await context.request.post("/api/auth/register", { data: { email, name: "Portfolio Demo", password, confirmPassword: password } });
  assert.equal(response.status(), 201);
  const user = await prisma.user.findUniqueOrThrow({ where: { email } });
  userId = user.id;
  await runPipeline("dry-run", "transactions-mixed.csv", false, 2, { created: 0 });
  assert.equal(await prisma.transaction.count({ where: { userId } }), 0);
  await runPipeline("first-import", "transactions-valid.csv", true, 0, { created: 3 });
  await runPipeline("identical-replay", "transactions-valid.csv", true, 0, { created: 0, already_imported: 3 });
  assert.equal(await prisma.transaction.count({ where: { userId } }), 3);
  await runPipeline("changed-replay", "transactions-conflict.csv", true, 2, { created: 0, source_conflicts: 1 });
  assert.equal(await prisma.transaction.count({ where: { userId } }), 3);

  const categories = await prisma.category.findMany({ where: { scope: "SYSTEM" } });
  const now = new Date();
  for (let month = 0; month < 6; month++) {
    for (const [key, amountInCents, description] of [["salary", 340000, "Monthly salary"], ["housing", 110000, "Apartment rent"], ["groceries", 28500 + month * 1300, "Weekly groceries"], ["transport", 7800, "Monthly transit pass"], ["freelance", 65000 + month * 2200, "Design project"]]) {
      const category = categories.find(item => item.systemKey === key);
      assert.ok(category);
      await prisma.transaction.create({ data: { userId, categoryId: category.id, type: category.type, amountInCents, description, notes: "Synthetic portfolio demonstration", occurredOn: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - month, 3)) } });
    }
  }
  const page = await context.newPage();
  for (const route of ["dashboard", "transactions", "categories"]) {
    await page.goto(`/${route}`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1800);
    assert.equal(new URL(page.url()).pathname, `/${route}`);
    await page.screenshot({ path: resolve(output, `${route}.png`), fullPage: true, animations: "disabled" });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/dashboard");
  await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1800);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.screenshot({ path: resolve(output, "dashboard-mobile.png"), fullPage: true, animations: "disabled" });

  // Record only authenticated product screens, never account credentials.
  const videoContext = await browser.newContext({ baseURL, storageState: await context.storageState(), viewport: { width: 1280, height: 800 }, recordVideo: { dir: resolve(output, "video"), size: { width: 1280, height: 800 } } });
  const videoPage = await videoContext.newPage();
  for (const route of ["dashboard", "transactions", "categories", "dashboard"]) {
    await videoPage.goto(`/${route}`);
    await videoPage.waitForLoadState("networkidle");
    await videoPage.waitForTimeout(2500);
  }
  await videoContext.close();
  await videoPage.video().saveAs(resolve(output, "product-demo.webm"));
} finally {
  if (userId) await prisma.user.delete({ where: { id: userId } });
  await prisma.$disconnect();
  await context.close();
  await browser.close();
}
evidence.syntheticAccountRemoved = true;
await writeFile(resolve(output, "integration-results.json"), JSON.stringify(evidence, null, 2) + "\n");
console.log(JSON.stringify(evidence, null, 2));
