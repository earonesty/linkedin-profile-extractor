import { splitSectionItems } from "./split-items";
import type { CertificationItem } from "@liex/schema";

/**
 * Parses the certifications section from the real LinkedIn DOM.
 *
 * Real structure: items separated by <hr role="presentation">.
 * Each item has <p> tags for cert name, issuer, dates.
 * Credential links may include "Show credential" text.
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
  const pTags = el.querySelectorAll("p");
  const pTexts: string[] = [];
  for (const p of Array.from(pTags)) {
    const text = (p.textContent ?? "").trim();
    if (text && text.length > 0) pTexts.push(text);
  }

  if (pTexts.length === 0) return null;

  let name: string | null = null;
  let issuer: string | null = null;
  let issue_date: string | null = null;
  let expiration_date: string | null = null;
  let credential_id: string | null = null;
  let credential_url: string | null = null;

  // Find credential URL
  const links = el.querySelectorAll("a[href]");
  for (const link of Array.from(links)) {
    const href = link.getAttribute("href") ?? "";
    const text = (link.textContent ?? "").toLowerCase();
    if (text.includes("credential") || href.includes("credential")) {
      credential_url = href;
      break;
    }
  }

  for (const text of pTexts) {
    const lower = text.toLowerCase();
    if (lower.startsWith("credential id")) {
      credential_id = text.replace(/credential\s+id\s*/i, "").trim() || null;
    } else if (/^issued\s/i.test(text)) {
      issue_date = text.replace(/^issued\s*/i, "").trim() || null;
    } else if (/^expires?\s/i.test(text)) {
      expiration_date = text.replace(/^expires?\s*/i, "").trim() || null;
    } else if (/^show credential$/i.test(text)) {
      continue;
    } else if (!name && text.length < 200) {
      name = text;
    } else if (name && !issuer && text.length < 150) {
      issuer = text;
    }
  }

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
