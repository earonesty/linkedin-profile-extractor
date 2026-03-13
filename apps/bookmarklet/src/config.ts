/**
 * Runtime configuration for the bookmarklet.
 *
 * Can be set before loading the runtime bundle by defining
 * window.__LIEX_CONFIG before the script loads.
 */

export type BookmarkletConfig = {
  /** URL where the hosted runtime bundle is served */
  runtimeUrl?: string;
  /** Optional webhook endpoint */
  webhookEndpoint?: string;
  /** Optional webhook headers */
  webhookHeaders?: Record<string, string>;
  /** Optional extra payload to include with webhook POST */
  webhookExtraPayload?: Record<string, unknown>;
  /** Whether to expand collapsed sections (default: true) */
  expandSections?: boolean;
  /** Whether to scroll the page to load lazy content (default: true) */
  scrollPage?: boolean;
  /** Whether to fetch /details/ pages for complete section data (default: false) */
  fetchDetailPages?: boolean;
};

declare global {
  interface Window {
    __LIEX_CONFIG?: BookmarkletConfig;
  }
}

export function getConfig(): BookmarkletConfig {
  return window.__LIEX_CONFIG ?? {};
}
