import { describe, it, expect } from "vitest";
import { loadFixture } from "./helpers";
import { parseExperience } from "../../packages/extractor-linkedin/src/parsers/experience";

describe("parseExperience", () => {
  describe("complete-profile.html", () => {
    it("returns multiple experience items", () => {
      const doc = loadFixture("complete-profile.html");
      const section = doc.querySelector('[data-view-name="profile-card-experience"]')!;
      const items = parseExperience(section);

      expect(items.length).toBeGreaterThanOrEqual(3);
    });

    it("extracts title for experience items", () => {
      const doc = loadFixture("complete-profile.html");
      const section = doc.querySelector('[data-view-name="profile-card-experience"]')!;
      const items = parseExperience(section);

      for (const item of items) {
        expect(item.title).toBeTruthy();
      }
    });

    it("extracts company for experience items", () => {
      const doc = loadFixture("complete-profile.html");
      const section = doc.querySelector('[data-view-name="profile-card-experience"]')!;
      const items = parseExperience(section);

      const companies = items.map((i) => i.company).filter(Boolean);
      expect(companies.length).toBeGreaterThan(0);
      expect(companies).toContain("TechCorp");
    });

    it("extracts date_range_raw for experience items", () => {
      const doc = loadFixture("complete-profile.html");
      const section = doc.querySelector('[data-view-name="profile-card-experience"]')!;
      const items = parseExperience(section);

      const withDates = items.filter((i) => i.date_range_raw);
      expect(withDates.length).toBeGreaterThan(0);
    });
  });

  describe("long-experience.html", () => {
    it("returns 8 or more experience items", () => {
      const doc = loadFixture("long-experience.html");
      const section = doc.querySelector('[data-view-name="profile-card-experience"]')!;
      const items = parseExperience(section);

      expect(items.length).toBeGreaterThanOrEqual(8);
    });
  });
});
