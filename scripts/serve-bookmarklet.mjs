#!/usr/bin/env node

/**
 * Minimal dev server for testing the bookmarklet locally.
 *
 * Serves apps/bookmarklet/dist/ on http://localhost:3333 with
 * permissive CORS headers so the bookmarklet can load runtime.js
 * from any page.
 *
 * Usage:
 *   pnpm dev          # build + serve
 *   open http://localhost:3333   # install page with drag-to-bookmarks-bar link
 *   navigate to a LinkedIn profile, click the bookmarklet
 */

import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../apps/bookmarklet/dist");
const PORT = process.env.PORT ?? 3333;

const MIME = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".json": "application/json",
};

const server = http.createServer((req, res) => {
  const filePath = path.join(distDir, req.url === "/" ? "index.html" : req.url);
  const ext = path.extname(filePath);

  // CORS — needed so LinkedIn page can load the runtime script
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const content = fs.readFileSync(filePath);
  res.writeHead(200, { "Content-Type": MIME[ext] ?? "application/octet-stream" });
  res.end(content);
});

server.listen(PORT, () => {
  console.log(`\nBookmarklet dev server running at http://localhost:${PORT}\n`);
  console.log("Steps:");
  console.log(`  1. Open http://localhost:${PORT}`);
  console.log("  2. Drag the bookmarklet link to your bookmarks bar");
  console.log("  3. Go to a LinkedIn profile page (linkedin.com/in/someone)");
  console.log("  4. Click the bookmarklet\n");
});
