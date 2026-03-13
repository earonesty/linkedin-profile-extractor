import { describe, it, expect } from "vitest";
import { loadFixture } from "./helpers";
import {
  findDetailContentContainer,
  parseDetailPage,
} from "../../packages/extractor-linkedin/src/detail-pages";

describe("detail page parsing", () => {
  describe("findDetailContentContainer", () => {
    it("finds container with multiple children in experience detail page", () => {
      const doc = loadFixture("details-experience.xml");
      const container = findDetailContentContainer(doc);
      expect(container).not.toBeNull();
      expect(container!.tagName).not.toBe("HTML");
      expect(container!.children.length).toBeGreaterThanOrEqual(10);
    });

    it("finds container in education detail page", () => {
      const doc = loadFixture("details-education.xml");
      const container = findDetailContentContainer(doc);
      expect(container).not.toBeNull();
      expect(container!.children.length).toBeGreaterThanOrEqual(3);
    });

    it("finds container in skills detail page", () => {
      const doc = loadFixture("details-skills.xml");
      const container = findDetailContentContainer(doc);
      expect(container).not.toBeNull();
      expect(container!.children.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe("parseDetailPage - experience", () => {
    it("returns more items than profile page", () => {
      const doc = loadFixture("details-experience.xml");
      const items = parseDetailPage(doc, "experience");
      // Detail page has 6 items (including header parsed as item)
      // Profile page shows ~5, so detail should have at least 5
      expect(items.length).toBeGreaterThanOrEqual(5);
    });

    it("extracts structured experience items with titles", () => {
      const doc = loadFixture("details-experience.xml");
      const items = parseDetailPage(doc, "experience") as Array<{
        title: string | null;
        company: string | null;
      }>;
      const withTitles = items.filter((i) => i.title && i.title !== "Experience");
      expect(withTitles.length).toBeGreaterThanOrEqual(3);
      expect(withTitles[0].company).toBeTruthy();
    });

    it("items have date ranges", () => {
      const doc = loadFixture("details-experience.xml");
      const items = parseDetailPage(doc, "experience") as Array<{
        date_range_raw: string | null;
      }>;
      const withDates = items.filter((i) => i.date_range_raw);
      expect(withDates.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("parseDetailPage - education", () => {
    it("returns education items", () => {
      const doc = loadFixture("details-education.xml");
      const items = parseDetailPage(doc, "education");
      expect(items.length).toBeGreaterThanOrEqual(2);
    });

    it("extracts school names", () => {
      const doc = loadFixture("details-education.xml");
      const items = parseDetailPage(doc, "education") as Array<{
        school: string | null;
      }>;
      const schools = items.map((i) => i.school).filter(Boolean);
      expect(schools.some((s) => s!.includes("Johns Hopkins"))).toBe(true);
    });
  });

  describe("parseDetailPage - skills", () => {
    it("returns skills list with more skills than profile page", () => {
      const doc = loadFixture("details-skills.xml");
      const items = parseDetailPage(doc, "skills");
      // Skills parser returns array of strings
      expect(items.length).toBeGreaterThanOrEqual(8);
    });

    it("includes expected skills", () => {
      const doc = loadFixture("details-skills.xml");
      const items = parseDetailPage(doc, "skills") as string[];
      expect(items).toContain("Machine Learning");
      expect(items).toContain("Python");
    });
  });

  describe("parseDetailPage - projects", () => {
    it("returns project items", () => {
      const doc = loadFixture("details-projects.xml");
      const items = parseDetailPage(doc, "projects");
      expect(items.length).toBeGreaterThanOrEqual(2);
    });

    it("extracts project names", () => {
      const doc = loadFixture("details-projects.xml");
      const items = parseDetailPage(doc, "projects") as Array<{
        name: string | null;
      }>;
      const names = items.map((i) => i.name).filter(Boolean);
      expect(names.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("parseDetailPage - publications", () => {
    it("returns publication items", () => {
      const doc = loadFixture("details-publications.xml");
      const items = parseDetailPage(doc, "publications");
      expect(items.length).toBeGreaterThanOrEqual(3);
    });

    it("extracts publication titles", () => {
      const doc = loadFixture("details-publications.xml");
      const items = parseDetailPage(doc, "publications") as Array<{
        title: string | null;
      }>;
      const titles = items.map((i) => i.title).filter(Boolean);
      expect(titles.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("parseDetailPage - courses", () => {
    it("returns course items", () => {
      const doc = loadFixture("details-courses.xml");
      const items = parseDetailPage(doc, "courses");
      expect(items.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe("parseDetailPage - certifications", () => {
    it("maps licenses-and-certifications section id", () => {
      // The DETAIL_SECTIONS maps "licenses-and-certifications" -> "certifications"
      // We don't have a certifications detail fixture, but verify unknown returns empty
      const doc = loadFixture("details-experience.xml");
      const items = parseDetailPage(doc, "licenses-and-certifications");
      // Should not crash, returns whatever parser finds
      expect(Array.isArray(items)).toBe(true);
    });
  });

  describe("parseDetailPage - unknown section", () => {
    it("returns empty array for unknown section", () => {
      const doc = loadFixture("details-experience.xml");
      const items = parseDetailPage(doc, "nonexistent");
      expect(items).toEqual([]);
    });
  });
});
