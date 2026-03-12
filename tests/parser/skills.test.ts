import { describe, it, expect } from "vitest";
import { loadFixture } from "./helpers";
import { parseSkills } from "../../packages/extractor-linkedin/src/parsers/skills";

describe("parseSkills", () => {
  describe("complete-profile.html", () => {
    it("returns a non-empty skills array", () => {
      const doc = loadFixture("complete-profile.html");
      const section = doc.querySelector('[data-view-name="profile-card-skills"]')!;
      const result = parseSkills(section);

      expect(result.skills).toBeInstanceOf(Array);
      expect(result.skills.length).toBeGreaterThan(0);
    });

    it("includes known skills from the fixture", () => {
      const doc = loadFixture("complete-profile.html");
      const section = doc.querySelector('[data-view-name="profile-card-skills"]')!;
      const result = parseSkills(section);

      expect(result.skills).toContain("Distributed Systems");
      expect(result.skills).toContain("Python");
      expect(result.skills).toContain("Kubernetes");
    });
  });
});
