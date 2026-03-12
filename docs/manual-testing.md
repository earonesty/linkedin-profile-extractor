# Manual Live-Test Instructions

## Testing the Bookmarklet on Live LinkedIn

1. Build the bookmarklet:

```bash
npm run build -w packages/bookmarklet
```

2. Copy the bookmarklet URL from `dist/liex-loader.min.js` (or use the `bookmarklet:` URL output by the build).

3. Create a new bookmark in your browser and paste the URL as the bookmark address.

4. Navigate to a LinkedIn profile page (e.g., `https://www.linkedin.com/in/someone/`).

5. Click the bookmarklet.

6. The overlay should appear, showing extraction progress. When complete, the download button becomes active.

7. Download the JSON and inspect the output.

## Checklist

- [ ] Overlay appears and shows progress
- [ ] Page scrolls to load lazy content
- [ ] "Show all" / "See more" buttons are expanded
- [ ] Extraction completes without errors in the console
- [ ] JSON output contains expected sections (experience, education, skills, etc.)
- [ ] Each section has structured items (not just raw_html)
- [ ] raw_html and raw_text are present as fallback fields
- [ ] No PII from other profiles leaks into output
- [ ] Overlay dismisses cleanly after download

## Dumping Raw Section Capture for Debugging

If a parser is producing unexpected results, capture the raw section HTML:

1. Open DevTools on the LinkedIn profile page.
2. Run in the console:

```js
// After loading the runtime (click bookmarklet or inject manually)
const sections = window.__LIEX_DEBUG?.discoveredSections;
if (sections) {
  sections.forEach((s, i) => {
    console.log(`--- Section ${i}: ${s.key} ---`);
    console.log(s.element.outerHTML);
  });
}
```

3. Copy the relevant section's `outerHTML` and save it as a fixture for parser debugging.

## Running Extraction Manually from the Console

You can run the extraction pipeline directly without the bookmarklet UI:

```js
// Load the runtime script first (if not already loaded via bookmarklet)
const script = document.createElement("script");
script.src = "http://localhost:3000/liex-runtime.js"; // or your hosted URL
document.head.appendChild(script);

// Wait for it to load, then:
const result = await window.__LIEX__.extract();
console.log(JSON.stringify(result, null, 2));
```

This is useful for iterating on parser changes during development without rebuilding the bookmarklet each time. Point `script.src` at a local dev server serving the runtime bundle.
