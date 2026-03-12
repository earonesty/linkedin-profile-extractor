import { describe, it, expect } from "vitest";
import { loadFixture } from "./helpers";
import { parseTopCard } from "../../packages/extractor-linkedin/src/parsers/top-card";

describe("parseTopCard", () => {
  describe("complete-profile.html", () => {
    it("extracts full_name", () => {
      const doc = loadFixture("complete-profile.html");
      const topCardEl = doc.querySelector('[data-view-name="profile-top-card"]')!;
      const result = parseTopCard(topCardEl);

      expect(result.full_name).toBe("Jane Smith");
    });

    it("extracts headline", () => {
      const doc = loadFixture("complete-profile.html");
      const topCardEl = doc.querySelector('[data-view-name="profile-top-card"]')!;
      const result = parseTopCard(topCardEl);

      expect(result.headline).toBeTruthy();
      expect(result.headline).toContain("Senior Software Engineer");
    });

    it("extracts contact_info_link", () => {
      const doc = loadFixture("complete-profile.html");
      const topCardEl = doc.querySelector('[data-view-name="profile-top-card"]')!;
      const result = parseTopCard(topCardEl);

      expect(result.contact_info_link).toBeTruthy();
      expect(result.contact_info_link).toContain("contact-info");
    });

    it("extracts profile_image_url", () => {
      const doc = loadFixture("complete-profile.html");
      const topCardEl = doc.querySelector('[data-view-name="profile-top-card"]')!;
      const result = parseTopCard(topCardEl);

      expect(result.profile_image_url).toBeTruthy();
      expect(result.profile_image_url).toContain("licdn.com");
    });
  });

  describe("minimal-profile.html", () => {
    it("extracts full_name from minimal profile", () => {
      const doc = loadFixture("minimal-profile.html");
      const topCardEl = doc.querySelector('[data-view-name="profile-top-card"]')!;
      const result = parseTopCard(topCardEl);

      expect(result.full_name).toBe("Alex Chen");
    });

    it("extracts headline from minimal profile", () => {
      const doc = loadFixture("minimal-profile.html");
      const topCardEl = doc.querySelector('[data-view-name="profile-top-card"]')!;
      const result = parseTopCard(topCardEl);

      expect(result.headline).toBeTruthy();
    });

    it("extracts contact_info_link from minimal profile", () => {
      const doc = loadFixture("minimal-profile.html");
      const topCardEl = doc.querySelector('[data-view-name="profile-top-card"]')!;
      const result = parseTopCard(topCardEl);

      expect(result.contact_info_link).toContain("contact-info");
    });
  });
});
