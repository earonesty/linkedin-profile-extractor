import type { TopCard } from "@liex/schema";

/**
 * Parses the LinkedIn profile top card.
 *
 * Real LinkedIn DOM uses:
 * - h2 (not h1) for the profile name
 * - <p> tags for headline, org/school line, location
 * - <a> with href containing "contact-info" for contact link
 * - <a data-view-name="profile-top-card-view-all-connections"> for connections
 * - <img src="...profile-displayphoto..."> for profile photo
 * - <img src="...profile-displaybackgroundimage..."> for cover photo
 */
export function parseTopCard(el: Element): TopCard {
  // Profile image - look for img with profile-displayphoto in src
  const profileImg = el.querySelector(
    'img[src*="profile-displayphoto"]'
  );
  const profile_image_url = profileImg?.getAttribute("src") ?? null;

  // Cover image - look for img with displaybackgroundimage in src
  const coverImg = el.querySelector(
    'img[src*="displaybackgroundimage"]'
  );
  const cover_image_url = coverImg?.getAttribute("src") ?? null;

  // Full name - LinkedIn uses h2 (not h1) for the profile name
  // Try h1 first for compatibility, then h2
  const nameEl = el.querySelector("h1") ?? el.querySelector("h2");
  const full_name = nameEl?.textContent?.trim() ?? null;

  // Contact info link
  const contactLink = el.querySelector(
    'a[href*="overlay/contact-info"], a[href*="contact-info"]'
  );
  const contact_info_link = contactLink?.getAttribute("href") ?? null;

  // Connections text - in a link with data-view-name or matching text pattern
  let connections_text: string | null = null;
  const connectionsLink = el.querySelector(
    'a[data-view-name="profile-top-card-view-all-connections"]'
  );
  if (connectionsLink) {
    connections_text = connectionsLink.textContent?.trim() ?? null;
  }
  if (!connections_text) {
    // Fallback: scan p tags for connections pattern
    const ps = el.querySelectorAll("p");
    for (const p of Array.from(ps)) {
      const t = (p.textContent ?? "").trim();
      if (/\d+\+?\s*(connections?|followers?)/i.test(t)) {
        connections_text = t;
        break;
      }
    }
  }

  // Headline, org/school line, and location are in <p> tags
  // In the real DOM, the first few <p> tags after the name area contain:
  //   p[0]: headline (e.g., "Senior Software Engineer @ Puzzle | ML, Architecture")
  //   p[1]: org/school line (e.g., "Puzzle 🧩🚀 · The Johns Hopkins University")
  //   p[2]: location (e.g., "Oak Park, California, United States")
  //   p[3]: "·" separator
  //   p[4]: "Contact info" link wrapper
  let headline: string | null = null;
  let org_school_line: string | null = null;
  let location: string | null = null;

  const allPs = el.querySelectorAll("p");
  const candidateTexts: Array<{ text: string; el: Element }> = [];

  for (const p of Array.from(allPs)) {
    const text = (p.textContent ?? "").trim();
    if (!text || text.length < 2) continue;
    if (text === full_name) continue;
    if (/\d+\+?\s*(connections?|followers?)/i.test(text)) continue;
    if (/^contact\s+info$/i.test(text)) continue;
    if (/^(open to|add section|show details|show all)$/i.test(text)) continue;
    if (/profile views?|post impressions?|search appearances?/i.test(text)) continue;
    if (/^·\s*\d+(st|nd|rd|th)$/i.test(text)) continue; // connection degree ("· 1st", "· 2nd")
    if (/mutual connection/i.test(text)) continue;
    if (/enhanced with premium/i.test(text)) continue;
    candidateTexts.push({ text, el: p });
  }

  // Assign based on order and heuristics
  for (const { text } of candidateTexts) {
    if (!headline) {
      headline = text;
    } else if (!org_school_line && text.includes("·")) {
      org_school_line = text;
    } else if (
      !location &&
      /,/.test(text) &&
      text.length < 100
    ) {
      location = text;
    } else if (!org_school_line && text.length < 150) {
      org_school_line = text;
    } else if (!location && text.length < 100) {
      location = text;
    }

    if (headline && org_school_line && location) break;
  }

  return {
    full_name,
    headline,
    org_school_line,
    location,
    contact_info_link,
    connections_text,
    profile_image_url,
    cover_image_url,
  };
}
