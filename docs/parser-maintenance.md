# Parser Maintenance Workflow

## When LinkedIn Changes Their DOM

LinkedIn regularly updates their frontend. When this happens, parsers may break -- they may return empty results, incorrect data, or throw errors. This is expected and the primary ongoing maintenance burden.

## How to Diagnose

1. **Notice the breakage.** This typically surfaces as:
   - Fixture tests still pass (they test old HTML), but live extraction produces wrong output.
   - A user reports missing or garbled data for a section.

2. **Capture a fresh fixture.** Follow the process in `fixture-strategy.md` to save the current HTML for the affected section.

3. **Compare with the existing fixture.** Diff the old and new fixtures to identify what changed in the DOM:

```bash
diff tests/fixtures/experience-single-role.html tests/fixtures/experience-single-role-2026-03.html
```

4. **Identify the parser impact.** Look at which selectors or DOM traversal patterns in the parser are affected by the change.

## How to Update Parsers

1. **Update the fixture.** Replace or add the new fixture file with current capture-date naming.

2. **Update the parser logic.** Modify the parser in `packages/extractor-linkedin` to handle the new DOM structure. Follow the guidelines in `parser-design.md`:
   - Prefer semantic elements and `data-*` attributes over class names.
   - Ensure `raw_html` and `raw_text` fallbacks remain in place.

3. **Consider backward compatibility.** If the old DOM structure might still appear (LinkedIn often rolls out changes gradually), handle both old and new structures in the parser. Add a comment noting which variant is newer.

4. **Update tests.** Ensure both old and new fixtures pass (if supporting both structures) or replace the old fixture if the old structure is confirmed gone.

## Testing Changes Against Fixtures

Run fixture tests to validate parser changes:

```bash
npm test
```

Then verify against a live page:

```bash
LIEX_TEST_PROFILE_URL="https://www.linkedin.com/in/example/" \
  npx playwright test --headed
```

Or use manual console extraction (see `manual-testing.md`) for quicker iteration.

## Maintenance Cadence

- Check parsers against live LinkedIn at least once a month.
- When a parser breaks, prioritize capturing a new fixture before fixing -- the old DOM may disappear entirely.
- Keep old fixtures around (with date suffixes) as a record of DOM evolution.
