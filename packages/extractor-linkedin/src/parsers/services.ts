import { cleanTextContent, getCleanPTexts } from "./dom-utils";

export type ServicesSection = {
  services_text: string | null;
  service_types: string[];
};

/**
 * Parses services from the real LinkedIn DOM.
 *
 * Real structure:
 *   <p><span>Description text...</span></p>
 *   <div><p>Custom Software Development</p><p>IT Consulting</p></div>
 */
export function parseServices(el: Element): ServicesSection {
  let services_text: string | null = null;
  const service_types: string[] = [];

  // Find the description span (first long text) — cleanTextContent strips buttons/"…more"
  const spans = el.querySelectorAll("p > span");
  for (const span of Array.from(spans)) {
    const text = cleanTextContent(span);
    if (text.length > 20 && !services_text) {
      services_text = text;
    }
  }

  // Find service type <p> tags (short text, not the description)
  // getCleanPTexts strips buttons and /details/ nav links
  const pTexts = getCleanPTexts(el);
  for (const text of pTexts) {
    if (
      text.length > 2 &&
      text.length < 60 &&
      text !== services_text &&
      !service_types.includes(text)
    ) {
      service_types.push(text);
    }
  }

  return { services_text, service_types };
}
