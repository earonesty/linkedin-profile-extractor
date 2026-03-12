# Testing Strategy

## Three-Layer Testing

Testing is organized into three layers, each with a different scope and reliability trade-off:

### 1. Fixture Tests (deterministic, runs in CI)

Unit tests that feed saved HTML fragments into parsers and assert on structured output. These are fast, repeatable, and form the primary safety net.

### 2. Playwright Local Tests (semi-automated, never in CI)

Playwright scripts that run against live LinkedIn pages using an authenticated browser context. These verify that parsers work against current LinkedIn DOM. They are opt-in, manual, and require credentials -- see `playwright-setup.md`.

### 3. Manual Verification (human, never in CI)

Running the bookmarklet on live LinkedIn profiles and inspecting the output. Used for final validation and exploratory testing -- see `manual-testing.md`.

## Fixture File Naming

Fixtures live in `tests/fixtures/` and follow this naming convention:

```
tests/fixtures/{section}-{variant}.html
```

Examples:

- `experience-single-role.html`
- `experience-multi-role.html`
- `education-basic.html`
- `skills-with-endorsements.html`
- `about-long-text.html`

Each file contains the outerHTML of a single section container element, exactly as captured from a live LinkedIn page.

## Fixture Content Guidelines

- Fixtures must be real HTML captured from LinkedIn, not hand-written approximations.
- Redact personal information: replace names, company names, and other PII with plausible fake data. Keep DOM structure and attributes intact.
- Do not minify or reformat the HTML. Preserve whitespace and attribute order as-is.
- Include a comment at the top of each fixture with the capture date:

```html
<!-- captured: 2026-03-10 -->
```

## How to Capture New Fixtures

1. Open a LinkedIn profile in your browser.
2. Open DevTools and locate the section you want to capture.
3. Right-click the section container element and select "Copy > Copy outerHTML".
4. Paste into a new file under `tests/fixtures/` following the naming convention.
5. Redact PII (names, photos, URLs containing real usernames).
6. Add the capture date comment.
7. Write or update parser tests to cover the new fixture.

## When to Update Fixtures

- When a parser test starts failing due to LinkedIn DOM changes.
- When adding a new parser for a previously uncovered section.
- When a new variant of a section is discovered (e.g., a different layout for experience entries with multiple roles at the same company).
- Periodically (every few months) to ensure fixtures reflect current LinkedIn markup.
