/**
 * Main extraction orchestrator.
 *
 * Runs entirely client-side against the currently open LinkedIn profile
 * page in the user's browser. Does not use LinkedIn APIs, headless
 * browsers, server-side scraping, or account automation.
 */

import type {
  LinkedInExport,
  ExtractOptions,
  ExtractedSection,
  TopCard,
} from "@liex/schema";
import {
  validateLinkedInProfile,
  scrollToBottom,
  expandCollapsedSections,
  discoverSections,
} from "@liex/extractor-core";
import { parseTopCard, getParser } from "./registry";

export async function extractLinkedInProfile(
  doc: Document,
  options?: ExtractOptions
): Promise<LinkedInExport> {
  const warnings: string[] = [];
  const progress = options?.onProgress ?? (() => {});

  // Step 1: Validate
  progress("validating");
  validateLinkedInProfile(doc);

  // Step 2: Expand collapsed sections
  if (options?.expandSections !== false) {
    progress("expanding");
    await expandCollapsedSections(doc, { onProgress: progress });
  }

  // Step 3: Scroll to load lazy content
  if (options?.scrollPage !== false) {
    progress("scrolling");
    await scrollToBottom(doc, { onProgress: progress });
    // Expand again after scrolling may have revealed new content
    if (options?.expandSections !== false) {
      await expandCollapsedSections(doc, { onProgress: progress });
    }
  }

  // Step 4: Discover sections
  progress("extracting");
  const { topCard: topCardSection, sections: discoveredSections } =
    discoverSections(doc, warnings);

  // Step 5: Parse top card
  let top_card: TopCard = {
    full_name: null,
    headline: null,
    org_school_line: null,
    location: null,
    contact_info_link: null,
    connections_text: null,
    profile_image_url: null,
    cover_image_url: null,
  };

  if (topCardSection) {
    try {
      top_card = parseTopCard(topCardSection.element);
    } catch (err) {
      warnings.push(
        `Top card parsing failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  // Step 6: Parse each discovered section
  progress("normalizing");
  const sections: ExtractedSection[] = [];

  for (const disc of discoveredSections) {
    const raw_html = disc.element.innerHTML;
    const raw_text = (disc.element.textContent ?? "").trim();

    let items: unknown[] = [];
    const parser = getParser(disc.id);

    if (parser) {
      try {
        const result = parser(disc.element);
        // Normalize: if result is an array, use it; if object with array prop, extract it
        if (Array.isArray(result)) {
          items = result;
        } else if (result && typeof result === "object") {
          // Look for the first array property, or wrap as single item
          const arrayProp = Object.values(result).find(Array.isArray);
          if (arrayProp) {
            items = arrayProp as unknown[];
          } else {
            items = [result];
          }
        }
      } catch (err) {
        warnings.push(
          `Parser for "${disc.id}" failed: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    } else {
      warnings.push(`No parser registered for section "${disc.id}"`);
    }

    sections.push({
      id: disc.id,
      heading: disc.heading,
      raw_html,
      raw_text,
      items,
    });
  }

  // Step 7: Build result
  const result: LinkedInExport = {
    source: {
      platform: "linkedin",
      profile_url: doc.location.href,
      captured_at: new Date().toISOString(),
    },
    top_card,
    sections,
    warnings,
  };

  progress("complete");
  return result;
}
