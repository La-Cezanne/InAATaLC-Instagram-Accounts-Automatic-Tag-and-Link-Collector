// background.js (service worker)
const STORAGE_KEY = 'profiles_links';

self.addEventListener('install', () => {
  // no-op, but keeps a hook if needed
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'SAVE_LINKS') {
    const incoming = Array.isArray(msg.data) ? msg.data : [];
    if (incoming.length === 0) return;

    chrome.storage.local.get({ [STORAGE_KEY]: [] }, (res) => {
      const existing = res[STORAGE_KEY] || [];
      const existingIds = new Set(existing.map(e => e.id));
      const toAdd = [];
      for (const item of incoming) {
        if (!item || !item.id) continue;
        if (!existingIds.has(item.id)) {
          toAdd.push(item);
          existingIds.add(item.id);
        } else {
          // already stored - ignore
        }
      }
      if (toAdd.length > 0) {
        const newArray = existing.concat(toAdd);
        chrome.storage.local.set({ [STORAGE_KEY]: newArray }, () => {
          console.log('[InAATaLC] Saved links:', toAdd);
        });
      } else {
        console.log('[InAATaLC] No new links to add.');
      }
    });
  } else if (msg.type === 'GET_LINKS') {
    chrome.storage.local.get({ [STORAGE_KEY]: [] }, (res) => {
      sendResponse(res[STORAGE_KEY] || []);
    });
    return true; // async
  } else if (msg.type === 'CLEAR_LINKS') {
    chrome.storage.local.set({ [STORAGE_KEY]: [] }, () => {
      sendResponse({ ok: true });
    });
    return true;
  }
});
