import { splitSectionItems } from "./split-items";
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
  const pTags = el.querySelectorAll("p");
  const pTexts: string[] = [];
  for (const p of Array.from(pTags)) {
    const t = (p.textContent ?? "").trim();
    if (t && t.length > 1) pTexts.push(t);
  }

  // Author is often a link to a /in/ profile
  let author: string | null = null;
  const links = el.querySelectorAll("a");
  for (const link of Array.from(links)) {
    const href = link.getAttribute("href") ?? "";
    if (href.includes("/in/")) {
      author = link.textContent?.trim() ?? null;
      break;
    }
  }

  let text: string | null = null;
  let relationship: string | null = null;

  for (const t of pTexts) {
    if (t === author) continue;
    if (/^(received|given|show all|ask for)/i.test(t)) continue;
    if (/haven't received/i.test(t)) continue;
    if (/try asking/i.test(t)) continue;

    if (!relationship && t.length < 150 && /\b(manage|report|work|colleague|mentor|direct)\b/i.test(t)) {
      relationship = t;
    } else if (!text && t.length > 20) {
      text = t.replace(/…\s*(more|see more)\s*$/i, "").trim();
    }
  }

  if (!author && !text) return null;
  return { author, text, relationship };
}
