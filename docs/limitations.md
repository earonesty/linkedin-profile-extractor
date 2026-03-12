# Known Limitations

## CSP May Block Bookmarklet Injection

Some LinkedIn page configurations enforce a Content Security Policy that prevents the bookmarklet loader from injecting the runtime script. When this happens, the bookmarklet silently fails. The Chrome extension is the recommended fallback, as extensions operate outside page-level CSP.

## LinkedIn DOM Changes Can Break Parsers at Any Time

Parsers rely on LinkedIn's DOM structure, which is not a stable API. LinkedIn can change their markup at any time without notice. Parsers may return incomplete or incorrect data after such changes. See `parser-maintenance.md` for the response workflow.

## Only Extracts Visible Content from the Current Session

The extractor reads what is present in the DOM of the currently loaded page. It does not make network requests to LinkedIn's servers, does not access APIs, and does not fetch data beyond what the browser has already loaded and rendered.

## Cannot Access Private or Restricted Data

If a profile section is hidden due to privacy settings, connection level, or LinkedIn's access controls, the extractor cannot see or extract it. Only data visible to the logged-in user in their browser is available.

## Lazy-Loaded Content Requires Scrolling

LinkedIn loads some profile sections lazily as the user scrolls. The extraction pipeline includes a scroll step to trigger this loading, but there are edge cases where content may not load (slow network, LinkedIn rate-limiting, very long profiles). If sections are missing from the output, try scrolling through the entire profile manually before running the extractor.

## Some Sections May Not Have Structured Parsers Yet

Not every LinkedIn profile section has a dedicated parser. Unrecognized sections are captured with `raw_html` and `raw_text` fields but will not have structured, typed output. New parsers are added as sections are identified and prioritized.

## Browser Compatibility

The bookmarklet targets modern Chromium-based browsers (Chrome, Edge, Brave). Firefox and Safari may work but are not actively tested. The Chrome extension is Chromium-only.
