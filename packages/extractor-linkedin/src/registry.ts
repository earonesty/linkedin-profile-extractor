/**
 * Section registry: maps section IDs to parser modules.
 *
 * Each parser receives the section's root Element and returns
 * structured items. If a parser is not registered or throws,
 * the fallback behavior preserves raw_html and raw_text.
 */

import { parseTopCard } from "./parsers/top-card";
import { parseAbout } from "./parsers/about";
import { parseExperience } from "./parsers/experience";
import { parseEducation } from "./parsers/education";
import { parseSkills } from "./parsers/skills";
import { parseProjects } from "./parsers/projects";
import { parseCertifications } from "./parsers/certifications";
import { parsePublications } from "./parsers/publications";
import { parseRecommendations } from "./parsers/recommendations";
import { parseInterests } from "./parsers/interests";
import { parseActivity } from "./parsers/activity";
import { parseServices } from "./parsers/services";
import { parseFeatured } from "./parsers/featured";
import { parseCourses } from "./parsers/courses";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SectionParser = (el: Element) => any;

const registry = new Map<string, SectionParser>([
  ["about", parseAbout],
  ["experience", parseExperience],
  ["education", parseEducation],
  ["skills", parseSkills],
  ["projects", parseProjects],
  ["licenses-and-certifications", parseCertifications],
  ["publications", parsePublications],
  ["recommendations", parseRecommendations],
  ["interests", parseInterests],
  ["recent-activity", parseActivity],
  ["services", parseServices],
  ["featured", parseFeatured],
  ["courses", parseCourses],
]);

export { parseTopCard };

export function getParser(sectionId: string): SectionParser | undefined {
  return registry.get(sectionId);
}

export function hasParser(sectionId: string): boolean {
  return registry.has(sectionId);
}
