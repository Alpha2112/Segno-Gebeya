import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/web",
  timeout: 300000,
  expect: { timeout: 20000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  use: {
    channel: "chrome",
    headless: true,
    trace: "off",
    screenshot: "only-on-failure",
  },
  reporter: [["list"], ["html", { open: "never" }]],
  webServer: [
    {
      command: "pnpm dev:merchant",
      url: "http://localhost:15173",
      reuseExistingServer: !process.env.CI,
      timeout: 60000,
    },
    {
      command: "pnpm dev:admin",
      url: "http://localhost:15174",
      reuseExistingServer: !process.env.CI,
      timeout: 60000,
    },
  ],
});
