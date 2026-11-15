chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    let host = '';
    try { host = new URL(tab.url).hostname; } catch { /* chrome:// pages */ }
    const $ = (id) => document.getElementById(id);
    $('host').textContent = host || 'Trang này không dùng được';
    chrome.storage.sync.get({ sites: {}, level: 50 }, (v) => {
        const render = () => {
            const on = !!v.sites[host];
            $('toggle').textContent = on ? 'Tắt trên trang này' : 'Bật trên trang này';
            $('toggle').className = on ? 'off' : '';
            $('level').value = v.level; $('lv').textContent = `${v.level}%`;
        };
        render();
        $('toggle').disabled = !host;
        $('toggle').onclick = async () => {
            const origins = [`https://${host}/*`, `http://${host}/*`];
            if (!v.sites[host]) {
                // Ask for this site only (needs the click, so it happens here in the popup).
                const ok = await chrome.permissions.request({ origins });
                if (!ok) return;
                v.sites[host] = true;
                await chrome.storage.sync.set({ sites: v.sites });
                // Run on the open page now; later visits use the registered script.
                await chrome.scripting.insertCSS({ target: { tabId: tab.id }, files: ['content.css'] }).catch(() => {});
                await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] }).catch(() => {});
            } else {
                delete v.sites[host];
                await chrome.storage.sync.set({ sites: v.sites });
                await chrome.permissions.remove({ origins }).catch(() => {});
            }
            render();
        };
        $('level').oninput = (e) => { v.level = Number(e.target.value); chrome.storage.sync.set({ level: v.level }); render(); };
    });
});

chrome.storage.local.get({ lexica: null, pendingTaps: [] }, ({ lexica, pendingTaps }) => {
    const el = document.getElementById('sync');
    if (!lexica) { el.textContent = 'Chưa kết nối Lexica: mở lexica.cortexlearn.app một lần trên trình duyệt này để tiện ích biết từ của bạn.'; return; }
    const n = Object.keys(lexica.due).length;
    const when = new Date(lexica.syncedAt).toLocaleString('vi-VN');
    el.textContent = `Đã kết nối Lexica: ${n} từ của bạn (cập nhật ${when}).` + (pendingTaps.length ? ` ${pendingTaps.length} từ đã chạm sẽ vào lượt ôn khi bạn mở Lexica.` : '');
});
