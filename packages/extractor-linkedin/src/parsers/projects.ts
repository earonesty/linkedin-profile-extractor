import { splitSectionItems } from "./split-items";
import { getCleanPTexts, isNavLink } from "./dom-utils";
import type { ProjectItem } from "@liex/schema";

/**
 * Parses the projects section from the real LinkedIn DOM.
 *
 * Real structure: items separated by <hr role="presentation">.
 * Each item has <p> tags for name, date range, association, description.
 * External project link uses LinkedIn's redirect wrapper.
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
  const pTexts = getCleanPTexts(el);
  if (pTexts.length === 0) return null;

  // Find external URL: LinkedIn wraps external links through redir/redirect
  let url: string | null = null;
  const links = el.querySelectorAll("a[href]");
  for (const link of Array.from(links)) {
    if (isNavLink(link)) continue;
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
    if (isDateRange(text) && !date_range_raw) {
      date_range_raw = text;
    } else if (!name && text.length < 200) {
      name = text;
    } else if (name && !description && text.length > 10) {
      description = text;
    }
  }

  if (!name) return null;
  return { name, description, date_range_raw, url };
}

function isDateRange(text: string): boolean {
  return /\b\d{4}\b/.test(text) && /[–-]/.test(text);
}
