# Known Limitations

## LinkedIn DOM changes can break parsers

Parsers rely on LinkedIn's DOM structure, which is not a stable API. LinkedIn can change their markup at any time without notice. Parsers may return incomplete or incorrect data after such changes. When this happens, capture a fresh fixture and update the affected parser.

## Only extracts visible content

The extractor reads what is present in the DOM. It does not make network requests to LinkedIn's servers. Only data visible to the logged-in user is available. With `fetchDetailPages` enabled, the extractor opens `/details/` pages in popups to get complete section data — but popups may be blocked by the browser, and some detail pages may fail to render in time.

## Lazy-loaded content requires scrolling

LinkedIn loads some sections lazily as the user scrolls. The extraction pipeline includes a scroll step, but edge cases (slow network, rate-limiting, very long profiles) may cause sections to be missed. Scroll through the profile manually before extracting if sections are missing.

## Not all sections have parsers

Unrecognized sections are captured with `raw_html` and `raw_text` but won't have structured output.

## Browser compatibility

Targets modern Chromium-based browsers (Chrome, Edge, Brave). Firefox and Safari may work but are not actively tested.
