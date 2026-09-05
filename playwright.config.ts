import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 45 * 1000,
  expect: {
    timeout: 8000,
  },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "output/playwright/html-report" }],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3019",
    trace: "retain-on-failure",
    screenshot: "on",
    permissions: ["clipboard-read", "clipboard-write"],
  },
  projects: [
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: {
    command: "npm.cmd run start -- -p 3019",
    url: "http://localhost:3019",
    reuseExistingServer: false,
    timeout: 120 * 1000,
  },
});
