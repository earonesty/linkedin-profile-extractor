import type { LinkedInExport, WebhookConfig } from "@liex/schema";

/**
 * POSTs the profile data to a configured webhook endpoint.
 */
export async function postProfile(
  data: LinkedInExport,
  config: WebhookConfig
): Promise<{ ok: boolean; status: number; statusText: string }> {
  const payload = config.extra_payload
    ? { ...config.extra_payload, profile: data }
    : data;

  const response = await fetch(config.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...config.headers,
    },
    body: JSON.stringify(payload),
  });

  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
  };
}
