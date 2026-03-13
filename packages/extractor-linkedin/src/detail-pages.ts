/**
 * Fetches and parses LinkedIn /details/ pages to get complete section data.
 *
 * LinkedIn profile pages only show a subset of items per section.
 * The /details/{section}/ pages contain all items. This module opens
 * each detail page in a popup, waits for client-side render, and
 * parses the full content using the same parsers as the profile page.
 */

import { getParser } from "./registry";
import type { ExtractedSection } from "@liex/schema";

/** Sections that have /details/ pages with more content. */
const DETAIL_SECTIONS: Record<string, string> = {
  experience: "experience",
  education: "education",
  skills: "skills",
  projects: "projects",
  publications: "publications",
  courses: "courses",
  "licenses-and-certifications": "certifications",
};

const RENDER_WAIT = 5000;
const SCROLL_PAUSE = 500;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Given a detail page document, find the main content container
 * that holds the HR-separated items.
 */
export function findDetailContentContainer(doc: Document): Element | null {
  const main = doc.querySelector("main");
  if (!main) return null;

  const hrs = main.querySelectorAll('hr[role="presentation"]');
  if (hrs.length === 0) {
    // No HR separators — return main itself as fallback
    return main;
  }

  // Walk up from the first HR to find the level with multiple content children
  let container: Element | null = hrs[0].parentElement;
  for (let i = 0; i < 8 && container; i++) {
    const children = Array.from(container.children);
    const withP = children.filter((c) => c.querySelectorAll("p").length > 0);
    if (withP.length >= 3) {
      return container;
    }
    container = container.parentElement;
  }

  return main;
}

/**
 * Parse a detail page's content using the appropriate section parser.
 * Works against an already-loaded Document (for testing with fixtures).
 */
export function parseDetailPage(
  doc: Document,
  sectionId: string
): unknown[] {
  const container = findDetailContentContainer(doc);
  if (!container) return [];

  const parser = getParser(sectionId);
  if (!parser) return [];

  const result = parser(container);
  let items: unknown[];
  if (Array.isArray(result)) {
    items = result;
  } else if (result && typeof result === "object") {
    const arrayProp = Object.values(result).find(Array.isArray);
    if (arrayProp) {
      items = arrayProp as unknown[];
    } else {
      items = [result];
    }
  } else {
    return [];
  }

  // Filter out page heading parsed as an item (e.g. {"title": "Experience", ...all nulls})
  return items.filter((item) => {
    if (!item || typeof item !== "object") return true;
    const vals = Object.values(item as Record<string, unknown>);
    const nonNull = vals.filter((v) => v != null);
    if (nonNull.length !== 1) return true;
    const sole = nonNull[0];
    if (typeof sole !== "string") return true;
    // Check if the sole value is just the section heading
    const heading = DETAIL_SECTIONS[sectionId] ?? sectionId;
    return sole.toLowerCase() !== heading.toLowerCase()
      && sole.toLowerCase() !== sectionId.toLowerCase();
  });
}

/**
 * Collect /details/ URLs from the current profile page.
 */
function collectDetailUrls(
  doc: Document,
  sectionIds: string[]
): Map<string, string> {
  const urls = new Map<string, string>();
  const profileMatch = doc.location?.pathname?.match(/^\/in\/([^/]+)/);
  if (!profileMatch) return urls;

  const base = doc.location.origin + "/in/" + profileMatch[1];

  for (const id of sectionIds) {
    const detailPath = DETAIL_SECTIONS[id];
    if (detailPath) {
      urls.set(id, base + "/details/" + detailPath + "/");
    }
  }

  return urls;
}

async function waitForAccess(popup: Window): Promise<boolean> {
  for (let i = 0; i < 50; i++) {
    try {
      if (popup.document?.body) return true;
    } catch {
      // Cross-origin — not ready yet
    }
    await sleep(200);
  }
  return false;
}

async function waitForContent(popup: Window): Promise<void> {
  for (let i = 0; i < 30; i++) {
    try {
      const ps = popup.document.querySelectorAll("p");
      if (ps.length > 5) return;
    } catch {
      return;
    }
    await sleep(200);
  }
}

async function scrollPopupToBottom(popup: Window): Promise<void> {
  for (let i = 0; i < 30; i++) {
    const prev = popup.document.body.scrollHeight;
    popup.scrollTo(0, popup.document.body.scrollHeight);
    await sleep(SCROLL_PAUSE);
    if (popup.document.body.scrollHeight === prev) break;
  }
  await sleep(1000);
}

/**
 * Fetch detail pages for the given sections, parse them, and return
 * enriched section data. Runs in the browser by opening popups.
 */
export async function fetchAndParseDetailPages(
  doc: Document,
  existingSections: ExtractedSection[],
  onProgress?: (state: string) => void,
  warnings?: string[],
): Promise<ExtractedSection[]> {
  const sectionIds = existingSections.map((s) => s.id);
  const detailUrls = collectDetailUrls(doc, sectionIds);

  if (detailUrls.size === 0) return existingSections;

  const enriched = [...existingSections];

  for (const [sectionId, url] of detailUrls) {
    onProgress?.(`fetching ${sectionId} details`);

    let popup: Window | null = null;
    try {
      popup = window.open(
        url,
        "_blank",
        "width=800,height=600,left=10000,top=10000"
      );
      if (!popup) {
        warnings?.push(`Detail page popup blocked for ${sectionId}`);
        continue;
      }

      // Keep focus on the main window
      try { popup.blur(); window.focus(); } catch {};

      const accessible = await waitForAccess(popup);
      if (!accessible) {
        warnings?.push(`Detail page for ${sectionId} not accessible (cross-origin or timeout)`);
        popup.close();
        continue;
      }

      await waitForContent(popup);
      await sleep(RENDER_WAIT);
      await scrollPopupToBottom(popup);

      // Parse the detail page
      const items = parseDetailPage(popup.document, sectionId);

      // Replace section items if detail page returned more
      const idx = enriched.findIndex((s) => s.id === sectionId);
      if (idx >= 0 && items.length > enriched[idx].items.length) {
        enriched[idx] = { ...enriched[idx], items };
      }
    } catch (err) {
      warnings?.push(
        `Detail page fetch for ${sectionId} failed: ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      try {
        popup?.close();
      } catch {
        // Ignore
      }
      await sleep(500);
    }
  }

  return enriched;
}
