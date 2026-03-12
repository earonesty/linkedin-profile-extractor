import { splitSectionItems } from "./split-items";
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
 */
export function parseCourses(el: Element): CoursesSection {
  const courses: CourseItem[] = [];
  const containers = splitSectionItems(el);

  for (const container of containers) {
    const pTags = container.querySelectorAll("p");
    const pTexts: string[] = [];
    for (const p of Array.from(pTags)) {
      const t = (p.textContent ?? "").trim();
      if (t && t.length > 0 && !/^(show all|associated with)/i.test(t)) {
        pTexts.push(t);
      }
    }

    if (pTexts.length > 0) {
      const name = pTexts[0];
      const number = pTexts.length > 1 ? pTexts[1] : null;
      courses.push({ name, number });
    }
  }

  return { courses };
}
