/**
 * Shared utility to split a LinkedIn section into individual items.
 *
 * LinkedIn uses several patterns for separating repeated items:
 *
 * Pattern A (real DOM): HR is a child of the item div.
 *   container/
 *     div/  (first item, no HR)
 *     div/  (second item)
 *       hr
 *       div/ ...content...
 *
 * Pattern B (simplified fixtures): HR is in its own wrapper div.
 *   container/
 *     div/ (item)
 *     div/ (HR wrapper)
 *       hr
 *     div/ (item)
 *
 * This function handles both patterns by finding the common container
 * of all items and returning the item elements.
 */
export function splitSectionItems(sectionEl: Element): Element[] {
  const hrs = sectionEl.querySelectorAll('hr[role="presentation"]');

  if (hrs.length === 0) {
    return findContentBlocks(sectionEl);
  }

  // Find the common container by going up from the first HR
  // until we find an element with multiple children that contain <p> tags
  const firstHr = hrs[0];
  let container = firstHr.parentElement;

  // Walk up until we find a level where there are multiple sibling
  // elements containing <p> tags (indicating the item container level)
  for (let i = 0; i < 5 && container; i++) {
    const children = Array.from(container.children);
    const contentChildren = children.filter(
      (c) => c.querySelectorAll("p").length > 0
    );
    if (contentChildren.length >= 2) {
      // Found the container level - return all content children
      return contentChildren;
    }
    container = container.parentElement;
  }

  return findContentBlocks(sectionEl);
}

/**
 * Fallback: find divs that contain <p> tags and look like content blocks.
 */
function findContentBlocks(el: Element): Element[] {
  const candidates: Element[] = [];
  const allDivs = el.querySelectorAll("div");

  for (const div of Array.from(allDivs)) {
    const ps = div.querySelectorAll("p");
    if (ps.length >= 2) {
      const isParent = candidates.some((c) => div.contains(c));
      const isChild = candidates.some((c) => c.contains(div));
      if (!isParent && !isChild) {
        candidates.push(div);
      }
    }
  }

  if (candidates.length === 0) {
    const ps = el.querySelectorAll("p");
    if (ps.length > 0) return [el];
  }

  return candidates;
}
