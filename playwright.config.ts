import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/playwright",
  timeout: 120000,
  use: {
    headless: false,
    launchOptions: {
      slowMo: 100,
    },
  },
});
