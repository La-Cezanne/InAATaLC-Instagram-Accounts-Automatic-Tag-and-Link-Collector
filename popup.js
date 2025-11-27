// popup.js
document.addEventListener('DOMContentLoaded', () => {
  const listEl = document.getElementById('list');
  const btnRefresh = document.getElementById('refresh');
  const btnExportJSON = document.getElementById('export-json');
  const btnExportCSV = document.getElementById('export-csv');
  const btnClear = document.getElementById('clear');

  function renderList(items) {
    if (!items || items.length === 0) {
      listEl.innerHTML = '<div style="padding:8px;color:#666">No links collected yet.</div>';
      return;
    }
    const html = items.map(it => {
      const ts = new Date(it.timestamp).toLocaleString();
      return `<div class="item">
                <div><strong>${escapeHtml(it.id)}</strong> <span class="meta">(${escapeHtml(ts)})</span></div>
                <div class="url">${escapeHtml(it.url)}</div>
                <div class="meta">source: ${escapeHtml(it.source)}</div>
              </div>`;
    }).join('');
    listEl.innerHTML = html;
  }

  function escapeHtml(s) {
    if (!s) return '';
    return String(s).replace(/[&<>"'`]/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'
    })[c]);
  }

  function loadAndRender() {
    chrome.runtime.sendMessage({ type: 'GET_LINKS' }, (items) => {
      renderList(items);
    });
  }

  btnRefresh.addEventListener('click', () => loadAndRender());

  btnExportJSON.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'GET_LINKS' }, (items) => {
      if (!items || items.length === 0) { alert('No links to export'); return; }
      const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'instagram_links.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  });

  btnExportCSV.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'GET_LINKS' }, (items) => {
      if (!items || items.length === 0) { alert('No links to export'); return; }
      // fields: id, url, source, timestamp
      const header = ['id', 'url', 'source', 'timestamp'];
      const rows = items.map(it => {
        // sanitize fields: escape " double quotes (CSV) and strip newlines
        const f = [
          it.id,
          it.url,
          it.source,
          it.timestamp
        ].map(field => String(field || '').replace(/"/g, '""').replace(/[\r\n]+/g, ' '));
        return '"' + f.join('","') + '"';
      });
      const csv = ['"' + header.join('","') + '"'].concat(rows).join('\r\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'instagram_links.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  });

  btnClear.addEventListener('click', () => {
    if (!confirm('Clear all stored Instagram links?')) return;
    chrome.runtime.sendMessage({ type: 'CLEAR_LINKS' }, (res) => {
      loadAndRender();
    });
  });

  // initial load
  loadAndRender();
});
