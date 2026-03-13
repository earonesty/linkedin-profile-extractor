// Capture LinkedIn detail pages by opening each in a popup, waiting for render, and downloading the DOM.
//
// Usage:
//   1. Navigate to a LinkedIn profile page in Chrome
//   2. Open DevTools Console (F12)
//   3. Paste this script — on WSL you can pipe it to the clipboard first:
//        cat scripts/fetch-details-bookmarklet.js | clip.exe      (WSL)
//        cat scripts/fetch-details-bookmarklet.js | xclip -sel c  (Linux)
//        cat scripts/fetch-details-bookmarklet.js | pbcopy        (macOS)
//   4. Paste into Console (Ctrl+V) and press Enter
//   5. Allow popups if prompted
//   6. Files auto-download as details-{section}.xml
//   7. Move them to fixtures/profiles/:
//        mv ~/Downloads/details-*.xml fixtures/profiles/

(async () => {
  var SECTIONS = ["experience", "education", "skills", "projects", "publications", "courses"];
  var RENDER_WAIT = 5000;
  var SCROLL_PAUSE = 500;

  var m = location.pathname.match(/^\/in\/([^/]+)/);
  if (!m) {
    alert("Not on a LinkedIn profile page!");
    return;
  }
  var profileBase = location.origin + "/in/" + m[1];

  var ol = document.createElement("div");
  ol.setAttribute("style",
    "position:fixed;top:10px;right:10px;z-index:999999;" +
    "background:#1a1a2e;color:#0f0;font-family:monospace;" +
    "font-size:13px;padding:16px;border-radius:8px;" +
    "max-width:420px;line-height:1.6"
  );
  ol.innerHTML = "<b>Detail Page Capture</b><br>Profile: " + m[1] + "<br><br>";
  document.body.appendChild(ol);

  function log(msg) {
    ol.innerHTML += msg + "<br>";
    console.log("[liex]", msg);
  }

  function download(filename, content) {
    var blob = new Blob([content], { type: "text/html" });
    var u = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = u;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(u);
  }

  function sleep(ms) {
    return new Promise(function(r) { setTimeout(r, ms); });
  }

  // Wait until we can access the popup's document (same-origin ready)
  async function waitForAccess(popup) {
    for (var i = 0; i < 50; i++) {
      try {
        var x = popup.document.body;
        if (x) return true;
      } catch (e) {}
      await sleep(200);
    }
    return false;
  }

  // Wait until the popup has meaningful rendered content
  async function waitForContent(popup) {
    for (var i = 0; i < 30; i++) {
      try {
        var ps = popup.document.querySelectorAll("p");
        if (ps.length > 5) return true;
      } catch (e) {
        return false;
      }
      await sleep(200);
    }
    return true;
  }

  async function captureDetailPage(section) {
    var url = profileBase + "/details/" + section + "/";
    log("Opening " + section + "...");

    var popup = window.open(url, "_blank", "width=800,height=600,left=10000,top=10000");
    try { popup.blur(); window.focus(); } catch (e) {}
    if (!popup) {
      log("  BLOCKED - allow popups for linkedin.com");
      return;
    }

    // Wait for same-origin access
    var accessible = await waitForAccess(popup);
    if (!accessible) {
      log("  SKIP " + section + ": could not access popup");
      popup.close();
      return;
    }

    // Wait for content to render
    await waitForContent(popup);
    await sleep(RENDER_WAIT);

    try {
      // Scroll popup to bottom to trigger lazy loading
      for (var i = 0; i < 30; i++) {
        var prev = popup.document.body.scrollHeight;
        popup.scrollTo(0, popup.document.body.scrollHeight);
        await sleep(SCROLL_PAUSE);
        if (popup.document.body.scrollHeight === prev) break;
      }

      // Extra wait after scrolling
      await sleep(1000);

      // Capture rendered DOM
      var html = popup.document.documentElement.outerHTML;
      var kb = Math.round(html.length / 1024);
      download("details-" + section + ".xml", html);
      log("  OK " + section + " (" + kb + " KB)");
    } catch (e) {
      log("  FAIL " + section + ": " + e.message);
    }

    popup.close();
    await sleep(1000);
  }

  for (var i = 0; i < SECTIONS.length; i++) {
    await captureDetailPage(SECTIONS[i]);
  }

  log("");
  log("<b>Done!</b> Move downloads to fixtures/profiles/");
  setTimeout(function() { ol.remove(); }, 30000);
})();
