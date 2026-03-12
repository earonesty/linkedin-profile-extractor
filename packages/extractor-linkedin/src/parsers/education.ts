import { splitSectionItems } from "./split-items";
import type { EducationItem } from "@liex/schema";

/**
 * Parses the education section from the real LinkedIn DOM.
 *
 * Real structure: items separated by <hr role="presentation">.
 * Each item has:
 *   - School link to /school/ID/
 *   - School logo in <figure> with aria-label="School Name logo"
 *   - <p> tags for: school name, degree+field, date range, grade, activities
 *
 * Example <p> sequence:
 *   <p>The Johns Hopkins University</p>
 *   <p>M.S., Bioinformatics</p>
 *   <p>2009 – 2012</p>
 *   <p>Grade: 3.9</p>
 */
export function parseEducation(el: Element): EducationItem[] {
  const items: EducationItem[] = [];
  const itemContainers = splitSectionItems(el);

  for (const container of itemContainers) {
    const parsed = parseEducationItem(container);
    if (parsed) items.push(parsed);
  }

  return items;
}

function parseEducationItem(el: Element): EducationItem | null {
  const pTags = el.querySelectorAll("p");
  const pTexts: string[] = [];
  for (const p of Array.from(pTags)) {
    const text = (p.textContent ?? "").trim();
    if (text && text.length > 1) pTexts.push(text);
  }

  if (pTexts.length === 0) return null;

  // Find school name from figure aria-label or /school/ link
  let school: string | null = null;
  const schoolLink = el.querySelector('a[href*="/school/"]');
  if (schoolLink) {
    const figure = schoolLink.querySelector("figure");
    const ariaLabel = figure?.getAttribute("aria-label") ?? "";
    if (ariaLabel) {
      school = ariaLabel.replace(/\s*logo$/i, "").trim() || null;
    }
  }

  let degree: string | null = null;
  let field_of_study: string | null = null;
  let date_range_raw: string | null = null;
  let description: string | null = null;

  for (const text of pTexts) {
    if (isDateRange(text) && !date_range_raw) {
      date_range_raw = text;
    } else if (!school && text.length < 150) {
      school = text;
    } else if (school && !degree && text.length < 200 && !isDateRange(text)) {
      // Degree line: "M.S., Bioinformatics" or "B.A., Computer Science, Psychology"
      if (text.includes(",")) {
        const parts = text.split(",").map((s) => s.trim());
        degree = parts[0] ?? null;
        field_of_study = parts.slice(1).join(", ") || null;
      } else {
        degree = text;
      }
    } else if (date_range_raw && !description && text.length > 10) {
      // Could be grade, activities, or description
      description = text;
    }
  }

  if (!school && !degree) return null;

  return { school, degree, field_of_study, date_range_raw, description };
}

function isDateRange(text: string): boolean {
  return /\b\d{4}\b/.test(text) && /[–-]/.test(text);
}
