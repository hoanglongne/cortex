// Background worker (issue #141). The extension asks for access one site at a
// time: when the learner turns Núm vặn on for a site, the popup requests that
// origin, and this worker registers the content script for exactly the sites
// that are on and granted.
const ID = 'num-van';
const pattern = (host) => [`https://${host}/*`, `http://${host}/*`];

async function sync() {
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

chrome.runtime.onInstalled.addListener(sync);
chrome.runtime.onStartup.addListener(sync);
chrome.storage.onChanged.addListener((ch, area) => { if (area === 'sync' && ch.sites) void sync(); });
chrome.permissions.onAdded.addListener(sync);
chrome.permissions.onRemoved.addListener(sync);
