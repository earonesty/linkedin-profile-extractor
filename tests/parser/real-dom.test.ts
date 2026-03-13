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

  describe("section discovery", () => {
    it("finds the top card", () => {
      const warnings: string[] = [];
      const { topCard } = discoverSections(doc, warnings);
      expect(topCard).not.toBeNull();
    });

    it("finds key sections", () => {
      const warnings: string[] = [];
      const { sections } = discoverSections(doc, warnings);
      const ids = sections.map((s) => s.id);
      expect(ids).toContain("about");
      expect(ids).toContain("experience");
      expect(ids).toContain("education");
      expect(ids).toContain("skills");
      expect(ids).toContain("projects");
      expect(ids).toContain("publications");
    });

    it("excludes LinkedIn UI chrome sections", () => {
      const warnings: string[] = [];
      const { sections } = discoverSections(doc, warnings);
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
      const el = doc.querySelector('[data-view-name="profile-top-card"]')!;
      const result = parseTopCard(el);
      expect(result.full_name).toBe("Erik Aronesty");
    });

    it("extracts headline", () => {
      const el = doc.querySelector('[data-view-name="profile-top-card"]')!;
      const result = parseTopCard(el);
      expect(result.headline).toContain("Senior Software Engineer");
    });

    it("extracts location", () => {
      const el = doc.querySelector('[data-view-name="profile-top-card"]')!;
      const result = parseTopCard(el);
      expect(result.location).toContain("California");
    });

    it("extracts contact info link", () => {
      const el = doc.querySelector('[data-view-name="profile-top-card"]')!;
      const result = parseTopCard(el);
      expect(result.contact_info_link).toContain("contact-info");
    });

    it("extracts connections text", () => {
      const el = doc.querySelector('[data-view-name="profile-top-card"]')!;
      const result = parseTopCard(el);
      expect(result.connections_text).toContain("500+");
    });

    it("extracts profile image", () => {
      const el = doc.querySelector('[data-view-name="profile-top-card"]')!;
      const result = parseTopCard(el);
      expect(result.profile_image_url).toContain("profile-displayphoto");
    });

    it("extracts cover image", () => {
      const el = doc.querySelector('[data-view-name="profile-top-card"]')!;
      const result = parseTopCard(el);
      expect(result.cover_image_url).toContain("displaybackgroundimage");
    });
  });

  describe("about", () => {
    it("extracts about text", () => {
      const el = doc.querySelector('[data-view-name="profile-card-about"]')!;
      const result = parseAbout(el);
      expect(result.about_text).toContain("25 years");
    });
  });

  describe("experience", () => {
    it("finds multiple items", () => {
      const el = doc.querySelector('[data-view-name="profile-card-experience"]')!;
      const items = parseExperience(el);
      expect(items.length).toBeGreaterThanOrEqual(3);
    });

    it("extracts first job title", () => {
      const el = doc.querySelector('[data-view-name="profile-card-experience"]')!;
      const items = parseExperience(el);
      expect(items[0].title).toContain("Senior Software Engineer");
    });

    it("extracts company from first item", () => {
      const el = doc.querySelector('[data-view-name="profile-card-experience"]')!;
      const items = parseExperience(el);
      const firstCompany = items[0].company;
      expect(firstCompany).toBeTruthy();
    });

    it("extracts date range", () => {
      const el = doc.querySelector('[data-view-name="profile-card-experience"]')!;
      const items = parseExperience(el);
      expect(items[0].date_range_raw).toContain("2024");
    });

    it("description is real content, not company+type line", () => {
      const el = doc.querySelector('[data-view-name="profile-card-experience"]')!;
      const items = parseExperience(el);
      for (const item of items) {
        if (item.description) {
          // Description should not be a "Company · Full-time" line
          expect(item.description).not.toMatch(/·\s*(full-time|part-time|contract)/i);
        }
      }
    });

    it("excludes skill endorsement text from all fields", () => {
      const el = doc.querySelector('[data-view-name="profile-card-experience"]')!;
      const items = parseExperience(el);
      for (const item of items) {
        const fields = [item.title, item.location, item.description].filter(Boolean);
        for (const f of fields) {
          // No "+N skill" endorsement lines
          expect(f).not.toMatch(/and \+\d+ skills?$/i);
          // No bare skill lists that were endorsement metadata
          expect(f).not.toBe("Product Strategy and Technical Architecture");
          expect(f).not.toBe("Leadership, Machine Learning and +1 skill");
          expect(f).not.toBe("Leadership, Product Strategy and +1 skill");
        }
      }
    });
  });

  describe("education", () => {
    it("finds education items", () => {
      const el = doc.querySelector('[data-view-name="profile-card-education"]')!;
      const items = parseEducation(el);
      expect(items.length).toBeGreaterThanOrEqual(2);
    });

    it("extracts school name", () => {
      const el = doc.querySelector('[data-view-name="profile-card-education"]')!;
      const items = parseEducation(el);
      const schools = items.map((i) => i.school).filter(Boolean);
      expect(schools.some((s) => s!.includes("Johns Hopkins"))).toBe(true);
    });

    it("extracts degree correctly (not school name)", () => {
      const el = doc.querySelector('[data-view-name="profile-card-education"]')!;
      const items = parseEducation(el);
      const jhu = items.find((i) => i.school?.includes("Johns Hopkins"));
      expect(jhu).toBeTruthy();
      expect(jhu!.degree).toBe("M.S.");
      expect(jhu!.field_of_study).toBe("Bioinformatics");
    });

    it("does not use duplicate degree text as description", () => {
      const el = doc.querySelector('[data-view-name="profile-card-education"]')!;
      const items = parseEducation(el);
      const jhu = items.find((i) => i.school?.includes("Johns Hopkins"));
      expect(jhu).toBeTruthy();
      // "M.S. Bioinformatics" is a duplicate of degree+field, not a real description
      if (jhu!.description) {
        expect(jhu!.description).not.toBe("M.S. Bioinformatics");
      }
    });
  });

  describe("skills", () => {
    it("finds skills", () => {
      const el = doc.querySelector('[data-view-name="profile-card-skills"]')!;
      const result = parseSkills(el);
      expect(result.skills.length).toBeGreaterThanOrEqual(1);
      expect(result.skills).toContain("Machine Learning");
    });

    it("excludes job titles and endorsement meta text", () => {
      const el = doc.querySelector('[data-view-name="profile-card-skills"]')!;
      const result = parseSkills(el);
      for (const skill of result.skills) {
        expect(skill).not.toMatch(/\bat\b.*\b(Bloomberg|Atakama|Puzzle)\b/i);
        expect(skill).not.toMatch(/endorsement/i);
        expect(skill).not.toMatch(/\d+ experiences/i);
      }
    });
  });

  describe("projects", () => {
    it("finds projects", () => {
      const el = doc.querySelector('[data-view-name="profile-card-projects"]')!;
      const items = parseProjects(el);
      expect(items.length).toBeGreaterThanOrEqual(1);
    });

    it("description is not 'Associated with' text", () => {
      const el = doc.querySelector('[data-view-name="profile-card-projects"]')!;
      const items = parseProjects(el);
      for (const item of items) {
        if (item.description) {
          expect(item.description).not.toMatch(/^associated with/i);
        }
      }
    });
  });

  describe("publications", () => {
    it("finds publications", () => {
      const el = doc.querySelector('[data-view-name="profile-card-publications"]')!;
      const items = parsePublications(el);
      expect(items.length).toBeGreaterThanOrEqual(1);
      expect(items[0].title).toContain("Encapsulated Search Index");
    });
  });

  describe("courses", () => {
    it("finds courses", () => {
      const el = doc.querySelector('[data-view-name="profile-card-courses"]')!;
      const result = parseCourses(el);
      expect(result.courses.length).toBeGreaterThanOrEqual(1);
    });

    it("course number is not 'Associated with' text", () => {
      const el = doc.querySelector('[data-view-name="profile-card-courses"]')!;
      const result = parseCourses(el);
      for (const course of result.courses) {
        if (course.number) {
          expect(course.number).not.toMatch(/^associated with/i);
        }
      }
    });
  });

  describe("services", () => {
    it("extracts services text", () => {
      const el = doc.querySelector('[data-view-name="profile-card-services"]')!;
      const result = parseServices(el);
      expect(result.services_text).toContain("AI/ML");
    });
  });

  describe("recommendations", () => {
    it("returns empty when no real recommendations exist", () => {
      const el = doc.querySelector('[data-view-name="profile-card-recommendations"]')!;
      const items = parseRecommendations(el);
      expect(items).toEqual([]);
    });
  });

  describe("activity", () => {
    it("finds activity items", () => {
      const el = doc.querySelector('[data-view-name="profile-card-recent-activity"]')!;
      const result = parseActivity(el);
      expect(result.activities.length).toBeGreaterThanOrEqual(1);
    });

    it("excludes video player accessibility noise", () => {
      const el = doc.querySelector('[data-view-name="profile-card-recent-activity"]')!;
      const result = parseActivity(el);
      for (const a of result.activities) {
        expect(a.text).not.toMatch(/^chapters$/i);
        expect(a.text).not.toMatch(/^captions off/i);
        expect(a.text).not.toMatch(/^descriptions off/i);
        expect(a.text).not.toMatch(/^Unknown Captions$/i);
      }
    });

    it("strips video player text from within posts", () => {
      const el = doc.querySelector('[data-view-name="profile-card-recent-activity"]')!;
      const result = parseActivity(el);
      for (const a of result.activities) {
        expect(a.text).not.toContain("Beginning of dialog window");
        expect(a.text).not.toContain("End of dialog window");
        expect(a.text).not.toContain("Close Modal Dialog");
      }
    });
  });

  describe("certifications", () => {
    it("finds certifications", () => {
      const el = doc.querySelector('[data-view-name="profile-card-licenses-and-certifications"]')!;
      const items = parseCertifications(el);
      expect(items.length).toBeGreaterThanOrEqual(1);
      expect(items[0].name).toBe("CFA");
    });
  });
});
