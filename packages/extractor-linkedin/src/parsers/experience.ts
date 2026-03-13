import { splitSectionItems } from "./split-items";
import { getCleanPTexts } from "./dom-utils";
import type { ExperienceItem } from "@liex/schema";

/**
 * Parses the experience section from the real LinkedIn DOM.
 *
 * Real structure: items are in sibling <div> blocks separated by
 * <hr role="presentation">. Each item contains:
 *   - Company logo in <figure> with aria-label
 *   - Company link to /company/ID/
 *   - <p> tags for: title, company+type, date range, location
 *   - Description in <p><span>...</span></p>
 *   - Skill endorsement <p> (removed structurally by dom-utils via
 *     /skill-associations/ link detection)
 */
export function parseExperience(el: Element): ExperienceItem[] {
  const items: ExperienceItem[] = [];
  const itemContainers = splitSectionItems(el);

  for (const container of itemContainers) {
    const parsed = parseExperienceItem(container);
    if (parsed) items.push(parsed);
  }

  return items;
}

function parseExperienceItem(el: Element): ExperienceItem | null {
  // getCleanPTexts strips buttons, /details/ nav links, /skill-associations/
  // endorsement blocks, and other UI chrome
  const pTexts = getCleanPTexts(el);
  if (pTexts.length === 0) return null;

  // Find company from link to /company/
  let company: string | null = null;
  const companyLink = el.querySelector('a[href*="/company/"]');
  if (companyLink) {
    const figure = companyLink.querySelector("figure");
    const ariaLabel = figure?.getAttribute("aria-label") ?? "";
    if (ariaLabel) {
      company = ariaLabel.replace(/\s*logo$/i, "").trim() || null;
    }
  }

  let title: string | null = null;
  let date_range_raw: string | null = null;
  let location: string | null = null;
  let description: string | null = null;

  for (const text of pTexts) {
    // Skip text that duplicates the company (e.g. "Puzzle 🧩🚀 · Full-time")
    if (company && (text === company || text.startsWith(company + " "))) continue;
    if (isDateRange(text) && !date_range_raw) {
      date_range_raw = text;
    } else if (!title && text.length < 200) {
      title = text;
    } else if (title && !company && text.includes("·") && text.length < 150) {
      // Company line often has "Company · Full-time" with · separator
      company = text;
    } else if (title && !date_range_raw && !company && text.length < 150) {
      company = text;
    } else if (date_range_raw && !location && text.length < 100) {
      location = text;
    } else if (!description && text.length > 20) {
      description = text;
    }
  }

  if (!title && !company) return null;

  return { title, company, date_range_raw, location, description };
}

function isDateRange(text: string): boolean {
  return (
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|present|\d{4})\b/i.test(
      text
    ) && /[-–·]/.test(text)
  );
}
