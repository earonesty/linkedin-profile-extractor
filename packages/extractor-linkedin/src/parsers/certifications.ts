import { splitSectionItems } from "./split-items";
import { getCleanPTexts, isNavLink } from "./dom-utils";
import type { CertificationItem } from "@liex/schema";

/**
 * Parses the certifications section from the real LinkedIn DOM.
 *
 * Real structure: items separated by <hr role="presentation">.
 * Each item has <p> tags for cert name, issuer, dates.
 * Credential link is an external URL (not a /details/ nav link).
 */
export function parseCertifications(el: Element): CertificationItem[] {
  const items: CertificationItem[] = [];
  const containers = splitSectionItems(el);

  for (const container of containers) {
    const parsed = parseCertItem(container);
    if (parsed) items.push(parsed);
  }
  return items;
}

function parseCertItem(el: Element): CertificationItem | null {
  const pTexts = getCleanPTexts(el);
  if (pTexts.length === 0) return null;

  let name: string | null = null;
  let issuer: string | null = null;
  let issue_date: string | null = null;
  let expiration_date: string | null = null;
  let credential_id: string | null = null;
  let credential_url: string | null = null;

  // Find credential URL: external link that's not a /details/ or /overlay/ nav link
  const links = el.querySelectorAll("a[href]");
  for (const link of Array.from(links)) {
    if (isNavLink(link)) continue;
    const href = link.getAttribute("href") ?? "";
    if (href.startsWith("http") && !href.includes("linkedin.com/in/")) {
      credential_url = href;
      break;
    }
  }

  for (const text of pTexts) {
    // "Credential ID" is a LinkedIn DOM label prefix (not UI chrome — it's data)
    if (/^credential\s+id\b/i.test(text)) {
      credential_id = text.replace(/^credential\s+id\s*/i, "").trim() || null;
    } else if (/^issued\s/i.test(text)) {
      issue_date = text.replace(/^issued\s*/i, "").trim() || null;
    } else if (/^expires?\s/i.test(text)) {
      expiration_date = text.replace(/^expires?\s*/i, "").trim() || null;
    } else if (!name && text.length < 200) {
      name = text;
    } else if (name && !issuer && text.length < 150) {
      issuer = text;
    }
  }

  // Handle combined "Issued Jan 2023 · Expires Jan 2025" line
  if (issue_date && issue_date.includes("·")) {
    const parts = issue_date.split("·").map((s) => s.trim());
    issue_date = parts[0] || null;
    if (parts[1] && !expiration_date) {
      expiration_date = parts[1].replace(/^expires?\s*/i, "").trim() || null;
    }
  }

  if (!name) return null;
  return { name, issuer, issue_date, expiration_date, credential_id, credential_url };
}
