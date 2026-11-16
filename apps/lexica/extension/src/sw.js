// Background worker (issue #141).
// - Registers the content script for exactly the sites that are on and granted
//   (the extension asks for access one site at a time).
// - With a dial token from Lexica: refreshes the review schedule from the API
//   and sends taps there, so they reach Lexica on any device.
const API = '__CORTEX_API_URL__';
const ID = 'num-van';
const pattern = (host) => [`https://${host}/*`, `http://${host}/*`];

async function syncScripts() {
    const { sites = {} } = await chrome.storage.sync.get({ sites: {} });
    const granted = [];
    for (const host of Object.keys(sites)) {
        if (await chrome.permissions.contains({ origins: pattern(host) })) granted.push(...pattern(host));
    }
    const existing = await chrome.scripting.getRegisteredContentScripts({ ids: [ID] });
    if (existing.length) await chrome.scripting.unregisterContentScripts({ ids: [ID] });
    if (granted.length) {
        await chrome.scripting.registerContentScripts([{ id: ID, matches: granted, js: ['content.js'], css: ['content.css'], runAt: 'document_idle', persistAcrossSessions: true }]);
    }
}

async function api(path, init = {}) {
    const { dialToken } = await chrome.storage.local.get({ dialToken: null });
    if (!dialToken || API.startsWith('__')) return null;
    const res = await fetch(`${API}${path}`, { ...init, headers: { ...(init.headers || {}), Authorization: `Bearer ${dialToken}` } });
    if (res.status === 401) { await chrome.storage.local.remove(['dialToken', 'dialUser']); return null; }
    return res.ok ? res.json() : null;
}

/** Schedule from the API (any device), and any taps still waiting locally. */
async function refresh() {
    const due = await api('/v1/lexica/dial/ext/schedule').catch(() => null);
    if (due && typeof due === 'object') await chrome.storage.local.set({ lexica: { due, syncedAt: Date.now(), via: 'account' } });
    const { pendingTaps } = await chrome.storage.local.get({ pendingTaps: [] });
    if (pendingTaps.length) {
        const ok = await api('/v1/lexica/dial/ext/taps', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taps: pendingTaps.slice(-200) }) }).catch(() => null);
        if (ok) await chrome.storage.local.set({ pendingTaps: [] });
    }
}

chrome.runtime.onInstalled.addListener(() => { void syncScripts(); void refresh(); });
chrome.runtime.onStartup.addListener(() => { void syncScripts(); void refresh(); });
chrome.storage.onChanged.addListener((ch, area) => { if (area === 'sync' && ch.sites) void syncScripts(); });
chrome.permissions.onAdded.addListener(syncScripts);
chrome.permissions.onRemoved.addListener(syncScripts);
chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === 'dial-refresh' || msg?.type === 'dial-tap') void refresh();
});
