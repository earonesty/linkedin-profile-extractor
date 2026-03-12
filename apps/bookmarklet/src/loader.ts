/**
 * Bookmarklet loader.
 *
 * This is compiled into a minimal `javascript:(function(){...})()` string.
 * It injects the hosted runtime bundle by creating a <script> tag.
 *
 * The loader is intentionally tiny and stable — it should rarely change.
 * Runtime updates are delivered by updating the hosted bundle, not by
 * requiring users to reinstall a new bookmarklet.
 */

(function () {
  const RUNTIME_URL =
    (window as unknown as Record<string, unknown>).__LIEX_RUNTIME_URL ??
    "%%RUNTIME_URL%%";

  // Prevent double-injection
  if (document.getElementById("liex-runtime")) {
    return;
  }

  const script = document.createElement("script");
  script.id = "liex-runtime";
  script.src = RUNTIME_URL as string;
  script.onerror = function () {
    alert(
      "LinkedIn Profile Extractor: Failed to load runtime bundle from " +
        RUNTIME_URL +
        "\n\nThis may be blocked by Content Security Policy."
    );
  };
  document.head.appendChild(script);
})();
