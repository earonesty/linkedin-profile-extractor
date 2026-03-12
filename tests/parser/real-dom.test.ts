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
  });

  describe("skills", () => {
    it("finds skills", () => {
      const el = doc.querySelector('[data-view-name="profile-card-skills"]')!;
      const result = parseSkills(el);
      expect(result.skills.length).toBeGreaterThanOrEqual(1);
      expect(result.skills).toContain("Machine Learning");
    });
  });

  describe("projects", () => {
    it("finds projects", () => {
      const el = doc.querySelector('[data-view-name="profile-card-projects"]')!;
      const items = parseProjects(el);
      expect(items.length).toBeGreaterThanOrEqual(1);
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
  });

  describe("services", () => {
    it("extracts services text", () => {
      const el = doc.querySelector('[data-view-name="profile-card-services"]')!;
      const result = parseServices(el);
      expect(result.services_text).toContain("AI/ML");
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
