import type { SkillsSection } from "@liex/schema";

/**
 * Parses the skills section from the real LinkedIn DOM.
 *
 * Real structure: skill items are in div groups separated by
 * <hr role="presentation">. Each skill has:
 *   - Skill name in a <p> tag within nested divs
 *   - Endorsement info in a role="list" below
 *
 * The first <p> in each item group is the skill name.
 */
export function parseSkills(el: Element): SkillsSection {
  const skills: string[] = [];

  // Strategy 1: Split by <hr> separators (real LinkedIn DOM)
  const hrs = el.querySelectorAll('hr[role="presentation"]');
  if (hrs.length > 0) {
    const firstHr = hrs[0];
    const container = firstHr.parentElement;
    if (container) {
      for (const child of Array.from(container.children)) {
        if (child.tagName === "HR") continue;
        const firstP = child.querySelector("p");
        if (firstP) {
          const name = firstP.textContent?.trim();
          if (name && name.length < 100 && !isMetaText(name) && !skills.includes(name)) {
            skills.push(name);
          }
        }
      }
    }
  }

  if (skills.length > 0) return { skills };

  // Strategy 2: Look for <li> elements (fallback)
  const listItems = el.querySelectorAll("li");
  for (const li of Array.from(listItems)) {
    const firstP = li.querySelector("p");
    const name = firstP?.textContent?.trim() ?? li.textContent?.trim().split("\n")[0]?.trim();
    if (name && name.length < 100 && !isMetaText(name) && !skills.includes(name)) {
      skills.push(name);
    }
  }

  if (skills.length > 0) return { skills };

  // Strategy 3: Find <p> tags that look like skill names
  const ps = el.querySelectorAll("p");
  for (const p of Array.from(ps)) {
    const text = (p.textContent ?? "").trim();
    if (
      text &&
      text.length < 80 &&
      text.length > 1 &&
      !isMetaText(text) &&
      !skills.includes(text)
    ) {
      skills.push(text);
    }
  }

  return { skills };
}

function isMetaText(text: string): boolean {
  return /^(show all|see more|skills|endorsements?|\d+ endorsements?)$/i.test(text) ||
    /\bat\b.*\bat\b/i.test(text) || // "Sr. Engineer at Company"
    /^\d+\s+experiences?\s+at\b/i.test(text); // "6 experiences at Company"
}
