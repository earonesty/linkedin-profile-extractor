# Manual Testing Checklist

## Setup

- [ ] Open LinkedIn in a browser where you are logged in
- [ ] Navigate to a profile page (your own or a connection's)
- [ ] Have the bookmarklet installed or the runtime bundle ready to inject via devtools

## Top Card Verification

- [ ] Name is extracted correctly
- [ ] Headline is extracted correctly
- [ ] Location is extracted (if present on the profile)
- [ ] Profile photo URL is captured
- [ ] Connection/follower count text is captured
- [ ] Contact info link is present

## Section Presence Verification

- [ ] About section is found and text is extracted
- [ ] Experience section is found with correct number of items
- [ ] Education section is found with correct number of items
- [ ] Skills section is found with correct skill names
- [ ] Any additional sections (projects, certifications, publications, etc.) are discovered if present

## Expanded Content Verification

- [ ] "Show all" / "Show more" buttons in experience section are clicked automatically
- [ ] Truncated about text is expanded fully
- [ ] All skills are loaded (not just the initial visible set)
- [ ] Nested roles under a single company are captured individually

## Lazy Loading Verification

- [ ] Page is scrolled to trigger lazy-loaded sections
- [ ] Sections that appear after scrolling are discovered and parsed
- [ ] No duplicate sections in the output

## Copy / Download / Webhook Transport Verification

- [ ] "Copy JSON" button copies valid JSON to clipboard
- [ ] Pasting the clipboard content into a JSON validator succeeds
- [ ] "Download JSON" triggers a file download with .json extension
- [ ] Downloaded file contains valid JSON matching clipboard content
- [ ] Webhook transport (if configured) sends a POST request with correct payload

## Error Handling

- [ ] Running on a non-profile page (e.g., /feed/) shows an appropriate error
- [ ] Running on a /company/ page shows an appropriate error
- [ ] Running on a non-LinkedIn site shows an appropriate error
- [ ] Overlay displays error state with a clear message

## Dumping Raw Output for Debugging

If extraction results look wrong, use these steps to capture raw data:

1. Open browser devtools (F12)
2. In the Console tab, run:
   ```js
   // After extraction completes, the result is stored on the overlay element
   const overlay = document.querySelector("#liex-overlay");
   console.log(JSON.stringify(overlay?.__liexResult, null, 2));
   ```
3. Alternatively, use the "Copy JSON" button and paste into a text editor
4. Check the `warnings` array in the JSON output for clues about missing sections
5. To inspect a specific section's raw HTML:
   ```js
   const result = overlay?.__liexResult;
   const section = result?.sections?.find(s => s.id === "experience");
   console.log(section?.raw_html);
   ```
6. To see all discovered section IDs:
   ```js
   console.log(result?.sections?.map(s => s.id));
   ```
