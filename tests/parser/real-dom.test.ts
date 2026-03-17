import { describe, it, expect } from "vitest";
import { loadFixture } from "./helpers";
import { parseTopCard } from "../../packages/extractor-linkedin/src/parsers/top-card";
import { parseExperience } from "../../packages/extractor-linkedin/src/parsers/experience";
import { parseEducation } from "../../packages/extractor-linkedin/src/parsers/education";
import { parseAbout } from "../../packages/extractor-linkedin/src/parsers/about";
import { parseSkills } from "../../packages/extractor-linkedin/src/parsers/skills";
import { parseProjects } from "../../packages/extractor-linkedin/src/parsers/projects";
import { parsePublications } from "../../packages/extractor-linkedin/src/parsers/publications";
import { parseCourses } from "../../packages/extractor-linkedin/src/parsers/courses";
import { parseServices } from "../../packages/extractor-linkedin/src/parsers/services";
import { parseCertifications } from "../../packages/extractor-linkedin/src/parsers/certifications";
import { parseRecommendations } from "../../packages/extractor-linkedin/src/parsers/recommendations";
import { parseActivity } from "../../packages/extractor-linkedin/src/parsers/activity";
import { discoverSections } from "../../packages/extractor-core/src/section-discovery";

describe("real LinkedIn DOM (earonesty)", () => {
  const doc = loadFixture("real-linkedin-dom.xml");

  // Use discoverSections so tests are resilient to DOM rotation
  const warnings: string[] = [];
  const { topCard, sections } = discoverSections(doc, warnings);

  function getSection(id: string): Element {
    const s = sections.find((s) => s.id === id);
    if (!s) throw new Error(`Section "${id}" not discovered — available: ${sections.map((s) => s.id).join(", ")}`);
    return s.element;
  }

  describe("section discovery", () => {
    it("finds the top card", () => {
      expect(topCard).not.toBeNull();
    });

    it("finds key sections", () => {
      const ids = sections.map((s) => s.id);
      expect(ids).toContain("about");
      expect(ids).toContain("experience");
      expect(ids).toContain("education");
      expect(ids).toContain("skills");
      expect(ids).toContain("projects");
      expect(ids).toContain("publications");
    });

    it("excludes LinkedIn UI chrome sections", () => {
      const ids = sections.map((s) => s.id);
      expect(ids).not.toContain("highlights");
      expect(ids).not.toContain("insights");
      expect(ids).not.toContain("pymk-recommendation-from-company");
      expect(ids).not.toContain("company-recommendation");
      expect(ids).not.toContain("promo");
    });
  });

  describe("top card", () => {
    it("extracts name", () => {
      const result = parseTopCard(topCard!.element);
      expect(result.full_name).toBe("Erik Aronesty");
    });

    it("extracts headline", () => {
      const result = parseTopCard(topCard!.element);
      expect(result.headline).toContain("Senior Software Engineer");
    });

    it("extracts location", () => {
      const result = parseTopCard(topCard!.element);
      expect(result.location).toContain("California");
    });

    it("extracts contact info link", () => {
      const result = parseTopCard(topCard!.element);
      expect(result.contact_info_link).toContain("contact-info");
    });

    it("extracts connections text", () => {
      const result = parseTopCard(topCard!.element);
      expect(result.connections_text).toContain("500+");
    });

    it("extracts profile image", () => {
      const result = parseTopCard(topCard!.element);
      expect(result.profile_image_url).toContain("profile-displayphoto");
    });

    it("extracts cover image", () => {
      const result = parseTopCard(topCard!.element);
      expect(result.cover_image_url).toContain("displaybackgroundimage");
    });
  });

  describe("about", () => {
    it("extracts about text", () => {
      const result = parseAbout(getSection("about"));
      expect(result.about_text).toContain("25 years");
    });
  });

  describe("experience", () => {
    it("finds multiple items", () => {
      const items = parseExperience(getSection("experience"));
      expect(items.length).toBeGreaterThanOrEqual(3);
    });

    it("extracts first job title", () => {
      const items = parseExperience(getSection("experience"));
      expect(items[0].title).toContain("Senior Software Engineer");
    });

    it("extracts company from first item", () => {
      const items = parseExperience(getSection("experience"));
      expect(items[0].company).toBeTruthy();
    });

    it("extracts date range", () => {
      const items = parseExperience(getSection("experience"));
      expect(items[0].date_range_raw).toContain("2024");
    });

    it("description is real content, not company+type line", () => {
      const items = parseExperience(getSection("experience"));
      for (const item of items) {
        if (item.description) {
          expect(item.description).not.toMatch(/·\s*(full-time|part-time|contract)/i);
        }
      }
    });

    it("excludes skill endorsement text from all fields", () => {
      const items = parseExperience(getSection("experience"));
      for (const item of items) {
        const fields = [item.title, item.location, item.description].filter(Boolean);
        for (const f of fields) {
          expect(f).not.toMatch(/and \+\d+ skills?$/i);
          expect(f).not.toBe("Product Strategy and Technical Architecture");
          expect(f).not.toBe("Leadership, Machine Learning and +1 skill");
          expect(f).not.toBe("Leadership, Product Strategy and +1 skill");
        }
      }
    });
  });

  describe("education", () => {
    it("finds education items", () => {
      const items = parseEducation(getSection("education"));
      expect(items.length).toBeGreaterThanOrEqual(2);
    });

    it("extracts school name", () => {
      const items = parseEducation(getSection("education"));
      const schools = items.map((i) => i.school).filter(Boolean);
      expect(schools.some((s) => s!.includes("Johns Hopkins"))).toBe(true);
    });

    it("extracts degree correctly (not school name)", () => {
      const items = parseEducation(getSection("education"));
      const jhu = items.find((i) => i.school?.includes("Johns Hopkins"));
      expect(jhu).toBeTruthy();
      expect(jhu!.degree).toBe("M.S.");
      expect(jhu!.field_of_study).toBe("Bioinformatics");
    });

    it("does not use duplicate degree text as description", () => {
      const items = parseEducation(getSection("education"));
      const jhu = items.find((i) => i.school?.includes("Johns Hopkins"));
      expect(jhu).toBeTruthy();
      if (jhu!.description) {
        expect(jhu!.description).not.toBe("M.S. Bioinformatics");
      }
    });
  });

  describe("skills", () => {
    it("finds skills", () => {
      const result = parseSkills(getSection("skills"));
      expect(result.skills.length).toBeGreaterThanOrEqual(1);
      expect(result.skills).toContain("Machine Learning");
    });

    it("excludes job titles and endorsement meta text", () => {
      const result = parseSkills(getSection("skills"));
      for (const skill of result.skills) {
        expect(skill).not.toMatch(/\bat\b.*\b(Bloomberg|Atakama|Puzzle)\b/i);
        expect(skill).not.toMatch(/endorsement/i);
        expect(skill).not.toMatch(/\d+ experiences/i);
      }
    });
  });

  describe("projects", () => {
    it("finds projects", () => {
      const items = parseProjects(getSection("projects"));
      expect(items.length).toBeGreaterThanOrEqual(1);
    });

    it("description is not 'Associated with' text", () => {
      const items = parseProjects(getSection("projects"));
      for (const item of items) {
        if (item.description) {
          expect(item.description).not.toMatch(/^associated with/i);
        }
      }
    });
  });

  describe("publications", () => {
    it("finds publications", () => {
      const items = parsePublications(getSection("publications"));
      expect(items.length).toBeGreaterThanOrEqual(1);
      expect(items[0].title).toContain("Encapsulated Search Index");
    });
  });

  describe("courses", () => {
    it("finds courses", () => {
      const result = parseCourses(getSection("courses"));
      expect(result.courses.length).toBeGreaterThanOrEqual(1);
    });

    it("course number is not 'Associated with' text", () => {
      const result = parseCourses(getSection("courses"));
      for (const course of result.courses) {
        if (course.number) {
          expect(course.number).not.toMatch(/^associated with/i);
        }
      }
    });
  });

  describe("services", () => {
    it("extracts services text", () => {
      const result = parseServices(getSection("services"));
      expect(result.services_text).toContain("AI/ML");
    });
  });

  describe("recommendations", () => {
    it("returns empty when no real recommendations exist", () => {
      const el = sections.find((s) => s.id === "recommendations");
      if (!el) return; // section may not exist in this DOM variant
      const items = parseRecommendations(el.element);
      expect(items).toEqual([]);
    });
  });

  describe("activity", () => {
    it("finds activity items", () => {
      const result = parseActivity(getSection("recent-activity"));
      expect(result.activities.length).toBeGreaterThanOrEqual(1);
    });

    it("excludes video player accessibility noise", () => {
      const result = parseActivity(getSection("recent-activity"));
      for (const a of result.activities) {
        expect(a.text).not.toMatch(/^chapters$/i);
        expect(a.text).not.toMatch(/^captions off/i);
        expect(a.text).not.toMatch(/^descriptions off/i);
        expect(a.text).not.toMatch(/^Unknown Captions$/i);
      }
    });

    it("strips video player text from within posts", () => {
      const result = parseActivity(getSection("recent-activity"));
      for (const a of result.activities) {
        expect(a.text).not.toContain("Beginning of dialog window");
        expect(a.text).not.toContain("End of dialog window");
        expect(a.text).not.toContain("Close Modal Dialog");
      }
    });
  });

  describe("certifications", () => {
    it("finds certifications", () => {
      const items = parseCertifications(getSection("licenses-and-certifications"));
      expect(items.length).toBeGreaterThanOrEqual(1);
      expect(items[0].name).toBe("CFA");
    });
  });
});
