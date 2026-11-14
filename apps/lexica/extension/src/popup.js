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
        $('toggle').onclick = () => { v.sites[host] = !v.sites[host]; if (!v.sites[host]) delete v.sites[host]; chrome.storage.sync.set({ sites: v.sites }); render(); };
        $('level').oninput = (e) => { v.level = Number(e.target.value); chrome.storage.sync.set({ level: v.level }); render(); };
    });
});
