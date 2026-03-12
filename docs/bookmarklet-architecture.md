# Bookmarklet Architecture

## Tiny Loader vs Hosted Runtime Bundle

The bookmarklet is split into two parts:

- **Loader** -- A small, stable JavaScript snippet that the user saves as a browser bookmark. Its only job is to inject a `<script>` tag pointing to the hosted runtime bundle.
- **Runtime bundle** -- The full extraction pipeline, UI overlay, and export logic, built and hosted as a single JS file.

## Why This Split

The loader/runtime split exists for practical reasons:

- **Loader stays stable.** Users save the bookmarklet once. If the loader content changes, every user must re-save it. By keeping the loader minimal, we avoid this.
- **Runtime updates without reinstall.** Bug fixes, new parsers, and UI improvements are deployed by updating the hosted bundle. Users get changes automatically on next click.
- **Size constraints.** Bookmark URLs have practical length limits (varies by browser, roughly 2000-65000 chars). The full runtime would exceed this in many browsers.

## Build Process

The build uses **esbuild** for both artifacts:

1. **Runtime bundle** -- `esbuild` bundles all packages (`extractor-linkedin`, `transports`, `ui-overlay`) into a single IIFE file. Tree-shaking removes unused code. Output: `dist/liex-runtime.js`.
2. **Loader** -- A separate, minimal JS file is minified independently. It contains only the script injection logic and the URL of the hosted runtime. Output: `dist/liex-loader.min.js`, plus a `bookmarklet:` URL version for copy-paste.

Build command:

```bash
npm run build -w packages/bookmarklet
```

## Configuration via `window.__LIEX_CONFIG`

Before the runtime executes, the loader (or an embedding page) can set configuration on the window object:

```js
window.__LIEX_CONFIG = {
  runtimeUrl: "https://example.com/liex-runtime.js",
  exportFormat: "json",       // "json" | "clipboard"
  showOverlay: true,
  debug: false,
};
```

The runtime reads `window.__LIEX_CONFIG` at startup and merges it with defaults. This allows different deployments (self-hosted, dev, prod) to customize behavior without rebuilding.

## CSP Limitations

Many websites enforce a Content Security Policy (CSP) that blocks inline scripts or scripts loaded from unknown origins. LinkedIn's CSP may block the bookmarklet in some scenarios:

- **Inline script blocked** -- The loader itself may fail to execute if the page's CSP disallows `javascript:` URLs or inline scripts.
- **External script blocked** -- Even if the loader runs, the injected `<script>` tag for the runtime may be blocked if the hosting domain is not in the CSP `script-src` directive.

**Expected behavior when blocked:**

- The bookmarklet silently fails or the browser shows a console error referencing CSP.
- No partial extraction occurs; the pipeline does not start.
- Users encountering this should use the Chrome extension alternative, which operates outside CSP restrictions.

The loader includes a basic check: if the runtime script fails to load within a timeout, it logs a message to the console suggesting the extension as a fallback.
