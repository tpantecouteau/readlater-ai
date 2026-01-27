// ===============================
// ReadLaterAI - content.js
// Cache par URL dans sessionStorage
// Ajout UNIQUEMENT quand le popup le demande
// ===============================

console.log("✅ content.js loaded (per-URL sessionStorage cache)");

const SEP = "\n\n---\n\n";
function keyFor(url) { return `rl:${url}`; }

function getSelections(url) {
  try {
    console.log("🚀 getSelections:", url);
    const raw = sessionStorage.getItem(keyFor(url));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function setSelections(url, arr) {
  try { sessionStorage.setItem(keyFor(url), JSON.stringify(arr)); }
  catch (e) { console.warn("⚠️ sessionStorage set failed:", e); }
}

function clearSelections(url) {
  try { sessionStorage.removeItem(keyFor(url)); }
  catch (e) { console.warn("⚠️ sessionStorage remove failed:", e); }
}

function getCurrentSelection() {
  const sel = window.getSelection && window.getSelection();
  const text = sel ? sel.toString().trim() : "";
  console.log("🚀 getCurrentSelection:", text);
  return text;
}

function addCurrentSelectionToCache(url) {
  const text = getCurrentSelection();
  if (!text) return { ok: false, reason: "empty" };
  const arr = getSelections(url);
  if (!arr.includes(text)) {
    arr.push(text);
    setSelections(url, arr);
    console.log(`📝 Added selection for ${url} (#${arr.length}):`, text.slice(0,120), "…");
  }
  return { ok: true, count: getSelections(url).length };
}

function buildContent(url) {
  const arr = getSelections(url);
  return arr.length ? arr.join(SEP) : "";
}

// Messages depuis le popup
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  const url = window.location.href;

  if (msg?.action === "status") {
    const arr = getSelections(url);
    sendResponse({ url, title: document.title, count: arr.length, hasSelection: arr.length > 0 });
    return true;
  }

  if (msg?.action === "addSelection") {
    const res = addCurrentSelectionToCache(url);
    const arr = getSelections(url);
    if (!res.ok) {
      sendResponse({ ok: false, reason: "no_selection", count: arr.length });
    } else {
      sendResponse({ ok: true, count: arr.length });
    }
    return true;
  }

  if (msg?.action === "clearSelections") {
    clearSelections(url);
    sendResponse({ ok: true, count: 0 });
    return true;
  }

  if (msg?.action === "getPageData") {
    const content = buildContent(url);
    sendResponse({
      title: document.title,
      url,
      content,
      count: getSelections(url).length
    });
    return true;
  }

  sendResponse({ ok: false, error: "unknown_action" });
  return true;
});
