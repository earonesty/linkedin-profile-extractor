#!/usr/bin/env node

/**
 * Unpack a fixture bundle JSON into individual fixture files.
 *
 * Usage:
 *   node scripts/unpack-fixtures.mjs path/to/fixtures-username.json
 *
 * Outputs:
 *   fixtures/profiles/real-linkedin-dom.xml          (main profile page)
 *   fixtures/profiles/details-experience.xml         (detail pages)
 *   fixtures/profiles/details-education.xml
 *   ...etc
 *
 * After unpacking, run tests:
 *   pnpm test
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.resolve(__dirname, "../fixtures/profiles");

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Usage: node scripts/unpack-fixtures.mjs <fixtures-username.json>");
  process.exit(1);
}

const resolved = path.resolve(inputPath);
if (!fs.existsSync(resolved)) {
  console.error(`File not found: ${resolved}`);
  process.exit(1);
}

const raw = fs.readFileSync(resolved, "utf-8");
const bundle = JSON.parse(raw);

console.log(`Unpacking fixtures for ${bundle.username} (captured ${bundle.captured_at})`);
console.log(`  Source: ${bundle.profile_url}`);
console.log();

fs.mkdirSync(fixturesDir, { recursive: true });

// Write main profile page
const profilePath = path.join(fixturesDir, "real-linkedin-dom.xml");
fs.writeFileSync(profilePath, bundle.profile);
const profileKb = Math.round(bundle.profile.length / 1024);
console.log(`  ${profilePath} (${profileKb} KB)`);

// Write detail pages
let count = 1;
for (const [section, html] of Object.entries(bundle.details)) {
  const detailPath = path.join(fixturesDir, `details-${section}.xml`);
  fs.writeFileSync(detailPath, html);
  const kb = Math.round(html.length / 1024);
  console.log(`  ${detailPath} (${kb} KB)`);
  count++;
}

console.log();
console.log(`Unpacked ${count} fixtures. Run tests with: pnpm test`);
