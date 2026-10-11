(function () {
    'use strict';
    var X = window.LexicaExtract;
    var apiUrl = document.getElementById('apiUrl');
    var token = document.getElementById('token');
    var status = document.getElementById('status');

    function show(text, ok) {
        status.textContent = text;
        status.className = 'status ' + (ok ? 'ok' : 'err');
    }

    chrome.storage.local.get(['apiUrl', 'token']).then(function (s) {
        apiUrl.value = s.apiUrl || '';
        token.value = s.token || '';
    });

    document.getElementById('form').addEventListener('submit', function (e) {
        e.preventDefault();
        var url = X.normalizeApiUrl(apiUrl.value);
        var t = token.value.trim();
        apiUrl.value = url;
        status.className = 'status';
        status.textContent = 'Đang kiểm tra…';
        chrome.storage.local
            .set({ apiUrl: url, token: t })
            .then(function () {
                return chrome.runtime.sendMessage({ type: 'check', apiUrl: url, token: t });
            })
            .then(function (r) {
                if (r && r.ok) show('Đã lưu. Mã "' + r.name + '" dùng được.', true);
                else show('Đã lưu nhưng chưa dùng được: ' + ((r && r.error) || 'không rõ lỗi'), false);
            });
    });
})();
