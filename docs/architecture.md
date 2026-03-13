# Architecture

## Library-first design

The core extraction logic lives in shared packages that can be consumed by multiple frontends (bookmarklet, Chrome extension, etc.). Extraction logic is tested and iterated on independently of delivery mechanism.

## Packages

| Package | Description |
|---------|-------------|
| `packages/schema` | TypeScript types and JSON Resume adapter |
| `packages/extractor-core` | Validation, scrolling, section discovery, parser registry |
| `packages/extractor-linkedin` | LinkedIn-specific parsers (experience, education, skills, etc.) |
| `packages/ui-overlay` | In-page overlay UI for extraction progress |
| `packages/transport-download` | Download profile as JSON file |
| `packages/transport-clipboard` | Copy profile JSON to clipboard |
| `packages/transport-webhook` | POST profile to a webhook endpoint |
| `apps/bookmarklet` | Inline bookmarklet that wires everything together |

## Dependency graph

```
schema                         (zero deps, leaf node)
  ^
extractor-core                 (depends on schema)
  ^
extractor-linkedin             (depends on extractor-core)

transport-*  -----> schema     (type definitions only)
ui-overlay                     (standalone, no cross-package deps)

bookmarklet  -----> extractor-linkedin + transport-* + ui-overlay
```

## Data flow

```
validate → expand → scroll → discover → parse → export
```

1. **Validate** — Confirm we are on a LinkedIn profile page.
2. **Expand** — Click "Show all" / "See more" buttons to reveal collapsed content.
3. **Scroll** — Scroll the page to trigger lazy-loaded sections.
4. **Discover** — Locate profile sections using `data-view-name` anchors, with `h2` heading fallback.
5. **Parse** — Route each section to its registered parser; extract structured items.
6. **Export** — Hand the result to the chosen transport (download, clipboard, webhook).

## Section discovery

Sections are located using a tiered strategy:

1. **`data-view-name` anchors** — LinkedIn decorates sections with `data-view-name="profile-card-*"` attributes. These are checked first.
2. **`h2` heading fallback** — When anchors are absent, `h2` text is matched against known labels.
3. **Warnings** — Unidentified sections emit a warning. Their raw HTML is still captured.

LinkedIn UI chrome sections (highlights, insights, pymk recommendations, promo) are filtered out during discovery.

## Parser design

Every parser takes a DOM `Element` and returns an array of typed items:

```ts
(element: Element) => T[]  // e.g., ExperienceItem[], EducationItem[]
```

Parsers use **structural DOM logic** rather than CSS classes or English-language string matching:

- `data-view-name`, `aria-label`, `role` attributes for identification
- `<figure>` siblings to detect association lines (e.g., "Associated with School")
- `/skill-associations/` links to identify endorsement metadata
- `/details/` and `/overlay/` hrefs to identify navigation chrome
- DOM depth to distinguish content layers (e.g., shallowest `<p>` = skill name in skills section)
- `<button>`, `<video>`, `[role="dialog"]`, `[aria-hidden]` removal for noise cleanup

Sections without a registered parser still preserve `raw_html` and `raw_text` as fallback.

## Bookmarklet

The bookmarklet is built as a single inline `javascript:` URL containing the entire minified runtime (~30KB). This avoids CSP issues — LinkedIn blocks `<script src>` injection but allows `javascript:` URLs.

Build: `pnpm run build` produces `apps/bookmarklet/dist/index.html` with the bookmarklet link.
