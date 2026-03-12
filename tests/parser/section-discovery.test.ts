import { describe, it, expect } from "vitest";
import { loadFixture } from "./helpers";
import { discoverSections } from "../../packages/extractor-core/src/section-discovery";

describe("discoverSections", () => {
  describe("complete-profile.html", () => {
    it("discovers the top card", () => {
      const doc = loadFixture("complete-profile.html");
      const warnings: string[] = [];
      const result = discoverSections(doc, warnings);

      expect(result.topCard).not.toBeNull();
      expect(result.topCard!.id).toBe("top-card");
    });

    it("discovers all expected sections", () => {
      const doc = loadFixture("complete-profile.html");
      const warnings: string[] = [];
      const result = discoverSections(doc, warnings);

      const ids = result.sections.map((s) => s.id);
      expect(ids).toContain("about");
      expect(ids).toContain("experience");
      expect(ids).toContain("education");
      expect(ids).toContain("skills");
      expect(ids).toContain("projects");
      expect(ids).toContain("licenses-and-certifications");
      expect(ids).toContain("publications");
      expect(ids).toContain("recommendations");
      expect(ids).toContain("interests");
      expect(ids).toContain("courses");
    });

    it("returns sections in KNOWN_ANCHORS order", () => {
      const doc = loadFixture("complete-profile.html");
      const warnings: string[] = [];
      const result = discoverSections(doc, warnings);

      const ids = result.sections.map((s) => s.id);
      const aboutIdx = ids.indexOf("about");
      const experienceIdx = ids.indexOf("experience");
      const educationIdx = ids.indexOf("education");
      const skillsIdx = ids.indexOf("skills");

      expect(aboutIdx).toBeLessThan(experienceIdx);
      expect(experienceIdx).toBeLessThan(educationIdx);
      expect(educationIdx).toBeLessThan(skillsIdx);
    });
  });

  describe("minimal-profile.html", () => {
    it("discovers top card and about only", () => {
      const doc = loadFixture("minimal-profile.html");
      const warnings: string[] = [];
      const result = discoverSections(doc, warnings);

      expect(result.topCard).not.toBeNull();

      const ids = result.sections.map((s) => s.id);
      expect(ids).toContain("about");
      expect(ids).not.toContain("experience");
      expect(ids).not.toContain("education");
      expect(ids).not.toContain("skills");
    });

    it("generates warnings for missing sections", () => {
      const doc = loadFixture("minimal-profile.html");
      const warnings: string[] = [];
      discoverSections(doc, warnings);

      expect(warnings.length).toBeGreaterThan(0);
      const warningText = warnings.join(" ");
      expect(warningText).toContain("experience");
      expect(warningText).toContain("education");
      expect(warningText).toContain("skills");
    });
  });

  describe("missing-sections.html", () => {
    it("discovers top card and a subset of sections", () => {
      const doc = loadFixture("missing-sections.html");
      const warnings: string[] = [];
      const result = discoverSections(doc, warnings);

      expect(result.topCard).not.toBeNull();

      const ids = result.sections.map((s) => s.id);
      expect(ids).toContain("about");
      expect(ids).toContain("experience");
      expect(ids).toContain("education");
    });

    it("produces warnings for sections not present on the profile", () => {
      const doc = loadFixture("missing-sections.html");
      const warnings: string[] = [];
      discoverSections(doc, warnings);

      // Many sections are missing (skills, projects, certifications, etc.)
      expect(warnings.length).toBeGreaterThanOrEqual(5);
      const warningText = warnings.join(" ");
      expect(warningText).toContain("skills");
      expect(warningText).toContain("projects");
    });
  });

  describe("fallback-sections.html", () => {
    it("discovers sections via h2 heading fallback", () => {
      const doc = loadFixture("fallback-sections.html");
      const warnings: string[] = [];
      const result = discoverSections(doc, warnings);

      const ids = result.sections.map((s) => s.id);
      expect(ids).toContain("about");
      expect(ids).toContain("experience");
      expect(ids).toContain("education");
      expect(ids).toContain("skills");
    });

    it("reports top card as missing when no data-view-name anchor exists", () => {
      const doc = loadFixture("fallback-sections.html");
      const warnings: string[] = [];
      const result = discoverSections(doc, warnings);

      // fallback-sections.html has no data-view-name on any element
      expect(result.topCard).toBeNull();
      expect(warnings).toContain("Top card not found via data-view-name anchor");
    });
  });
});
