import { splitSectionItems } from "./split-items";
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
  // Collect all <p> tags in this item
  const pTags = el.querySelectorAll("p");
  const pTexts: string[] = [];
  for (const p of Array.from(pTags)) {
    const text = (p.textContent ?? "").trim();
    if (text && text.length > 1 && !/^…$/.test(text)) {
      pTexts.push(text);
    }
  }

  if (pTexts.length === 0) return null;

  // Find company from link to /company/
  let company: string | null = null;
  const companyLink = el.querySelector('a[href*="/company/"]');
  if (companyLink) {
    // Company name is often in the figure's aria-label
    const figure = companyLink.querySelector("figure");
    const ariaLabel = figure?.getAttribute("aria-label") ?? "";
    if (ariaLabel) {
      company = ariaLabel.replace(/\s*logo$/i, "").trim() || null;
    }
  }

  // Parse <p> tag contents in order:
  // p[0]: title (e.g., "Senior Software Engineer")
  // p[1]: company + employment type (e.g., "Puzzle 🧩🚀 · Full-time")
  // p[2]: date range (e.g., "Mar 2024 - Present · 2 yrs 1 mo")
  // p[3]: location (e.g., "Remote" or "New York · On-site")
  // After that: description text

  let title: string | null = null;
  let date_range_raw: string | null = null;
  let location: string | null = null;
  let description: string | null = null;

  for (const text of pTexts) {
    if (isDateRange(text) && !date_range_raw) {
      date_range_raw = text;
    } else if (!title && text.length < 200 && !isShowMore(text)) {
      title = text;
    } else if (title && !company && isCompanyLine(text)) {
      company = text;
    } else if (
      title &&
      !location &&
      !date_range_raw &&
      text.length < 100 &&
      !isShowMore(text)
    ) {
      // Could be company line or location - defer
      if (!company) {
        company = text;
      }
    } else if (date_range_raw && !location && text.length < 100 && !isShowMore(text)) {
      location = text;
    } else if (!description && text.length > 20 && !isShowMore(text)) {
      description = cleanDescription(text);
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

function isCompanyLine(text: string): boolean {
  return /·\s*(full-time|part-time|contract|freelance|internship|self-employed)/i.test(text);
}

function isShowMore(text: string): boolean {
  return /^(show\s+(all|more)|see\s+more|…\s*more)$/i.test(text.trim());
}

function cleanDescription(text: string): string {
  return text.replace(/…\s*(more|see more)\s*$/i, "").trim();
}

/**
 * Split a section's content area into item containers using
 * <hr role="presentation"> as separators.
 *
 * LinkedIn uses <hr> between experience/education/skill entries.
 * We find the content area (after the heading) and split by <hr>.
 */
