# linkedin-profile-extractor

A client-side LinkedIn profile data extractor. Runs entirely in the browser against the currently open LinkedIn profile page. No LinkedIn APIs, headless browsers, server-side scraping, or account automation.

## What this is

- A **reusable extraction library** for structured LinkedIn profile data
- A **bookmarklet app** built on that library
- Designed so a separate **Chrome extension** can consume the library as a dependency

## Quick start

```bash
npm install
npm run build
```

The bookmarklet install page will be at `apps/bookmarklet/dist/index.html`.

## Repository layout

```
packages/
  schema/                  # TypeScript types and JSON Resume adapter
  extractor-core/          # Validation, scrolling, section discovery
  extractor-linkedin/      # LinkedIn-specific parsers
  ui-overlay/              # Lightweight extraction progress overlay
  transport-download/      # Download profile as JSON file
  transport-clipboard/     # Copy profile JSON to clipboard
  transport-webhook/       # POST profile to a webhook endpoint

apps/
  bookmarklet/             # Bookmarklet loader and runtime bundle

fixtures/
  profiles/                # HTML snapshots for parser testing

tests/
  parser/                  # Unit tests against fixtures
  playwright/              # Local Playwright-assisted tests (opt-in)
  manual/                  # Manual verification checklists

scripts/                   # Build and utility scripts
docs/                      # Architecture and maintenance docs
```

## Public API

```ts
import { extractLinkedInProfile } from "@liex/extractor-linkedin";

const result = await extractLinkedInProfile(document, {
  onProgress: (state) => console.log(state),
  expandSections: true,
  scrollPage: true,
});
```

Returns a `LinkedInExport` object with structured top card data, discovered sections with parsed items, and raw HTML/text fallbacks.

## Bookmarklet

The bookmarklet uses a **tiny loader + hosted runtime bundle** pattern:

1. The loader is a small stable `javascript:` URL that users save once
2. The loader injects a hosted runtime bundle from a configurable URL
3. Runtime updates ship by updating the hosted bundle — no reinstall needed

Build with a custom runtime URL:

```bash
LIEX_RUNTIME_URL=https://your-cdn.com/liex/runtime.js npm run build -w @liex/bookmarklet
```

## Consuming as a library

The extraction packages are designed to be consumed by external projects (e.g., a Chrome extension):

```ts
import { extractLinkedInProfile } from "@liex/extractor-linkedin";
import { downloadProfile } from "@liex/transport-download";

const data = await extractLinkedInProfile(document);
downloadProfile(data);
```

## Testing

```bash
# Deterministic tests (run in CI)
npm test

# Fixture parser tests only
npm run test:fixtures

# Local Playwright tests (requires auth, opt-in)
LIEX_TEST_PROFILE_URL=https://linkedin.com/in/someone npx playwright test tests/playwright/ --headed
```

See [docs/playwright-setup.md](docs/playwright-setup.md) for Playwright configuration and [tests/manual/checklist.md](tests/manual/checklist.md) for manual verification.

## Documentation

- [Architecture overview](docs/architecture.md)
- [Parser design](docs/parser-design.md)
- [Bookmarklet architecture](docs/bookmarklet-architecture.md)
- [Fixture strategy](docs/fixture-strategy.md)
- [Playwright setup](docs/playwright-setup.md)
- [Manual testing](docs/manual-testing.md)
- [Parser maintenance](docs/parser-maintenance.md)
- [Known limitations](docs/limitations.md)
- [Legal and policy caveats](docs/legal.md)

## Known limitations

- **CSP**: Some pages may block bookmarklet script injection
- **DOM changes**: LinkedIn can change their DOM at any time, breaking parsers
- **Visible content only**: Extracts what's in your current browser session
- **No private data**: Cannot access data hidden behind access controls

See [docs/limitations.md](docs/limitations.md) for the full list.

## License

MIT
