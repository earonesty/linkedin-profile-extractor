import { splitSectionItems } from "./split-items";
import { getCleanPTexts } from "./dom-utils";
import type { RecommendationItem } from "@liex/schema";

/**
 * Parses recommendations from the real LinkedIn DOM.
 *
 * Real structure: recommendations may be split into "Received" and "Given"
 * tabs via radio buttons. Each recommendation item (when present) is
 * separated by <hr role="presentation"> and contains:
 *   - Author link to /in/username/
 *   - Relationship text
 *   - Recommendation text in <p>
 */
export function parseRecommendations(el: Element): RecommendationItem[] {
  const items: RecommendationItem[] = [];
  const containers = splitSectionItems(el);

  for (const container of containers) {
    const parsed = parseRecItem(container);
    if (parsed) items.push(parsed);
  }
  return items;
}

function parseRecItem(el: Element): RecommendationItem | null {
  // getCleanPTexts strips <button> and /details/ link text
  const pTexts = getCleanPTexts(el);

  // Author is a link to a /in/ profile (not a /details/ navigation link)
  let author: string | null = null;
  const links = el.querySelectorAll("a");
  for (const link of Array.from(links)) {
    const href = link.getAttribute("href") ?? "";
    if (href.includes("/in/") && !href.includes("/details/") && !href.includes("/edit/") && !href.includes("/overlay/")) {
      const name = link.textContent?.trim() ?? "";
      if (name.length > 0) {
        author = name;
        break;
      }
    }
  }

  let text: string | null = null;
  let relationship: string | null = null;

  for (const t of pTexts) {
    if (t === author) continue;
    // Skip short texts that are likely UI elements
    if (t.length < 5) continue;

    if (!relationship && t.length < 150 && /\b(manage|report|work|colleague|mentor|direct)\b/i.test(t)) {
      relationship = t;
    } else if (!text && t.length > 20) {
      text = t;
    }
  }

  // Require both text and author — placeholder sections have text but no author
  if (!text || !author) return null;
  return { author, text, relationship };
}
