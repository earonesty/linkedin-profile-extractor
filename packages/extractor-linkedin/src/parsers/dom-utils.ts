/**
 * Shared DOM utilities for parsers.
 *
 * These use structural DOM logic (element types, roles, attributes)
 * rather than English-language string matching to identify and
 * exclude LinkedIn UI chrome from extracted content.
 */

/**
 * Returns clean text content from an element, excluding:
 * - <button> elements (collapse/expand controls like "… more")
 * - <a> links to /details/ pages ("Show all" navigation)
 * - <video> elements and their controls
 * - [role="dialog"] modal overlays
 * - Elements with aria-hidden="true"
 *
 * This replaces regex-based filtering of "… more", "see more",
 * "show all", video player text, etc.
 */
export function cleanTextContent(el: Element): string {
  const clone = el.cloneNode(true) as Element;
  removeNoiseElements(clone);
  return (clone.textContent ?? "").trim();
}

/**
 * Returns cleaned <p> tag texts from an element, excluding UI chrome.
 */
export function getCleanPTexts(el: Element): string[] {
  const clone = el.cloneNode(true) as Element;
  removeNoiseElements(clone);

  const texts: string[] = [];
  const ps = clone.querySelectorAll("p");
  for (const p of Array.from(ps)) {
    const t = (p.textContent ?? "").trim();
    if (t && t.length > 1) texts.push(t);
  }
  return texts;
}

/**
 * Checks if an <a> element is a "Show all" / navigation link
 * (points to /details/ pages) rather than a content link.
 */
export function isNavLink(a: Element): boolean {
  const href = a.getAttribute("href") ?? "";
  return /\/details\//.test(href) || /\/overlay\//.test(href);
}

/**
 * Removes LinkedIn UI chrome elements from a cloned DOM subtree.
 */
function removeNoiseElements(el: Element): void {
  // Buttons: "… more", "see more", expand/collapse controls
  const buttons = el.querySelectorAll("button");
  for (const b of Array.from(buttons)) b.remove();

  // "Show all" / navigation links (to /details/ pages)
  // Unwrap rather than remove: content like school names, degrees, etc.
  // is often wrapped inside /details/ links for navigation
  const links = el.querySelectorAll("a");
  for (const a of Array.from(links)) {
    const href = a.getAttribute("href") ?? "";
    if (/\/details\//.test(href)) {
      // If it has structured children (p, div, span), unwrap to preserve content
      if (a.children.length > 0) {
        const parent = a.parentNode;
        if (parent) {
          while (a.firstChild) parent.insertBefore(a.firstChild, a);
          a.remove();
        }
      } else {
        // Simple text-only nav link like "Show all 5 experiences" — remove entirely
        a.remove();
      }
    }
  }

  // Skill endorsement blocks: a <p> tag next to an <a> linking to
  // /skill-associations/ is an endorsement summary, not profile content.
  // Remove the <a> and its sibling <p> together.
  const skillLinks = el.querySelectorAll('a[href*="skill-associations"]');
  for (const a of Array.from(skillLinks)) {
    const parent = a.parentElement;
    if (parent) {
      // Remove sibling <p> tags (the endorsement text)
      const siblingPs = parent.querySelectorAll(":scope > p");
      for (const p of Array.from(siblingPs)) p.remove();
    }
    a.remove();
  }

  // Video players and their control menus
  const videos = el.querySelectorAll("video");
  for (const v of Array.from(videos)) {
    // Remove the entire video container (parent usually holds controls)
    const container = v.closest("[class*='video']") ?? v.parentElement;
    if (container && container !== el) container.remove();
    else v.remove();
  }

  // Dialog/modal overlays (video player settings, etc.)
  const dialogs = el.querySelectorAll('[role="dialog"], [aria-modal="true"]');
  for (const d of Array.from(dialogs)) d.remove();

  // Hidden elements
  const hidden = el.querySelectorAll('[aria-hidden="true"]');
  for (const h of Array.from(hidden)) h.remove();
}
