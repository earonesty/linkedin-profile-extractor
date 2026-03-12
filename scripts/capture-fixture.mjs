#!/usr/bin/env node

/**
 * Helper for capturing a new fixture from a live LinkedIn page.
 *
 * Usage with Playwright:
 *   1. Open a LinkedIn profile in a headed Playwright browser
 *   2. Run: node scripts/capture-fixture.mjs <output-name>
 *
 * This script is a template — in practice you would use the browser
 * console to capture document.documentElement.outerHTML and save it.
 *
 * Console one-liner to paste in DevTools:
 *   copy(document.documentElement.outerHTML)
 * Then paste into a file in fixtures/profiles/
 */

import fs from "fs";
import path from "path";

const name = process.argv[2];
if (!name) {
  console.error("Usage: node scripts/capture-fixture.mjs <fixture-name>");
  console.error("");
  console.error("To capture a fixture from a live LinkedIn page:");
  console.error("  1. Open the profile in your browser");
  console.error("  2. Open DevTools console (F12)");
  console.error("  3. Run: copy(document.documentElement.outerHTML)");
  console.error("  4. Paste into: fixtures/profiles/<name>.html");
  console.error("");
  console.error("Or pipe HTML into this script:");
  console.error("  cat page.html | node scripts/capture-fixture.mjs my-fixture");
  process.exit(1);
}

const outPath = path.resolve("fixtures/profiles", `${name}.html`);

// Read from stdin if piped
if (!process.stdin.isTTY) {
  let data = "";
  process.stdin.setEncoding("utf-8");
  process.stdin.on("data", (chunk) => (data += chunk));
  process.stdin.on("end", () => {
    fs.writeFileSync(outPath, data);
    console.log(`Fixture saved to ${outPath} (${data.length} bytes)`);
  });
} else {
  console.error(`No stdin detected. Pipe HTML content or see usage above.`);
  process.exit(1);
}
