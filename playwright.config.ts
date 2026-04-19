import "dotenv/config";

import { defineConfig, devices } from "@playwright/test";

const e2ePort = 3001;
const e2eBaseUrl = `http://localhost:${e2ePort}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  timeout: 60_000,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  workers: 1,
  use: {
    baseURL: e2eBaseUrl,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
  webServer: {
    command: `npm run build && APP_URL=${e2eBaseUrl} npx next start --port ${e2ePort}`,
    reuseExistingServer: false,
    timeout: 120000,
    url: `${e2eBaseUrl}/api/health`,
  },
});
