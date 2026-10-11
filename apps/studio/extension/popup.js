(function () {
    'use strict';
    var X = window.LexicaExtract;
    var urlEl = document.getElementById('url');
    var text = document.getElementById('text');
    var note = document.getElementById('note');
    var send = document.getElementById('send');
    var status = document.getElementById('status');
    var page = { url: '' };

    document.getElementById('settings').onclick = function () {
        chrome.runtime.openOptionsPage();
    };

    chrome.tabs.query({ active: true, currentWindow: true }).then(function (tabs) {
        var tab = tabs[0];
        if (!tab) return;
        page.url = X.postUrl(tab.url || '') || tab.url || '';
        urlEl.textContent = page.url;
        if (!/^https?:/.test(page.url)) {
            send.disabled = true;
            urlEl.textContent = 'Trang này không gửi được.';
            return;
        }
        // Prefill with the selected text, if any (needs activeTab).
        chrome.scripting
            .executeScript({
                target: { tabId: tab.id },
                func: function () {
                    return String(window.getSelection() || '');
                },
            })
            .then(function (res) {
                var sel = res && res[0] && res[0].result;
                if (sel && !text.value) text.value = sel.trim().slice(0, 2000);
            })
            .catch(function () {});
    });

    send.onclick = function () {
        send.disabled = true;
        status.className = 'status';
        status.textContent = 'Đang gửi…';
        var payload = { url: page.url, text: text.value, note: note.value, author: X.authorFromUrl(page.url) || '' };
        chrome.runtime.sendMessage({ type: 'capture', payload: payload }).then(function (r) {
            if (r && r.ok) {
                status.className = 'status ok';
                status.textContent = 'Đã gửi vào Radar.';
                setTimeout(window.close, 900);
            } else {
                send.disabled = false;
                status.className = 'status err';
                status.textContent = (r && r.error) || 'Lỗi';
                if (r && r.needsSetup) chrome.runtime.openOptionsPage();
            }
        });
    };
})();
