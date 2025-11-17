const $ = (id) => document.getElementById(id);
const STORAGE = { jwt: "jwt", apiUrl: "apiUrl" };

function toggleUI(loggedIn) {
  $("auth").style.display = loggedIn ? "none" : "block";
  $("actions").style.display = loggedIn ? "block" : "none";
  $("authMessage").textContent = "";
  $("message").textContent = "";
}

function setSelectionBadge(has, count) {
  const badge = $("badge");
  const info = $("selInfo");
  if (has) {
    badge.textContent = `Selected ✓ (${count})`;
    badge.className = "ok";
    info.textContent = "Selections cached for this page. You can add more or send.";
  } else {
    badge.textContent = "No selection";
    badge.className = "warn";
    info.textContent = "Select text on the page, then click “Save selection”.";
  }
}

async function activeTabId() {
  return new Promise((resolve) => chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => resolve(tabs?.[0]?.id || null)));
}
async function sendToTab(tabId, action) {
  return new Promise((resolve) => chrome.tabs.sendMessage(tabId, { action }, (resp) => {
    if (chrome.runtime.lastError) resolve({ ok: false, err: chrome.runtime.lastError.message });
    else resolve(resp);
  }));
}

document.addEventListener("DOMContentLoaded", async () => {
  chrome.storage.sync.get([STORAGE.jwt, STORAGE.apiUrl], async ({ jwt, apiUrl }) => {
    if (apiUrl) $("apiUrl").value = apiUrl;
    toggleUI(Boolean(jwt));
    if (jwt) {
      const tabId = await activeTabId();
      if (tabId) {
        const status = await sendToTab(tabId, "status");
        setSelectionBadge(Boolean(status?.hasSelection), status?.count || 0);
      }
    }
  });
});

$("loginBtn").addEventListener("click", async () => {
  const apiUrl = $("apiUrl").value.trim() || "http://127.0.0.1:8000";
  const username = $("username").value.trim();
  const password = $("password").value;
  $("authMessage").textContent = "🔐 Connecting…";

  try {
    const res = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ username, password })
    });
    if (!res.ok) throw new Error("Invalid credentials");
    const data = await res.json();
    if (!data.access_token) throw new Error("No token received");
    await chrome.storage.sync.set({ [STORAGE.jwt]: data.access_token, [STORAGE.apiUrl]: apiUrl });
    $("authMessage").textContent = "✅ Logged in";
    toggleUI(true);

    const tabId = await activeTabId();
    if (tabId) {
      const status = await sendToTab(tabId, "status");
      setSelectionBadge(Boolean(status?.hasSelection), status?.count || 0);
    }
  } catch (e) {
    $("authMessage").textContent = "❌ " + e.message;
  }
});

$("logoutBtn").addEventListener("click", async () => {
  await chrome.storage.sync.remove(STORAGE.jwt);
  toggleUI(false);
});

$("addBtn").addEventListener("click", async () => {
  $("message").textContent = "⏳ Reading current selection…";
  const tabId = await activeTabId();
  if (!tabId) { $("message").textContent = "❌ No active tab"; return; }

  const res = await sendToTab(tabId, "addSelection");
  if (!res?.ok) {
    $("message").textContent = "⚠️ Select some text on the page first.";
  } else {
    $("message").textContent = "✅ Selection saved for this page.";
  }

  const status = await sendToTab(tabId, "status");
  setSelectionBadge(Boolean(status?.hasSelection), status?.count || 0);
});

$("clearBtn").addEventListener("click", async () => {
  const tabId = await activeTabId();
  if (!tabId) return;
  await sendToTab(tabId, "clearSelections");
  $("message").textContent = "🧹 Selection cleared for this page.";
  setSelectionBadge(false, 0);
});

$("sendBtn").addEventListener("click", async () => {
  $("message").textContent = "⏳ Building content…";

  const tabId = await activeTabId();
  if (!tabId) { $("message").textContent = "❌ No active tab"; return; }

  const { jwt, apiUrl } = await new Promise((resolve) => chrome.storage.sync.get([STORAGE.jwt, STORAGE.apiUrl], resolve));
  const base = apiUrl || "http://127.0.0.1:8000";
  if (!jwt) { $("message").textContent = "❌ Not logged in"; toggleUI(false); return; }

  const data = await sendToTab(tabId, "getPageData");
  if (!data || !data.content || data.content.trim().length === 0) {
    $("message").textContent = "⚠️ Add at least one selection for this page.";
    setSelectionBadge(false, 0);
    return;
  }

  $("message").textContent = "📤 Sending to ReadLaterAI…";
  try {
    const res = await fetch(`${base}/posts/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`
      },
      body: JSON.stringify({ url: data.url, title: data.title, content: data.content })
    });
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    $("message").textContent = "✅ Saved!";
  } catch (e) {
    $("message").textContent = "❌ " + e.message;
  }
});
