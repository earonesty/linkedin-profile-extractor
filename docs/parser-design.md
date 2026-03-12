# Parser Design

## Section Discovery Strategy

The extraction pipeline locates profile sections using a tiered strategy:

1. **`data-view-name` anchors** (preferred) -- LinkedIn decorates major sections with `data-view-name` attributes. These are the most stable identifiers available and are checked first.
2. **`h2` heading fallback** -- When `data-view-name` is absent or unrecognized, the pipeline falls back to scanning `h2` elements and matching their text content against known section labels (e.g., "Experience", "Education").
3. **Warnings** -- If a section cannot be identified by either method, a warning is emitted in the extraction result. The section's raw HTML is still captured for debugging.

## Parser Registry Pattern

Parsers are registered by section key in a central registry:

```ts
registry.register("experience", experienceParser);
registry.register("education", educationParser);
registry.register("skills", skillsParser);
```

During extraction, discovered sections are matched to their parser by key. If no parser is registered for a section, the fallback behavior applies (see below).

The registry is intentionally simple -- a `Map<string, Parser>` -- so that LinkedIn-specific parsers can be swapped or extended without touching the core pipeline.

## How Each Parser Works

Every parser conforms to the same interface:

```ts
interface Parser<T> {
  (element: Element): T[];
}
```

- **Input**: The DOM `Element` representing the section container.
- **Output**: An array of typed items (e.g., `ExperienceItem[]`, `EducationItem[]`).

Parsers are responsible for navigating the section's internal DOM structure, extracting relevant text and metadata, and returning structured objects that conform to the schema types.

## Fallback Behavior

When a section has no registered parser, or when a parser encounters unexpected DOM structure, the pipeline always preserves:

- **`raw_html`** -- The `innerHTML` of the section container.
- **`raw_text`** -- The `textContent` of the section container, trimmed and normalized.

This ensures no data is silently lost. Consumers can inspect raw fields to understand what the parser missed.

## Guidelines: Do Not Rely on CSS Class Names

LinkedIn's CSS class names are generated, obfuscated, and change frequently. Parsers must avoid selectors based on class names. Instead, prefer:

- Semantic HTML elements (`h2`, `h3`, `li`, `span`, `time`, `a`)
- `data-*` attributes
- ARIA roles and labels (`role="list"`, `aria-label`)
- DOM structure and relative position (e.g., "the first `span` inside each `li`")

If a class name is the only viable anchor, document it explicitly and mark the parser as fragile.

## How to Add a New Parser

1. **Capture a fixture** -- Save the HTML of the target section from a live LinkedIn profile (see `fixture-strategy.md`).
2. **Define the schema type** -- Add the item type to `packages/schema` (e.g., `VolunteerItem`).
3. **Write the parser function** -- In `packages/extractor-linkedin`, create a new parser that accepts an `Element` and returns an array of your new type.
4. **Register the parser** -- Add it to the parser registry with the appropriate section key.
5. **Write fixture tests** -- Load your captured fixture HTML, run the parser, and assert on the output.
6. **Handle fallback** -- Ensure the parser sets `raw_html` and `raw_text` on items when structured extraction fails partially.
