import type { LinkedInExport } from "./types";

/**
 * Returns a copy of the export with raw_html and raw_text stripped
 * from all sections. Useful for clean downloads/clipboard output
 * while keeping the full data available for webhooks or LLM processing.
 */
export function stripRawHtml(data: LinkedInExport): LinkedInExport {
  return {
    ...data,
    sections: data.sections.map((s) => ({
      ...s,
      raw_html: "",
      raw_text: "",
    })),
  };
}
