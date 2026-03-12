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

  // Find the description span (first long text)
  const spans = el.querySelectorAll("p > span");
  for (const span of Array.from(spans)) {
    const text = (span.textContent ?? "").trim();
    if (text.length > 20 && !services_text) {
      services_text = text.replace(/…\s*(more|see more)\s*$/i, "").trim();
    }
  }

  // Find service type <p> tags (short text, not heading)
  const ps = el.querySelectorAll("p");
  for (const p of Array.from(ps)) {
    const text = (p.textContent ?? "").trim();
    if (
      text.length > 2 &&
      text.length < 80 &&
      text !== services_text &&
      !/^(services|show all|…|more)$/i.test(text) &&
      !text.includes("…more")
    ) {
      // Check it's not the description
      if (text.length < 60 && !service_types.includes(text)) {
        service_types.push(text);
      }
    }
  }

  return { services_text, service_types };
}
