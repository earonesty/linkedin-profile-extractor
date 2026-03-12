#!/usr/bin/env node

/**
 * Utility script: given an HTML file, runs section discovery and dumps
 * the results. Useful for debugging parser breakage.
 *
 * Usage: node scripts/dump-sections.mjs fixtures/profiles/complete-profile.html
 */

import fs from "fs";
import path from "path";
import { JSDOM } from "jsdom";

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: node scripts/dump-sections.mjs <html-file>");
  process.exit(1);
}

const html = fs.readFileSync(path.resolve(filePath), "utf-8");
const dom = new JSDOM(html, { url: "https://www.linkedin.com/in/test" });
const doc = dom.window.document;

// Find sections by data-view-name
const topCard = doc.querySelector('[data-view-name="profile-top-card"]');
if (topCard) {
  console.log("\n=== TOP CARD ===");
  console.log("Text:", topCard.textContent?.trim().slice(0, 200));
} else {
  console.log("\n=== TOP CARD: NOT FOUND ===");
}

const cards = doc.querySelectorAll('[data-view-name^="profile-card-"]');
console.log(`\nFound ${cards.length} profile-card sections:\n`);

for (const card of cards) {
  const viewName = card.getAttribute("data-view-name");
  const h2 = card.querySelector("h2");
  const heading = h2?.textContent?.trim() ?? "(no heading)";
  const textPreview = (card.textContent ?? "").trim().slice(0, 150);

  console.log(`--- ${viewName} ---`);
  console.log(`Heading: ${heading}`);
  console.log(`Text preview: ${textPreview}...`);
  console.log();
}

// Fallback: sections with h2
const sections = doc.querySelectorAll("section");
let fallbackCount = 0;
for (const section of sections) {
  if (section.getAttribute("data-view-name")) continue;
  const h2 = section.querySelector("h2");
  if (h2) {
    if (fallbackCount === 0) console.log("\n=== FALLBACK SECTIONS (no data-view-name) ===\n");
    fallbackCount++;
    console.log(`Section with h2: "${h2.textContent?.trim()}"`);
  }
}

if (fallbackCount === 0) {
  console.log("\nNo fallback sections found.");
}
