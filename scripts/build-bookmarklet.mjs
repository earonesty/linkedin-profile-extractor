#!/usr/bin/env node

/**
 * Build script for the bookmarklet.
 *
 * Emits:
 *   apps/bookmarklet/dist/runtime.js       — the runtime bundle (also used by Chrome extension)
 *   apps/bookmarklet/dist/bookmarklet.js   — self-contained inline bookmarklet string
 *   apps/bookmarklet/dist/index.html       — human-installable bookmarklet page
 */

import * as esbuild from "esbuild";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const distDir = path.join(root, "apps/bookmarklet/dist");

const aliases = {
  "@liex/schema": path.join(root, "packages/schema/src"),
  "@liex/extractor-core": path.join(root, "packages/extractor-core/src"),
  "@liex/extractor-linkedin": path.join(
    root,
    "packages/extractor-linkedin/src"
  ),
  "@liex/ui-overlay": path.join(root, "packages/ui-overlay/src"),
  "@liex/transport-download": path.join(
    root,
    "packages/transport-download/src"
  ),
  "@liex/transport-clipboard": path.join(
    root,
    "packages/transport-clipboard/src"
  ),
  "@liex/transport-webhook": path.join(
    root,
    "packages/transport-webhook/src"
  ),
};

async function build() {
  fs.mkdirSync(distDir, { recursive: true });

  // 1. Build the runtime bundle
  await esbuild.build({
    entryPoints: [path.join(root, "apps/bookmarklet/src/runtime.ts")],
    bundle: true,
    minify: true,
    format: "iife",
    target: "es2020",
    outfile: path.join(distDir, "runtime.js"),
    alias: aliases,
  });

  // 2. Inline the runtime into javascript: URLs (with and without detail pages)
  const runtimeCode = fs.readFileSync(
    path.join(distDir, "runtime.js"),
    "utf-8"
  );
  const bookmarklet = `javascript:void%20${encodeURIComponent(`(function(){${runtimeCode}})()`)}`;
  const bookmarkletFull = `javascript:void%20${encodeURIComponent(`(function(){window.__LIEX_CONFIG=window.__LIEX_CONFIG||{};window.__LIEX_CONFIG.fetchDetailPages=true;${runtimeCode}})()`)}`;

  fs.writeFileSync(path.join(distDir, "bookmarklet.js"), bookmarklet);
  fs.writeFileSync(path.join(distDir, "bookmarklet-full.js"), bookmarkletFull);

  // 3. Generate the installable HTML page
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LinkedIn Profile Extractor — Bookmarklet</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      max-width: 720px;
      margin: 0 auto;
      padding: 40px 20px;
      color: #222;
      line-height: 1.6;
    }
    h1 { margin-bottom: 8px; }
    .subtitle { color: #666; margin-bottom: 32px; }
    .bookmarklet-link {
      display: inline-block;
      background: #0a66c2;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      margin: 16px 0;
      cursor: grab;
    }
    .bookmarklet-link:hover { background: #004182; }
    .instructions { margin-top: 24px; }
    .instructions h2 { margin-top: 24px; margin-bottom: 8px; }
    .instructions ol { padding-left: 24px; }
    .instructions li { margin-bottom: 8px; }
    code {
      background: #f0f0f0;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 13px;
    }
    .note {
      background: #e8f4fd;
      border: 1px solid #0a66c2;
      border-radius: 8px;
      padding: 12px 16px;
      margin-top: 16px;
      font-size: 14px;
    }
    .warning {
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 8px;
      padding: 12px 16px;
      margin-top: 24px;
    }
  </style>
</head>
<body>
  <h1>LinkedIn Profile Extractor</h1>
  <p class="subtitle">Extract structured data from any LinkedIn profile page.</p>

  <p>Drag this link to your bookmarks bar:</p>
  <a class="bookmarklet-link" id="bookmarklet-link" href="${bookmarklet}">Extract LinkedIn Profile</a>

  <div style="margin-top:16px;display:flex;align-items:center;gap:12px;">
    <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:14px;">
      <span style="position:relative;display:inline-block;width:44px;height:24px;">
        <input type="checkbox" id="detail-toggle" style="opacity:0;width:0;height:0;">
        <span id="slider" style="position:absolute;inset:0;background:#ccc;border-radius:24px;transition:.2s;"></span>
        <span id="slider-knob" style="position:absolute;top:2px;left:2px;width:20px;height:20px;background:#fff;border-radius:50%;transition:.2s;"></span>
      </span>
      Fetch all detail pages <span style="color:#666;">(gets complete data for each section)</span>
    </label>
  </div>

  <div class="note">Self-contained bookmarklet — no external scripts are loaded.</div>

  <script>
    var basic = ${JSON.stringify(bookmarklet)};
    var full = ${JSON.stringify(bookmarkletFull)};
    var link = document.getElementById("bookmarklet-link");
    var toggle = document.getElementById("detail-toggle");
    var slider = document.getElementById("slider");
    var knob = document.getElementById("slider-knob");
    toggle.addEventListener("change", function() {
      link.href = toggle.checked ? full : basic;
      link.textContent = toggle.checked ? "Extract LinkedIn Profile (Full)" : "Extract LinkedIn Profile";
      slider.style.background = toggle.checked ? "#0a66c2" : "#ccc";
      knob.style.left = toggle.checked ? "22px" : "2px";
    });
  </script>

  <div class="instructions">
    <h2>How to install</h2>
    <ol>
      <li>Drag the blue button above to your browser's bookmarks bar.</li>
      <li>If your bookmarks bar is hidden, press <code>Ctrl+Shift+B</code> (Windows/Linux) or <code>Cmd+Shift+B</code> (Mac) to show it.</li>
      <li>Alternatively, right-click the button and choose "Bookmark this link".</li>
    </ol>

    <h2>How to use</h2>
    <ol>
      <li>Navigate to any LinkedIn profile page (e.g., <code>linkedin.com/in/someone</code>).</li>
      <li>Click the bookmarklet in your bookmarks bar.</li>
      <li>Wait for the extraction overlay to appear.</li>
      <li>Use the buttons to copy JSON, download JSON, or send to a webhook.</li>
    </ol>

    <div class="warning">
      <strong>Note:</strong> The bookmarklet extracts only data visible in your
      current browser session — it does not access LinkedIn APIs or automate your account.
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(distDir, "index.html"), html);

  const sizeKB = (bookmarklet.length / 1024).toFixed(1);
  console.log("Build complete:");
  console.log(`  Bookmarklet:    ${sizeKB} KB (self-contained)`);
  console.log(`  Runtime bundle: ${path.join(distDir, "runtime.js")}`);
  console.log(`  Install page:   ${path.join(distDir, "index.html")}`);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
