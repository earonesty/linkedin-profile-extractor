/**
 * Clicks visible "Show more" / "See more" controls to expand collapsed content.
 * Finds buttons by text content and role, not CSS classes.
 */
export async function expandCollapsedSections(
  doc: Document,
  options?: { delayMs?: number; onProgress?: (msg: string) => void }
): Promise<number> {
  const delayMs = options?.delayMs ?? 200;
  const expandTexts = ["show more", "see more"];
  let expanded = 0;

  // Find all clickable elements: buttons, [role=button], and anchors
  const candidates = doc.querySelectorAll("button, [role='button'], a");

  for (const el of Array.from(candidates)) {
    const text = (el.textContent ?? "").trim().toLowerCase();
    if (!expandTexts.some((t) => text === t || text.startsWith(t))) continue;

    // Check visibility
    const htmlEl = el as HTMLElement;
    if (htmlEl.offsetParent === null) continue;

    try {
      htmlEl.click();
      expanded++;
      await new Promise((r) => setTimeout(r, delayMs));
    } catch {
      // Ignore click errors on individual elements
    }
  }

  options?.onProgress?.(`Expanded ${expanded} collapsed sections`);
  return expanded;
}
