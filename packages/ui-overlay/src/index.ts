export type { OverlayState } from "@liex/schema";

const OVERLAY_ID = "liex-overlay";

const STATE_LABELS: Record<string, string> = {
  validating: "Validating profile…",
  expanding: "Expanding sections…",
  scrolling: "Scrolling profile…",
  extracting: "Extracting data…",
  normalizing: "Normalizing output…",
  "fetching detail pages": "Fetching detail pages…",
  exporting: "Exporting…",
  complete: "Complete!",
  error: "Error",
};

function getStyles(): string {
  return `
    #${OVERLAY_ID} {
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 14px;
      background: #1a1a2e;
      color: #eee;
      border-radius: 12px;
      padding: 16px 20px;
      min-width: 260px;
      max-width: 360px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      transition: opacity 0.2s;
    }
    #${OVERLAY_ID} .liex-title {
      font-weight: 600;
      font-size: 15px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    #${OVERLAY_ID} .liex-status {
      margin-bottom: 12px;
      color: #a0a0c0;
    }
    #${OVERLAY_ID} .liex-error {
      color: #ff6b6b;
    }
    #${OVERLAY_ID} .liex-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    #${OVERLAY_ID} .liex-btn {
      background: #16213e;
      color: #eee;
      border: 1px solid #333;
      border-radius: 6px;
      padding: 6px 12px;
      cursor: pointer;
      font-size: 13px;
      transition: background 0.15s;
    }
    #${OVERLAY_ID} .liex-btn:hover {
      background: #1a3a5c;
    }
    #${OVERLAY_ID} .liex-close {
      position: absolute;
      top: 8px;
      right: 12px;
      background: none;
      border: none;
      color: #888;
      cursor: pointer;
      font-size: 18px;
      line-height: 1;
    }
    #${OVERLAY_ID} .liex-spinner {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid #444;
      border-top-color: #6c63ff;
      border-radius: 50%;
      animation: liex-spin 0.6s linear infinite;
    }
    @keyframes liex-spin {
      to { transform: rotate(360deg); }
    }
  `;
}

export type OverlayActions = {
  onCopy?: () => void;
  onCopyFull?: () => void;
  onDownload?: () => void;
  onDownloadFull?: () => void;
  onWebhook?: () => void;
};

export function createOverlay(): {
  setState: (state: string, detail?: string) => void;
  setError: (message: string) => void;
  setActions: (actions: OverlayActions) => void;
  destroy: () => void;
} {
  // Remove existing overlay if present
  const existing = document.getElementById(OVERLAY_ID);
  if (existing) existing.remove();

  // Inject styles
  const style = document.createElement("style");
  style.textContent = getStyles();
  document.head.appendChild(style);

  // Create overlay
  const overlay = document.createElement("div");
  overlay.id = OVERLAY_ID;
  overlay.innerHTML = `
    <button class="liex-close" title="Close">&times;</button>
    <div class="liex-title">
      <span>LinkedIn Profile Extractor</span>
    </div>
    <div class="liex-status"></div>
    <div class="liex-actions" style="display:none"></div>
  `;
  document.body.appendChild(overlay);

  const closeBtn = overlay.querySelector(".liex-close") as HTMLElement;
  const statusEl = overlay.querySelector(".liex-status") as HTMLElement;
  const actionsEl = overlay.querySelector(".liex-actions") as HTMLElement;

  closeBtn.addEventListener("click", () => destroy());

  function setState(state: string, detail?: string) {
    const label = STATE_LABELS[state] ?? state;
    const isTerminal = state === "complete" || state === "error";
    const spinner = isTerminal ? "" : '<span class="liex-spinner"></span> ';
    statusEl.innerHTML = spinner + label + (detail ? `<br><small>${detail}</small>` : "");
    statusEl.className = state === "error" ? "liex-status liex-error" : "liex-status";
  }

  function setError(message: string) {
    setState("error", message);
  }

  function setActions(actions: OverlayActions) {
    actionsEl.innerHTML = "";
    actionsEl.style.display = "flex";

    const buttons: Array<{ label: string; handler: () => void }> = [];
    if (actions.onCopy) buttons.push({ label: "Copy JSON", handler: actions.onCopy });
    if (actions.onDownload) buttons.push({ label: "Download JSON", handler: actions.onDownload });
    if (actions.onCopyFull) buttons.push({ label: "Copy Full (+ raw HTML)", handler: actions.onCopyFull });
    if (actions.onDownloadFull) buttons.push({ label: "Download Full (+ raw HTML)", handler: actions.onDownloadFull });
    if (actions.onWebhook) buttons.push({ label: "Send to Webhook", handler: actions.onWebhook });

    for (const { label, handler } of buttons) {
      const btn = document.createElement("button");
      btn.className = "liex-btn";
      btn.textContent = label;
      btn.addEventListener("click", handler);
      actionsEl.appendChild(btn);
    }
  }

  function destroy() {
    overlay.remove();
    style.remove();
  }

  return { setState, setError, setActions, destroy };
}
