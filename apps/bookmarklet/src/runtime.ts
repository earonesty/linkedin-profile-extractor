/**
 * Bookmarklet runtime bundle.
 *
 * This is the hosted bundle that the bookmarklet loader injects.
 * It orchestrates the full extraction flow using the library packages.
 */

import { extractLinkedInProfile } from "@liex/extractor-linkedin";
import { createOverlay } from "@liex/ui-overlay";
import { downloadProfile } from "@liex/transport-download";
import { copyProfile } from "@liex/transport-clipboard";
import { postProfile } from "@liex/transport-webhook";
import { stripRawHtml } from "@liex/schema";
import type { LinkedInExport, WebhookConfig } from "@liex/schema";
import { getConfig } from "./config";

async function run(): Promise<void> {
  const config = getConfig();
  const overlay = createOverlay();

  let result: LinkedInExport | null = null;

  try {
    // Step 1-5: Extract
    result = await extractLinkedInProfile(document, {
      onProgress: (state) => overlay.setState(state),
      expandSections: config.expandSections ?? true,
      scrollPage: config.scrollPage ?? true,
    });

    // Step 6: Show actions
    overlay.setState("complete", `${result.sections.length} sections extracted`);

    overlay.setActions({
      onCopy: async () => {
        if (!result) return;
        const ok = await copyProfile(stripRawHtml(result));
        overlay.setState("complete", ok ? "Copied to clipboard!" : "Copy failed");
      },

      onCopyFull: async () => {
        if (!result) return;
        const ok = await copyProfile(result);
        overlay.setState("complete", ok ? "Copied (with raw HTML)!" : "Copy failed");
      },

      onDownload: () => {
        if (!result) return;
        downloadProfile(stripRawHtml(result));
        overlay.setState("complete", "Download started");
      },

      onDownloadFull: () => {
        if (!result) return;
        downloadProfile(result);
        overlay.setState("complete", "Download started (with raw HTML)");
      },

      onWebhook: config.webhookEndpoint
        ? async () => {
            if (!result) return;
            overlay.setState("exporting", "Sending to webhook…");
            try {
              const webhookConfig: WebhookConfig = {
                endpoint: config.webhookEndpoint!,
                headers: config.webhookHeaders,
                extra_payload: config.webhookExtraPayload,
              };
              const res = await postProfile(result, webhookConfig);
              overlay.setState(
                "complete",
                res.ok
                  ? `Sent! (${res.status})`
                  : `Failed: ${res.status} ${res.statusText}`
              );
            } catch (err) {
              overlay.setError(
                err instanceof Error ? err.message : "Webhook failed"
              );
            }
          }
        : undefined,
    });
  } catch (err) {
    overlay.setError(err instanceof Error ? err.message : String(err));
  }
}

// Auto-run when loaded
run();
