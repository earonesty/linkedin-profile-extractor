# Playwright Local Test Setup

These tests run against live LinkedIn pages in a real browser. They are manual and opt-in. They never run in CI.

## Prerequisites

- Node.js 20+
- Playwright installed: `npx playwright install chromium`
- A valid LinkedIn account with access to profile pages
- The `playwright.config.ts` at the project root

## Setting Up Authenticated Browser Context

Playwright needs an authenticated LinkedIn session. Two approaches:

### Option A: Persistent Browser Profile

1. Create a persistent Chromium profile directory:

```bash
mkdir -p .playwright-profile
```

2. Launch Playwright with the persistent context and log in manually:

```bash
npx playwright open --save-storage=.playwright-profile/auth.json https://www.linkedin.com
```

3. Log in to LinkedIn in the opened browser, then close it. The session cookies are saved to `auth.json`.

4. Tests will load this storage state automatically. Re-run the above command if the session expires.

> Add `.playwright-profile/` to `.gitignore`. Never commit authentication state.

### Option B: Exported Cookies

1. Use a browser extension (e.g., "EditThisCookie") to export LinkedIn cookies as JSON.
2. Save to `.playwright-profile/cookies.json`.
3. Tests load cookies via `context.addCookies()` before navigating.

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `LIEX_TEST_PROFILE_URL` | LinkedIn profile URL to test against | `https://www.linkedin.com/in/example-user/` |

Set these in a `.env` file (already in `.gitignore`) or export them in your shell.

## Running Tests

Always run with the `--headed` flag so you can observe the browser:

```bash
LIEX_TEST_PROFILE_URL="https://www.linkedin.com/in/example-user/" \
  npx playwright test --headed
```

To run a specific test file:

```bash
npx playwright test tests/playwright/extract-profile.spec.ts --headed
```

## Important Notes

- These tests are **never run in CI**. They require live credentials and network access to LinkedIn.
- Tests have a 120-second timeout (configured in `playwright.config.ts`) to allow for page loads and lazy content.
- `slowMo: 100` is enabled to reduce the chance of LinkedIn rate-limiting or detecting automation.
- If LinkedIn presents a CAPTCHA or security challenge, the test will time out. Resolve the challenge manually and re-run.
