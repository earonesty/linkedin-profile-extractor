import { describe, it, expect } from "vitest";
import { JSDOM } from "jsdom";
import { validateLinkedInProfile } from "../../packages/extractor-core/src/validate";

function createDoc(url: string): Document {
  const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", { url });
  return dom.window.document;
}

describe("validateLinkedInProfile", () => {
  it("does not throw for a valid LinkedIn profile URL", () => {
    const doc = createDoc("https://www.linkedin.com/in/johndoe/");
    expect(() => validateLinkedInProfile(doc)).not.toThrow();
  });

  it("does not throw for linkedin.com/in/ without trailing slash", () => {
    const doc = createDoc("https://www.linkedin.com/in/johndoe");
    expect(() => validateLinkedInProfile(doc)).not.toThrow();
  });

  it("throws for a non-LinkedIn URL", () => {
    const doc = createDoc("https://www.example.com/in/johndoe/");
    expect(() => validateLinkedInProfile(doc)).toThrow("Not a LinkedIn page");
  });

  it("throws for a LinkedIn company page", () => {
    const doc = createDoc("https://www.linkedin.com/company/acme-corp/");
    expect(() => validateLinkedInProfile(doc)).toThrow(
      'does not start with "/in/"'
    );
  });

  it("throws for LinkedIn feed page", () => {
    const doc = createDoc("https://www.linkedin.com/feed/");
    expect(() => validateLinkedInProfile(doc)).toThrow(
      'does not start with "/in/"'
    );
  });
});
