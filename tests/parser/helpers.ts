import fs from "fs";
import path from "path";
import { JSDOM } from "jsdom";

const FIXTURES_DIR = path.resolve(__dirname, "../../fixtures/profiles");

export function loadFixture(name: string): Document {
  const html = fs.readFileSync(path.join(FIXTURES_DIR, name), "utf-8");
  const dom = new JSDOM(html, { url: "https://www.linkedin.com/in/test-user" });
  return dom.window.document;
}

export function loadFixtureWithUrl(name: string, url: string): Document {
  const html = fs.readFileSync(path.join(FIXTURES_DIR, name), "utf-8");
  const dom = new JSDOM(html, { url });
  return dom.window.document;
}
