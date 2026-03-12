# Architecture Overview

## Library-First Design

The linkedin-profile-extractor is built as a reusable core extraction library. The core logic for discovering, parsing, and normalizing LinkedIn profile sections lives in shared packages that can be consumed by multiple frontends:

- **Bookmarklet** -- the primary consumer; a single-click tool that runs the extraction pipeline in the user's browser session.
- **External Chrome Extension** -- an alternative consumer that can reuse the same extraction and schema packages with its own UI and lifecycle.

This separation means extraction logic is tested and iterated on independently of delivery mechanism.

## Workspace Monorepo Layout

| Package | Description |
|---------|-------------|
| `packages/schema` | TypeScript types and Zod schemas for the normalized profile data model |
| `packages/extractor-core` | DOM traversal, section discovery, parser registry, normalization pipeline |
| `packages/extractor-linkedin` | LinkedIn-specific parsers (experience, education, skills, etc.) |
| `packages/transports` | Export adapters: JSON file download, clipboard, postMessage relay |
| `packages/ui-overlay` | Lightweight in-page overlay UI (progress, preview, download button) |
| `packages/bookmarklet` | Loader + runtime bundle that wires everything together for bookmarklet delivery |

## Data Flow

The extraction pipeline follows a fixed sequence:

```
validate --> expand --> scroll --> discover --> parse --> normalize --> export
```

1. **Validate** -- Confirm we are on a LinkedIn profile page and the DOM is in an expected state.
2. **Expand** -- Click "Show all" / "See more" buttons to reveal collapsed content.
3. **Scroll** -- Scroll the page to trigger lazy-loaded sections.
4. **Discover** -- Locate profile sections using `data-view-name` anchors, with `h2` heading fallback.
5. **Parse** -- Route each discovered section to its registered parser; extract structured items.
6. **Normalize** -- Map parsed items to the canonical schema, filling defaults and stripping noise.
7. **Export** -- Hand the normalized profile object to the chosen transport (download, clipboard, etc.).

## Package Dependency Graph

```
schema
  ^
  |
extractor-core
  ^
  |
extractor-linkedin

transports  ------>  schema
ui-overlay           (standalone, no package deps)

bookmarklet  ------> extractor-linkedin
             ------> transports
             ------> ui-overlay
```

Key constraints:

- `schema` has zero internal dependencies; it is the leaf node.
- `extractor-core` depends only on `schema`.
- `extractor-linkedin` depends on `extractor-core` (and transitively `schema`).
- `transports` depend on `schema` for type definitions but not on extraction packages.
- `ui-overlay` is standalone with no cross-package dependencies.
- `bookmarklet` is the composition root that pulls everything together.
