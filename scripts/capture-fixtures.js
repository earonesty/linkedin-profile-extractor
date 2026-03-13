// Capture LinkedIn profile + all detail pages as a single JSON fixture bundle.
//
// Usage:
//   1. Navigate to a LinkedIn profile page in Chrome
//   2. Open DevTools Console (F12)
//   3. Paste this script:
//        cat scripts/capture-fixtures.js | clip.exe      (WSL)
//        cat scripts/capture-fixtures.js | xclip -sel c  (Linux)
//        cat scripts/capture-fixtures.js | pbcopy        (macOS)
//   4. Paste into Console (Ctrl+V) and press Enter
//   5. Allow popups if prompted
//   6. A single JSON file auto-downloads: fixtures-{username}.json
//   7. Unpack it:
//        node scripts/unpack-fixtures.mjs fixtures-earonesty.json

(async () => {
  var DETAIL_SECTIONS = ["experience", "education", "skills", "projects", "publications", "courses"];
  var RENDER_WAIT = 5000;
  var SCROLL_PAUSE = 500;

  var m = location.pathname.match(/^\/in\/([^/]+)/);
  if (!m) {
    console.error("[liex] Not on a LinkedIn profile page!");
    return;
  }
  var username = m[1];
  var profileBase = location.origin + "/in/" + username;

  var ol = document.createElement("div");
  ol.setAttribute("style",
    "position:fixed;top:10px;right:10px;z-index:999999;" +
    "background:#1a1a2e;color:#0f0;font-family:monospace;" +
    "font-size:13px;padding:16px;border-radius:8px;" +
    "max-width:420px;line-height:1.6"
  );
  ol.innerHTML = "<b>Fixture Capture</b><br>Profile: " + username + "<br><br>";
  document.body.appendChild(ol);

  function log(msg) {
    ol.innerHTML += msg + "<br>";
    console.log("[liex]", msg);
  }

  function sleep(ms) {
    return new Promise(function(r) { setTimeout(r, ms); });
  }

  async function waitForAccess(popup) {
    for (var i = 0; i < 50; i++) {
      try {
        if (popup.document && popup.document.body) return true;
      } catch (e) {}
      await sleep(200);
    }
    return false;
  }

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

  async function capturePopup(url, label) {
    log("Opening " + label + "...");

    var popup = window.open(url, "_blank", "width=800,height=600,left=10000,top=10000");
    if (!popup) {
      log("  BLOCKED - allow popups for linkedin.com");
      return null;
    }

    try { popup.blur(); window.focus(); } catch (e) {}

    var accessible = await waitForAccess(popup);
    if (!accessible) {
      log("  SKIP " + label + ": could not access popup");
      popup.close();
      return null;
    }

    await waitForContent(popup);
    await sleep(RENDER_WAIT);

    try {
      // Scroll to trigger lazy loading
      for (var i = 0; i < 30; i++) {
        var prev = popup.document.body.scrollHeight;
        popup.scrollTo(0, popup.document.body.scrollHeight);
        await sleep(SCROLL_PAUSE);
        if (popup.document.body.scrollHeight === prev) break;
      }
      await sleep(1000);

      var html = popup.document.documentElement.outerHTML;
      var kb = Math.round(html.length / 1024);
      log("  OK " + label + " (" + kb + " KB)");
      popup.close();
      return html;
    } catch (e) {
      log("  FAIL " + label + ": " + e.message);
      popup.close();
      return null;
    }
  }

  // Step 1: Capture the main profile page (current page, already loaded)
  log("Capturing main profile page...");
  // Scroll the main page to bottom first
  for (var i = 0; i < 30; i++) {
    var prev = document.body.scrollHeight;
    window.scrollTo(0, document.body.scrollHeight);
    await sleep(SCROLL_PAUSE);
    if (document.body.scrollHeight === prev) break;
  }
  await sleep(1000);
  window.scrollTo(0, 0);

  var bundle = {
    username: username,
    captured_at: new Date().toISOString(),
    profile_url: location.href,
    profile: document.documentElement.outerHTML,
    details: {}
  };
  var mainKb = Math.round(bundle.profile.length / 1024);
  log("  OK profile (" + mainKb + " KB)");

  // Step 2: Capture each detail page
  for (var i = 0; i < DETAIL_SECTIONS.length; i++) {
    var section = DETAIL_SECTIONS[i];
    var url = profileBase + "/details/" + section + "/";
    var html = await capturePopup(url, section);
    if (html) {
      bundle.details[section] = html;
    }
    await sleep(500);
  }

  // Step 3: Download as single JSON
  var json = JSON.stringify(bundle);
  var totalMb = (json.length / (1024 * 1024)).toFixed(1);
  var blob = new Blob([json], { type: "application/json" });
  var u = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = u;
  a.download = "fixtures-" + username + ".json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(u);

  log("");
  log("<b>Done!</b> " + totalMb + " MB total");
  log("Unpack: node scripts/unpack-fixtures.mjs ~/Downloads/fixtures-" + username + ".json");
  setTimeout(function() { ol.remove(); }, 30000);
})();
