// content.js
(() => {
  const DEBUG = true;
  const log = (...args) => { if (DEBUG) console.log('[InAATaLC]', ...args); };

  // Regex to capture instagram username from various URL forms
  // matches examples:
  // https://www.instagram.com/username/
  // http://instagram.com/username
  // //instagram.com/username?utm=...
  const IG_REGEX = /^(?:https?:)?\/\/(?:www\.)?instagram\.com\/([^\/?#]+)(?:[\/?#].*)?$/i;

  // Keep track of usernames already sent from this page session to avoid repeating the same message many times
  const seenThisSession = new Set();

  function normalizeUsernameCandidate(raw) {
    if (!raw) return null;
    // Instagram usernames may include letters, numbers, periods and underscores.
    // Some anchor hrefs might be usernames only (like 'instagram.com/username'), so decode and trim.
    try {
      raw = decodeURIComponent(raw);
    } catch (e) { /* ignore */ }
    // Remove leading/trailing slashes/spaces
    raw = raw.trim().replace(/^\/+|\/+$/g, '');
    // If it contains a '?', remove query params
    raw = raw.split('?')[0].split('#')[0];
    // final validation
    const m = raw.match(/^([A-Za-z0-9._]+)/);
    return m ? m[1] : null;
  }

  function extractInstagramFromHref(href) {
    if (!href) return null;
    const m = href.match(IG_REGEX);
    if (!m) return null;
    return normalizeUsernameCandidate(m[1]);
  }

  function findInstagramLinks(root = document) {
    const anchors = Array.from(root.querySelectorAll('a[href]'));
    const found = new Map(); // username -> full href (first occurrence)
    for (const a of anchors) {
      const href = a.getAttribute('href');
      const username = extractInstagramFromHref(href);
      if (username) {
        // Rebuild a normalized full URL (https)
        const fullUrl = href.startsWith('http') ? href.split(/[#?]/)[0] : `https://www.instagram.com/${username}/`;
        if (!found.has(username)) found.set(username, fullUrl);
      }
    }
    return found; // Map of username -> url
  }

  // Send newly found links (not seen this session) to the background script for storage,
  // background will deduplicate against storage.
  function sendLinksToBackground(mapUsernameToUrl, sourcePage) {
    const payload = [];
    for (const [username, url] of mapUsernameToUrl.entries()) {
      if (seenThisSession.has(username)) continue;
      seenThisSession.add(username);
      payload.push({
        id: username,
        url: url,
        source: sourcePage || location.href,
        timestamp: new Date().toISOString()
      });
    }
    if (payload.length === 0) {
      log('No new IG links to send.');
      return;
    }
    log('Sending links to background:', payload);
    chrome.runtime.sendMessage({ type: 'SAVE_LINKS', data: payload });
  }

  // Initial scan on DOMContentLoaded or immediately if already loaded
  function initialScan() {
    log('Running initial scan for Instagram links...');
    const found = findInstagramLinks(document);
    sendLinksToBackground(found);
  }

  // MutationObserver callback to detect newly added anchors or subtree changes
  const mutationObserver = new MutationObserver(mutations => {
    // For performance, inspect only added nodes containing anchors
    let anyNew = false;
    const candidateRoots = new Set();
    for (const mut of mutations) {
      if (mut.addedNodes && mut.addedNodes.length) {
        for (const node of mut.addedNodes) {
          if (node.nodeType === 1) candidateRoots.add(node); // element
        }
      }
    }
    if (candidateRoots.size === 0) return;

    const aggregated = new Map();
    for (const root of candidateRoots) {
      const found = findInstagramLinks(root);
      for (const [k, v] of found.entries()) aggregated.set(k, v);
    }
    if (aggregated.size > 0) {
      sendLinksToBackground(aggregated);
    }
  });

  function startObserving() {
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    log('MutationObserver attached to document.body');
  }

  // Some single-page transitions may replace large parts of the page; rescan on pushState/popstate/hashchange.
  // Inject small page handler to trigger a custom event on history API usage is overkill here — simple listeners:
  window.addEventListener('popstate', () => { initialScan(); });
  window.addEventListener('hashchange', () => { initialScan(); });

  // Kick off
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initialScan();
    startObserving();
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      initialScan();
      startObserving();
    }, { once: true });
  }
})();