/**
 * Section discovery for LinkedIn profiles.
 *
 * Discovery order:
 * 1. [data-view-name="profile-top-card"]
 * 2. [data-view-name^="profile-card-"]
 * 3. Fallback: section elements with h2 headings matching known titles
 * 4. Missing sections recorded as warnings
 */

export type DiscoveredSection = {
  id: string;
  heading: string | null;
  element: Element;
};

const KNOWN_ANCHORS = [
  "profile-card-about",
  "profile-card-services",
  "profile-card-featured",
  "profile-card-recent-activity",
  "profile-card-experience",
  "profile-card-education",
  "profile-card-licenses-and-certifications",
  "profile-card-projects",
  "profile-card-skills",
  "profile-card-recommendations",
  "profile-card-publications",
  "profile-card-courses",
  "profile-card-interests",
] as const;

const HEADING_TO_ID: Record<string, string> = {
  about: "about",
  services: "services",
  featured: "featured",
  activity: "recent-activity",
  experience: "experience",
  education: "education",
  "licenses & certifications": "licenses-and-certifications",
  "licenses and certifications": "licenses-and-certifications",
  projects: "projects",
  skills: "skills",
  recommendations: "recommendations",
  publications: "publications",
  courses: "courses",
  interests: "interests",
};

function extractHeading(el: Element): string | null {
  const h2 = el.querySelector("h2");
  if (!h2) return null;
  return (h2.textContent ?? "").trim() || null;
}

function anchorToId(anchor: string): string {
  return anchor.replace("profile-card-", "");
}

export function discoverSections(
  doc: Document,
  warnings: string[]
): { topCard: DiscoveredSection | null; sections: DiscoveredSection[] } {
  // Step 1: Find top card (try multiple strategies for DOM rotation resilience)
  let topCard: DiscoveredSection | null = null;
  const topCardEl =
    doc.querySelector('[data-view-name="profile-top-card"]') ??
    doc.querySelector('[componentkey*="Topcard"]') ??
    doc.querySelector('[componentkey*="topcard"]');
  if (topCardEl) {
    topCard = { id: "top-card", heading: null, element: topCardEl };
  } else {
    warnings.push("Top card not found via data-view-name or componentkey anchor");
  }

  // Sections that are LinkedIn UI chrome, not profile content
  const IGNORED_SECTIONS = new Set([
    "highlights",
    "insights",
    "pymk-recommendation-from-company",
    "pymk-recommendation-from-industry",
    "company-recommendation",
    "browsemap",
    "promo",
  ]);

  // Step 2: Find profile-card-* sections via data-view-name
  const found = new Map<string, DiscoveredSection>();
  const cardEls = doc.querySelectorAll('[data-view-name^="profile-card-"]');
  for (const el of Array.from(cardEls)) {
    const anchor = el.getAttribute("data-view-name")!;
    const id = anchorToId(anchor);
    if (IGNORED_SECTIONS.has(id)) continue;
    if (!found.has(id)) {
      found.set(id, { id, heading: extractHeading(el), element: el });
    }
  }

  // Step 2b: componentkey-based discovery (LinkedIn rotates DOM structures)
  // Pattern: componentkey="com.linkedin.sdui.profile.card.ref<user><SectionName>"
  if (found.size === 0) {
    const COMPONENTKEY_TO_ID: Record<string, string> = {
      about: "about",
      services: "services",
      featured: "featured",
      experiencetoplevelsection: "experience",
      educationtoplevelsection: "education",
      certificationtoplevel: "licenses-and-certifications",
      projects: "projects",
      skills: "skills",
      recommendations: "recommendations",
      publicationtoplevelsection: "publications",
      coursetoplevelsection: "courses",
      interests: "interests",
    };
    const ckEls = doc.querySelectorAll("[componentkey]");
    for (const el of Array.from(ckEls)) {
      const ck = (el.getAttribute("componentkey") ?? "").toLowerCase();
      if (!ck.startsWith("com.linkedin.sdui.profile.card.ref")) continue;
      for (const [suffix, id] of Object.entries(COMPONENTKEY_TO_ID)) {
        if (ck.endsWith(suffix) && !found.has(id)) {
          found.set(id, { id, heading: extractHeading(el), element: el });
          break;
        }
      }
    }
  }

  // Step 3: Fallback - section elements with h2 matching known titles
  const allSections = doc.querySelectorAll("section");
  for (const section of Array.from(allSections)) {
    const heading = extractHeading(section);
    if (!heading) continue;
    const normalized = heading.toLowerCase();
    const id = HEADING_TO_ID[normalized];
    if (id && !found.has(id)) {
      found.set(id, { id, heading, element: section });
    }
  }

  // Step 4: Warn about missing sections (only for core expected sections)
  for (const anchor of KNOWN_ANCHORS) {
    const id = anchorToId(anchor);
    if (!found.has(id)) {
      warnings.push(`Section "${id}" not found on this profile`);
    }
  }

  // Return in discovery order (matching KNOWN_ANCHORS order), then any extras
  const ordered: DiscoveredSection[] = [];
  const seen = new Set<string>();
  for (const anchor of KNOWN_ANCHORS) {
    const id = anchorToId(anchor);
    const section = found.get(id);
    if (section) {
      ordered.push(section);
      seen.add(id);
    }
  }
  // Add any extra discovered sections not in KNOWN_ANCHORS
  for (const [id, section] of found) {
    if (!seen.has(id)) {
      ordered.push(section);
    }
  }

  return { topCard, sections: ordered };
}
