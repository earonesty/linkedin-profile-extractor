import type { AboutSection } from "@liex/schema";
import { cleanTextContent } from "./dom-utils";

/**
 * Parses the LinkedIn about section.
 *
 * Real DOM: text is in <p><span>...</span></p>, possibly with a
 * "…more" <button> appended. Heading is in <h2>.
 */
export function parseAbout(el: Element): AboutSection {
  const h2 = el.querySelector("h2");

  // Strategy 1: Find <span> inside <p> with substantial text
  const spans = el.querySelectorAll("p > span");
  for (const span of Array.from(spans)) {
    const text = cleanTextContent(span);
    if (text.length > 20) {
      return { about_text: text };
    }
  }

  // Strategy 2: Find <p> tags with substantial text
  const ps = el.querySelectorAll("p");
  for (const p of Array.from(ps)) {
    const text = cleanTextContent(p);
    if (text.length > 20) {
      return { about_text: text };
    }
  }

  // Strategy 3: Fallback — all text minus heading
  let about_text = cleanTextContent(el);
  const headingText = h2?.textContent?.trim() ?? "";
  if (headingText && about_text.startsWith(headingText)) {
    about_text = about_text.slice(headingText.length).trim();
  }
  about_text = about_text.replace(/\s+/g, " ").trim();

  return { about_text: about_text || null };
}
