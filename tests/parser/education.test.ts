import { describe, it, expect } from "vitest";
import { loadFixture } from "./helpers";
import { parseEducation } from "../../packages/extractor-linkedin/src/parsers/education";

describe("parseEducation", () => {
  describe("complete-profile.html", () => {
    it("returns education items", () => {
      const doc = loadFixture("complete-profile.html");
      const section = doc.querySelector('[data-view-name="profile-card-education"]')!;
      const items = parseEducation(section);

      expect(items.length).toBeGreaterThanOrEqual(2);
    });

    it("extracts school name", () => {
      const doc = loadFixture("complete-profile.html");
      const section = doc.querySelector('[data-view-name="profile-card-education"]')!;
      const items = parseEducation(section);

      const schools = items.map((i) => i.school).filter(Boolean);
      expect(schools.length).toBeGreaterThan(0);
      expect(schools).toContain("Stanford University");
    });

    it("extracts degree", () => {
      const doc = loadFixture("complete-profile.html");
      const section = doc.querySelector('[data-view-name="profile-card-education"]')!;
      const items = parseEducation(section);

      const degrees = items.map((i) => i.degree).filter(Boolean);
      expect(degrees.length).toBeGreaterThan(0);
    });
  });
});
