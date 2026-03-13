import type { SkillsSection } from "@liex/schema";
import { splitSectionItems } from "./split-items";

/**
 * Parses the skills section from the real LinkedIn DOM.
 *
 * Real structure: skill items separated by <hr role="presentation">.
 * Each item has <p> tags at varying nesting depths:
 *   - Skill name: shallowest <p> (e.g., depth 6)
 *   - Meta text: deeper <p> tags (endorsements, related experience)
 *
 * We use the shallowest <p> in each item as the skill name —
 * this is more robust than pattern-matching on job titles.
 */
export function parseSkills(el: Element): SkillsSection {
  const skills: string[] = [];
  const items = splitSectionItems(el);

  for (const item of items) {
    const name = findShallowestP(item);
    if (name && name.length < 100 && !isMetaText(name) && !skills.includes(name)) {
      skills.push(name);
    }
  }

  return { skills };
}

/**
 * Find the shallowest <p> tag's text content within an element.
 * In LinkedIn's DOM, the skill name is always less deeply nested
 * than the endorsement/experience meta text.
 */
function findShallowestP(el: Element): string | null {
  const ps = el.querySelectorAll("p");
  if (ps.length === 0) return null;
  if (ps.length === 1) return ps[0].textContent?.trim() ?? null;

  let minDepth = Infinity;
  let shallowest: Element | null = null;

  for (const p of Array.from(ps)) {
    let depth = 0;
    let cur: Element | null = p;
    while (cur && cur !== el) {
      depth++;
      cur = cur.parentElement;
    }
    if (depth < minDepth) {
      minDepth = depth;
      shallowest = p;
    }
  }

  return shallowest?.textContent?.trim() ?? null;
}

function isMetaText(text: string): boolean {
  return /^(show all|see more|skills|endorsements?)$/i.test(text);
}
