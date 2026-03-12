import { test, expect } from "@playwright/test";

/**
 * Playwright-assisted local tests for LinkedIn profile extraction.
 *
 * These tests are NOT run in CI. They require:
 * 1. A real LinkedIn profile URL (set LIEX_TEST_PROFILE_URL env var)
 * 2. An authenticated browser context (see docs/playwright-setup.md)
 *
 * Run with: npx playwright test tests/playwright/ --headed
 */

test.skip(!process.env.LIEX_TEST_PROFILE_URL, "Set LIEX_TEST_PROFILE_URL to run");

test("extracts profile from live LinkedIn page", async ({ page }) => {
  const url = process.env.LIEX_TEST_PROFILE_URL!;
  await page.goto(url, { waitUntil: "networkidle" });

  // Inject the runtime bundle
  await page.addScriptTag({ path: "apps/bookmarklet/dist/runtime.js" });

  // Wait for overlay to appear
  const overlay = page.locator("#liex-overlay");
  await expect(overlay).toBeVisible({ timeout: 30000 });

  // Wait for completion
  await expect(overlay.locator(".liex-status")).toContainText("Complete", { timeout: 60000 });

  // Verify action buttons appear
  await expect(overlay.locator("text=Copy JSON")).toBeVisible();
  await expect(overlay.locator("text=Download JSON")).toBeVisible();
});
