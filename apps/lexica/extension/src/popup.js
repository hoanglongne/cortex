// Popup. Uses from prefs.js (lib/dial/prefs.ts): INTENSITY, INTENSITIES, MODE_LABEL, MODES, estimate, estimateLine, isBlocked, intensityFromLevel, defaultMode.
chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    let host = '', path = '/';
    try { const u = new URL(tab.url); host = u.hostname; path = u.pathname; } catch { /* chrome:// pages */ }
    const $ = (id) => document.getElementById(id);
    const blocked = !!host && isBlocked(host, path);
    $('host').textContent = host || 'Trang này không dùng được';
    $('blocked').hidden = !blocked;
    chrome.storage.local.get({ lexica: null, pageStats: {} }, ({ lexica, pageStats }) => {
        const learned = lexica?.learned ?? 0;
        // Last 7 days of pages read with Núm vặn on (counted on this device).
        const days = Object.values(pageStats);
        const pages = days.reduce((n, d) => n + d.pages, 0), shown = days.reduce((n, d) => n + d.shown, 0);
        const habit = days.length >= 2 && pages >= 5 ? { perDay: pages / 7, perPage: shown / pages } : null;
        chrome.storage.sync.get({ sites: {}, level: 50, intensity: null, mode: null, en: false }, (v) => {
            v.intensity = v.intensity || intensityFromLevel(v.level);
            v.mode = v.mode || defaultMode(learned);
            const seg = (el, keys, label, current, onPick) => {
                el.textContent = '';
                for (const k of keys) {
                    const b = document.createElement('button');
                    b.textContent = label(k); b.className = k === current ? 'on' : '';
                    b.onclick = () => onPick(k);
                    el.append(b);
                }
            };
            const render = () => {
                const on = !!v.sites[host];
                $('toggle').textContent = on ? 'Tắt trên trang này' : 'Bật trên trang này';
                $('toggle').className = on ? 'off' : '';
                $('toggle').disabled = !host || (blocked && !on);
                seg($('intensity'), INTENSITIES, (k) => INTENSITY[k].label, v.intensity, (k) => { v.intensity = k; chrome.storage.sync.set({ intensity: k }); render(); });
                seg($('mode'), MODES, (k) => MODE_LABEL[k], v.mode, (k) => { v.mode = k; chrome.storage.sync.set({ mode: k }); render(); });
                $('estimate').textContent = estimateLine(estimate(v.intensity, habit?.perDay ?? null, habit?.perPage ?? null));
                $('en').checked = v.en;
                const list = $('sites'); list.textContent = '';
                const names = Object.keys(v.sites).sort();
                if (!names.length) { const li = document.createElement('li'); li.textContent = 'Chưa bật trang nào.'; list.append(li); }
                for (const s of names) {
                    const li = document.createElement('li'); li.textContent = s;
                    const x = document.createElement('button'); x.textContent = '✕'; x.title = `Bỏ ${s}`;
                    x.onclick = async () => { delete v.sites[s]; await chrome.storage.sync.set({ sites: v.sites }); await chrome.permissions.remove({ origins: [`https://${s}/*`, `http://${s}/*`] }).catch(() => {}); render(); };
                    li.append(x); list.append(li);
                }
            };
            render();
            $('en').onchange = (e) => { v.en = e.target.checked; chrome.storage.sync.set({ en: v.en }); };
            $('toggle').onclick = async () => {
                const origins = [`https://${host}/*`, `http://${host}/*`];
                if (!v.sites[host]) {
                    if (blocked) return;
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
        });
    });
});

chrome.runtime.sendMessage({ type: 'dial-refresh' }).catch?.(() => {});
chrome.storage.local.get({ lexica: null, pendingTaps: [], dialToken: null }, ({ lexica, pendingTaps, dialToken }) => {
    const el = document.getElementById('sync');
    if (!lexica) { el.textContent = 'Chưa kết nối Lexica: mở lexica.cortexlearn.app một lần trên trình duyệt này (đăng nhập để dùng trên mọi máy).'; return; }
    const n = Object.keys(lexica.due).length;
    const when = new Date(lexica.syncedAt).toLocaleString('vi-VN');
    const how = dialToken ? 'theo tài khoản, mọi máy' : 'chỉ trình duyệt này';
    el.textContent = `Đã kết nối Lexica (${how}): ${n} từ của bạn, cập nhật ${when}.` + (pendingTaps.length ? ` ${pendingTaps.length} thao tác đang chờ gửi.` : '');
});
