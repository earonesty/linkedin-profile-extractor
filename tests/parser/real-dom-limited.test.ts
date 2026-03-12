import { describe, it, expect } from "vitest";
import { loadFixture } from "./helpers";
import { parseTopCard } from "../../packages/extractor-linkedin/src/parsers/top-card";
import { parseExperience } from "../../packages/extractor-linkedin/src/parsers/experience";
import { parseEducation } from "../../packages/extractor-linkedin/src/parsers/education";
import { parseAbout } from "../../packages/extractor-linkedin/src/parsers/about";
import { discoverSections } from "../../packages/extractor-core/src/section-discovery";

describe("real LinkedIn DOM - limited profile (satyanadella)", () => {
  const doc = loadFixture("real-linkedin-dom-limited.xml");

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
    });
  });

  describe("top card", () => {
    it("extracts name", () => {
      const el = doc.querySelector('[data-view-name="profile-top-card"]')!;
      const result = parseTopCard(el);
      expect(result.full_name).toBe("Satya Nadella");
    });

    it("extracts headline", () => {
      const el = doc.querySelector('[data-view-name="profile-top-card"]')!;
      const result = parseTopCard(el);
      expect(result.headline).toContain("Chairman and CEO");
    });

    it("extracts location", () => {
      const el = doc.querySelector('[data-view-name="profile-top-card"]')!;
      const result = parseTopCard(el);
      expect(result.location).toContain("Washington");
    });
  });

  describe("about", () => {
    it("extracts about text", () => {
      const el = doc.querySelector('[data-view-name="profile-card-about"]')!;
      const result = parseAbout(el);
      expect(result.about_text).toBeTruthy();
      expect(result.about_text!.length).toBeGreaterThan(20);
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
      expect(items[0].title).toContain("Chairman and CEO");
    });

    it("extracts company from first item", () => {
      const el = doc.querySelector('[data-view-name="profile-card-experience"]')!;
      const items = parseExperience(el);
      expect(items[0].company).toContain("Microsoft");
    });

    it("extracts date range", () => {
      const el = doc.querySelector('[data-view-name="profile-card-experience"]')!;
      const items = parseExperience(el);
      expect(items[0].date_range_raw).toContain("2014");
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
      expect(schools.some((s) => s!.includes("Chicago"))).toBe(true);
    });
  });
});
