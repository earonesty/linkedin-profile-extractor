import { splitSectionItems } from "./split-items";
import type { ProjectItem } from "@liex/schema";

/**
 * Parses the projects section from the real LinkedIn DOM.
 *
 * Real structure: items separated by <hr role="presentation">.
 * Each item has <p> tags for name, date range, association, description.
 * External project link uses <a href="...redir/redirect/..."> with
 * "Show project" text.
 */
export function parseProjects(el: Element): ProjectItem[] {
  const items: ProjectItem[] = [];
  const containers = splitSectionItems(el);

  for (const container of containers) {
    const parsed = parseProjectItem(container);
    if (parsed) items.push(parsed);
  }
  return items;
}

function parseProjectItem(el: Element): ProjectItem | null {
  const pTags = el.querySelectorAll("p");
  const pTexts: string[] = [];
  for (const p of Array.from(pTags)) {
    const text = (p.textContent ?? "").trim();
    if (text && text.length > 1) pTexts.push(text);
  }
  if (pTexts.length === 0) return null;

  // Find external URL from redirect link or direct link
  let url: string | null = null;
  const links = el.querySelectorAll("a[href]");
  for (const link of Array.from(links)) {
    const href = link.getAttribute("href") ?? "";
    if (href.includes("redir/redirect") || (href.startsWith("http") && !href.includes("linkedin.com"))) {
      url = href;
      break;
    }
  }

  let name: string | null = null;
  let description: string | null = null;
  let date_range_raw: string | null = null;

  for (const text of pTexts) {
    if (/^show project$/i.test(text)) continue;
    if (/^associated with\b/i.test(text)) continue;
    if (/\b\d{4}\b/.test(text) && /[–-]/.test(text) && !date_range_raw) {
      date_range_raw = text;
    } else if (!name && text.length < 200) {
      name = text;
    } else if (name && !description && text.length > 10) {
      description = text.replace(/…\s*(more|see more)\s*$/i, "").trim();
    }
  }

  if (!name) return null;
  return { name, description, date_range_raw, url };
}
