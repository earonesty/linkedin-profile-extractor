import type { AboutSection } from "@liex/schema";

/**
 * Parses the LinkedIn about section.
 *
 * Real DOM: text is in <p><span>...</span></p>, possibly with a
 * "…more" button appended. Heading is in <h2>.
 */
export function parseAbout(el: Element): AboutSection {
  const h2 = el.querySelector("h2");

  // Strategy 1: Find <span> inside <p> with substantial text
  const spans = el.querySelectorAll("p > span");
  for (const span of Array.from(spans)) {
    const text = (span.textContent ?? "").trim();
    if (text.length > 20) {
      return { about_text: text };
    }
  }

  // Strategy 2: Find <p> tags with substantial text
  const ps = el.querySelectorAll("p");
  for (const p of Array.from(ps)) {
    const text = (p.textContent ?? "").trim();
    if (text.length > 20) {
      const cleaned = text.replace(/…\s*(more|see more)\s*$/i, "").trim();
      return { about_text: cleaned || text };
    }
  }

  // Strategy 3: Fallback — all text minus heading
  const allText = (el.textContent ?? "").trim();
  const headingText = h2?.textContent?.trim() ?? "";
  let about_text = allText;
  if (headingText && about_text.startsWith(headingText)) {
    about_text = about_text.slice(headingText.length).trim();
  }
  about_text = about_text
    .replace(/…\s*(more|see more)\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();

  return { about_text: about_text || null };
}
