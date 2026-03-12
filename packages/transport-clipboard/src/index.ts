import type { LinkedInExport } from "@liex/schema";

/**
 * Copies the profile data as JSON to the clipboard.
 * Returns true if successful, false otherwise.
 */
export async function copyProfile(data: LinkedInExport): Promise<boolean> {
  const json = JSON.stringify(data, null, 2);

  try {
    await navigator.clipboard.writeText(json);
    return true;
  } catch {
    // Fallback for older browsers or restricted contexts
    return fallbackCopy(json);
  }
}

function fallbackCopy(text: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    const ok = document.execCommand("copy");
    return ok;
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
}
