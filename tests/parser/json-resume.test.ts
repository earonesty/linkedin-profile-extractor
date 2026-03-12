import { describe, it, expect } from "vitest";
import { loadFixture } from "./helpers";
import { extractLinkedInProfile } from "../../packages/extractor-linkedin/src/extract";
import { toJsonResume } from "../../packages/schema/src/json-resume";

describe("toJsonResume", () => {
  it("converts real DOM export to JSON Resume format", async () => {
    const doc = loadFixture("real-linkedin-dom.xml");
    const data = await extractLinkedInProfile(doc, {
      expandSections: false,
      scrollPage: false,
    });
    const resume = toJsonResume(data);

    expect(resume.basics.name).toBe("Erik Aronesty");
    expect(resume.basics.label).toContain("Senior Software Engineer");
    expect(resume.basics.location.region).toContain("California");
    expect(resume.basics.url).toBeTruthy();

    expect(resume.work.length).toBeGreaterThanOrEqual(3);
    expect(resume.work[0].position).toContain("Senior Software Engineer");
    expect(resume.work[0].name).toBeTruthy();

    expect(resume.education.length).toBeGreaterThanOrEqual(2);

    expect(resume.skills.length).toBeGreaterThanOrEqual(1);
    expect(resume.skills.some((s) => s.name === "Machine Learning")).toBe(true);

    expect(resume.projects.length).toBeGreaterThanOrEqual(1);
    expect(resume.publications.length).toBeGreaterThanOrEqual(1);
    expect(resume.certificates.length).toBeGreaterThanOrEqual(1);
  });

  it("handles limited profile gracefully", async () => {
    const doc = loadFixture("real-linkedin-dom-limited.xml");
    const data = await extractLinkedInProfile(doc, {
      expandSections: false,
      scrollPage: false,
    });
    const resume = toJsonResume(data);

    expect(resume.basics.name).toBe("Satya Nadella");
    expect(resume.work.length).toBeGreaterThanOrEqual(3);
    expect(resume.education.length).toBeGreaterThanOrEqual(2);
    // No skills/projects/publications/certs on this profile
    expect(resume.skills).toEqual([]);
    expect(resume.certificates).toEqual([]);
  });
});
