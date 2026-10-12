/* Service worker: right-click menu and the one place that talks to the API. */
importScripts('lib/extract.js');

var X = self.LexicaExtract;

chrome.runtime.onInstalled.addListener(function (details) {
    chrome.contextMenus.removeAll(function () {
        chrome.contextMenus.create({ id: 'selection', title: 'Gửi đoạn này vào Lexica Studio', contexts: ['selection'] });
        chrome.contextMenus.create({ id: 'link', title: 'Gửi link này vào Lexica Studio', contexts: ['link'] });
        chrome.contextMenus.create({ id: 'page', title: 'Gửi trang này vào Lexica Studio', contexts: ['page'] });
    });
    if (details.reason === 'install') chrome.runtime.openOptionsPage();
});

function settings() {
    return chrome.storage.local.get(['apiUrl', 'token']).then(function (s) {
        return { apiUrl: X.normalizeApiUrl(s.apiUrl), token: (s.token || '').trim() };
    });
}

function readError(res) {
    return res
        .json()
        .then(function (body) {
            var m = body && body.message;
            return Array.isArray(m) ? m.join(', ') : m || 'HTTP ' + res.status;
        })
        .catch(function () {
            return 'HTTP ' + res.status;
        });
}

/** POST /capture. Resolves { ok, id } or { ok: false, error, needsSetup }. */
function sendCapture(input) {
    return settings().then(function (s) {
        if (!s.apiUrl || !s.token) {
            return { ok: false, needsSetup: true, error: 'Chưa nhập địa chỉ API và mã gửi bài' };
        }
        return fetch(s.apiUrl + '/capture', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + s.token },
            body: JSON.stringify(X.buildPayload(input)),
        })
            .then(function (res) {
                if (res.ok) {
                    return res.json().then(function (b) {
                        return { ok: true, id: b.id };
                    });
                }
                return readError(res).then(function (error) {
                    return { ok: false, error: error, needsSetup: res.status === 401 };
                });
            })
            .catch(function (err) {
                return { ok: false, error: 'Không gọi được API: ' + err.message };
            });
    });
}

function checkToken(apiUrl, token) {
    return fetch(X.normalizeApiUrl(apiUrl) + '/capture/check', { headers: { Authorization: 'Bearer ' + token } })
        .then(function (res) {
            if (res.ok) {
                return res.json().then(function (b) {
                    return { ok: true, name: b.name };
                });
            }
            return readError(res).then(function (error) {
                return { ok: false, error: error };
            });
        })
        .catch(function (err) {
            return { ok: false, error: 'Không gọi được API: ' + err.message };
        });
}

function flash(tabId, result) {
    var opts = tabId ? { tabId: tabId } : {};
    chrome.action.setBadgeBackgroundColor(Object.assign({ color: result.ok ? '#C6F432' : '#FF5C5C' }, opts));
    chrome.action.setBadgeText(Object.assign({ text: result.ok ? 'OK' : '!' }, opts));
    chrome.action.setTitle(Object.assign({ title: result.ok ? 'Đã gửi vào Lexica Studio' : 'Lỗi: ' + result.error }, opts));
    setTimeout(function () {
        chrome.action.setBadgeText(Object.assign({ text: '' }, opts));
        chrome.action.setTitle(Object.assign({ title: 'Gửi trang này vào Lexica Studio' }, opts));
    }, 4000);
    if (result.needsSetup) chrome.runtime.openOptionsPage();
}

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    var input =
        info.menuItemId === 'selection'
            ? { text: info.selectionText, url: info.pageUrl }
            : info.menuItemId === 'link'
              ? { url: info.linkUrl }
              : { url: info.pageUrl };
    // A Threads link carries its author; other links are read by the API.
    var threads = X.postUrl(input.url || '');
    if (threads) {
        input.url = threads;
        input.author = X.authorFromUrl(threads);
    }
    sendCapture(input).then(function (r) {
        flash(tab && tab.id, r);
    });
});

chrome.runtime.onMessage.addListener(function (msg, _sender, reply) {
    if (msg && msg.type === 'capture') {
        sendCapture(msg.payload).then(reply);
        return true;
    }
    if (msg && msg.type === 'check') {
        checkToken(msg.apiUrl, msg.token).then(reply);
        return true;
    }
    return false;
});
