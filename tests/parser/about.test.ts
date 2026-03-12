import { describe, it, expect } from "vitest";
import { loadFixture } from "./helpers";
import { parseAbout } from "../../packages/extractor-linkedin/src/parsers/about";

describe("parseAbout", () => {
  describe("complete-profile.html", () => {
    it("extracts about_text", () => {
      const doc = loadFixture("complete-profile.html");
      const section = doc.querySelector('[data-view-name="profile-card-about"]')!;
      const result = parseAbout(section);

      expect(result.about_text).toBeTruthy();
    });

    it("about_text contains meaningful content", () => {
      const doc = loadFixture("complete-profile.html");
      const section = doc.querySelector('[data-view-name="profile-card-about"]')!;
      const result = parseAbout(section);

      expect(result.about_text!.length).toBeGreaterThan(50);
      expect(result.about_text).toContain("software engineer");
    });

    it("about_text does not include the h2 heading", () => {
      const doc = loadFixture("complete-profile.html");
      const section = doc.querySelector('[data-view-name="profile-card-about"]')!;
      const result = parseAbout(section);

      expect(result.about_text).not.toMatch(/^About\b/);
    });
  });

  describe("minimal-profile.html", () => {
    it("extracts about_text from minimal profile", () => {
      const doc = loadFixture("minimal-profile.html");
      const section = doc.querySelector('[data-view-name="profile-card-about"]')!;
      const result = parseAbout(section);

      expect(result.about_text).toBeTruthy();
      expect(result.about_text).toContain("Product designer");
    });
  });
});
