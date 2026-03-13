import { getCleanPTexts } from "./dom-utils";
import type { TopCard } from "@liex/schema";

/**
 * Parses the LinkedIn profile top card.
 *
 * Real LinkedIn DOM uses:
 * - h1 or h2 for the profile name
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

  // Full name - LinkedIn uses h1 or h2 for the profile name
  const nameEl = el.querySelector("h1") ?? el.querySelector("h2");
  const full_name = nameEl?.textContent?.trim() ?? null;

  // Contact info link — structural: link href contains "contact-info"
  const contactLink = el.querySelector(
    'a[href*="overlay/contact-info"], a[href*="contact-info"]'
  );
  const contact_info_link = contactLink?.getAttribute("href") ?? null;

  // Connections text — structural: link with specific data-view-name attribute
  let connections_text: string | null = null;
  const connectionsLink = el.querySelector(
    'a[data-view-name="profile-top-card-view-all-connections"]'
  );
  if (connectionsLink) {
    connections_text = connectionsLink.textContent?.trim() ?? null;
  }
  if (!connections_text) {
    // Fallback: scan p tags for connections pattern (number + connections/followers)
    const ps = el.querySelectorAll("p");
    for (const p of Array.from(ps)) {
      const t = (p.textContent ?? "").trim();
      if (/\d+\+?\s*(connections?|followers?)/i.test(t)) {
        connections_text = t;
        break;
      }
    }
  }

  // Use getCleanPTexts which strips buttons ("Open to", "Add section"),
  // /details/ nav links ("Show all"), and other UI chrome
  const pTexts = getCleanPTexts(el);

  let headline: string | null = null;
  let org_school_line: string | null = null;
  let location: string | null = null;

  for (const text of pTexts) {
    // Skip text that duplicates the name
    if (text === full_name) continue;
    // Skip connections text (structural: contains digit + connections/followers)
    if (/\d+\+?\s*(connections?|followers?)/i.test(text)) continue;
    // Skip connection degree indicators (structural: "· 1st", "· 2nd")
    if (/^·\s*\d+(st|nd|rd|th)$/i.test(text)) continue;
    // Skip very short separator text
    if (text.length < 3) continue;

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
