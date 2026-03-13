import { splitSectionItems } from "./split-items";
import { getCleanPTexts } from "./dom-utils";

export type CourseItem = {
  name: string | null;
  number: string | null;
};

export type CoursesSection = {
  courses: CourseItem[];
};

/**
 * Parses courses from the real LinkedIn DOM.
 *
 * Real structure: items separated by <hr role="presentation">.
 * Each item has:
 *   <div><div><p>Course Name</p><p>Course Number</p></div></div>
 *   <div><figure>...</figure><p>Associated with School</p></div>
 *
 * "Associated with" <p> tags sit next to a <figure> (school logo) in
 * their parent div — we filter these structurally.
 */
export function parseCourses(el: Element): CoursesSection {
  const courses: CourseItem[] = [];
  const containers = splitSectionItems(el);

  for (const container of containers) {
    const pTexts = getCleanPTextsNoFigureSiblings(container);
    if (pTexts.length === 0) continue;

    const name = pTexts[0];
    const number = pTexts.length > 1 ? pTexts[1] : null;
    courses.push({ name, number });
  }

  return { courses };
}

/** Like getCleanPTexts but also excludes <p> tags whose parent contains a <figure> */
function getCleanPTextsNoFigureSiblings(el: Element): string[] {
  const raw = getCleanPTexts(el);
  // Re-check against original DOM: skip <p> tags with sibling <figure>
  const ps = el.querySelectorAll("p");
  const figureSiblingTexts = new Set<string>();
  for (const p of Array.from(ps)) {
    const parent = p.parentElement;
    if (parent && parent.querySelector("figure")) {
      const t = (p.textContent ?? "").trim();
      if (t) figureSiblingTexts.add(t);
    }
  }
  return raw.filter((t) => !figureSiblingTexts.has(t));
}
