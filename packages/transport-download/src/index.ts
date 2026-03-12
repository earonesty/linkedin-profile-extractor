import type { LinkedInExport } from "@liex/schema";

/**
 * Downloads the profile data as a JSON file.
 */
export function downloadProfile(data: LinkedInExport, filename?: string): void {
  const name = filename ?? generateFilename(data);
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();

  // Cleanup
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 100);
}

function generateFilename(data: LinkedInExport): string {
  const name = data.top_card.full_name ?? "profile";
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
  const date = new Date().toISOString().slice(0, 10);
  return `linkedin-${slug}-${date}.json`;
}
