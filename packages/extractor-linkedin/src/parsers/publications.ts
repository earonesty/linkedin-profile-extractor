import { splitSectionItems } from "./split-items";
import { getCleanPTexts, isNavLink } from "./dom-utils";
import type { PublicationItem } from "@liex/schema";

/**
 * Parses publications from the real LinkedIn DOM.
 *
 * Real structure: items separated by <hr role="presentation">.
 * Each item has:
 *   <p>Title</p>
 *   <p>Publisher · Date</p>
 *   <a href="...redir/redirect/...">Show publication</a>
 *   <p><span>Description</span></p>
 */
export function parsePublications(el: Element): PublicationItem[] {
  const items: PublicationItem[] = [];
  const containers = splitSectionItems(el);

  for (const container of containers) {
    const parsed = parsePubItem(container);
    if (parsed) items.push(parsed);
  }
  return items;
}

function parsePubItem(el: Element): PublicationItem | null {
  const pTexts = getCleanPTexts(el);
  if (pTexts.length === 0) return null;

  // Find URL from redirect link
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

  let title: string | null = null;
  let publisher: string | null = null;
  let published_date: string | null = null;
  let description: string | null = null;

  for (const text of pTexts) {
    // Publisher line contains "·" with a year: "Publisher · Jan 18, 2022"
    if (!publisher && text.includes("·") && /\b\d{4}\b/.test(text)) {
      const parts = text.split("·").map(s => s.trim());
      publisher = parts[0] || null;
      published_date = parts.slice(1).join("·").trim() || null;
    } else if (!title && text.length < 300) {
      title = text;
    } else if (title && !description && text.length > 20) {
      description = text;
    }
  }

  if (!title) return null;
  return { title, publisher, published_date, description, url };
}
