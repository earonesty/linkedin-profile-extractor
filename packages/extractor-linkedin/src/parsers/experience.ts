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
  // getCleanPTexts strips <button> ("… more") and /details/ links ("Show all")
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

  // Parse <p> tag contents positionally:
  // p[0]: title
  // p[1]: company + employment type (has · separator)
  // p[2]: date range (has month/year pattern)
  // p[3]: location
  // Remaining: description

  let title: string | null = null;
  let date_range_raw: string | null = null;
  let location: string | null = null;
  let description: string | null = null;

  for (const text of pTexts) {
    // Skip text that duplicates the company we already found from aria-label
    if (company && text === company) continue;
    // Skip skill endorsement lines ("Leadership, Machine Learning and +1 skill")
    if (isSkillEndorsement(text)) continue;
    if (isDateRange(text) && !date_range_raw) {
      date_range_raw = text;
    } else if (!title && text.length < 200) {
      title = text;
    } else if (title && !company && text.includes("·") && text.length < 150) {
      // Company line often has "Company · Full-time" with · separator
      company = text;
    } else if (title && !date_range_raw && !company && text.length < 150) {
      company = text;
    } else if (date_range_raw && !location && text.length < 100 && !isCompanyTypeLine(text)) {
      location = text;
    } else if (!description && text.length > 20 && !isCompanyTypeLine(text)) {
      description = text;
    }
  }

  if (!title && !company) return null;

  return { title, company, date_range_raw, location, description };
}

/** Skill endorsement lines: "Leadership, Machine Learning and +1 skill" */
function isSkillEndorsement(text: string): boolean {
  return /and \+\d+ skills?$/i.test(text);
}

/** Company+type lines like "Company · Full-time" when company is already found */
function isCompanyTypeLine(text: string): boolean {
  return (
    text.includes("·") &&
    /\b(full-time|part-time|contract|freelance|internship|self-employed|seasonal|apprenticeship)\b/i.test(text)
  );
}

function isDateRange(text: string): boolean {
  return (
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|present|\d{4})\b/i.test(
      text
    ) && /[-–·]/.test(text)
  );
}
