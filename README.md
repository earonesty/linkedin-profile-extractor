# linkedin-profile-extractor

A client-side LinkedIn profile data extractor. Runs entirely in the browser against the currently open LinkedIn profile page. No LinkedIn APIs, headless browsers, server-side scraping, or account automation.

## What this is

- A **reusable extraction library** for structured LinkedIn profile data
- A **bookmarklet** built on that library
- Designed so a **Chrome extension** can consume the library as a dependency

## Quick start

```bash
pnpm install
pnpm run build
```

## Bookmarklet

The bookmarklet is built as a single inline `javascript:` URL (~30KB) containing the entire extraction runtime. No external script loading — this avoids CSP issues on LinkedIn.

```bash
pnpm run build              # builds everything
pnpm run dev                # serves bookmarklet locally for testing
```

Copy the bookmarklet URL from `apps/bookmarklet/dist/index.html`, save it as a browser bookmark, then click it on any LinkedIn profile page.

## Consuming as a library

```ts
import { extractLinkedInProfile } from "@liex/extractor-linkedin";
import { downloadProfile } from "@liex/transport-download";

const data = await extractLinkedInProfile(document, {
  expandSections: true,
  scrollPage: true,
  includeRawHtml: false,
});
downloadProfile(data);
```

## Output format

The extractor returns a `LinkedInExport` object:

```jsonc
{
  "source": {
    "platform": "linkedin",
    "profile_url": "https://www.linkedin.com/in/someone/",
    "captured_at": "2026-03-13T06:37:15.255Z"
  },
  "top_card": {
    "full_name": "...",
    "headline": "...",
    "org_school_line": "Company · University",
    "location": "City, State, Country",
    "contact_info_link": "https://...",
    "connections_text": "500+ connections",
    "profile_image_url": "https://...",
    "cover_image_url": "https://..."
  },
  "sections": [
    {
      "id": "experience",          // section identifier
      "heading": "Experience",     // visible heading text
      "raw_html": "",              // full HTML (when includeRawHtml: true)
      "raw_text": "",              // full text (when includeRawHtml: true)
      "items": [                   // parsed structured data
        {
          "title": "Software Engineer",
          "company": "Acme Corp",
          "date_range_raw": "Jan 2020 - Present · 6 yrs 3 mos",
          "location": "San Francisco, CA",
          "description": "Built things..."
        }
      ]
    }
    // ... more sections
  ],
  "warnings": []
}
```

### Section types and their item shapes

| Section ID | Item fields |
|---|---|
| `about` | `about_text` |
| `experience` | `title`, `company`, `date_range_raw`, `location`, `description` |
| `education` | `school`, `degree`, `field_of_study`, `date_range_raw`, `description` |
| `skills` | flat `string[]` of skill names |
| `projects` | `name`, `description`, `date_range_raw`, `url` |
| `licenses-and-certifications` | `name`, `issuer`, `issue_date`, `expiration_date`, `credential_id`, `credential_url` |
| `publications` | `title`, `publisher`, `published_date`, `description`, `url` |
| `recommendations` | `author`, `text`, `relationship` |
| `courses` | `name`, `number` |
| `services` | `services_text`, `service_types[]` |

All fields are `string | null` unless noted. Sections without a registered parser still capture `raw_html` and `raw_text`.

A JSON Resume adapter is also available:

```ts
import { toJsonResume } from "@liex/schema";
const resume = toJsonResume(data);
```

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
  bookmarklet/             # Inline bookmarklet (javascript: URL)

fixtures/
  profiles/                # HTML/XML snapshots for parser testing

tests/
  parser/                  # Unit tests against fixtures
```

## Testing

```bash
pnpm test                  # all tests
pnpm vitest run            # parser tests only
```

Playwright tests (opt-in, requires LinkedIn auth):

```bash
LIEX_TEST_PROFILE_URL="https://linkedin.com/in/someone" npx playwright test --headed
```

## Documentation

- [Architecture](docs/architecture.md)
- [Known limitations](docs/limitations.md)
- [Legal and policy caveats](docs/legal.md)

## License

MIT
