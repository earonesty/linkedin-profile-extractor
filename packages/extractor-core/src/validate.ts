/**
 * Validates that the current page is a LinkedIn profile page.
 * - hostname must contain "linkedin.com"
 * - pathname must begin with "/in/"
 * Throws an error if validation fails.
 */
export function validateLinkedInProfile(doc: Document): void {
  const url = new URL(doc.location.href);
  if (!url.hostname.includes("linkedin.com")) {
    throw new Error(
      `Not a LinkedIn page: hostname "${url.hostname}" does not contain "linkedin.com"`
    );
  }
  if (!url.pathname.startsWith("/in/")) {
    throw new Error(
      `Not a LinkedIn profile page: pathname "${url.pathname}" does not start with "/in/"`
    );
  }
}
