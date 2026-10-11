/*
 * Adds a "+ Lexica" button next to the time of every Threads post. Click to
 * add an optional note and send; Shift+click sends right away. The post text,
 * author, link and counters are read from the page, so nothing else is
 * needed.
 */
(function () {
    'use strict';
    var X = window.LexicaExtract;
    if (!X || window.__lexicaCapture) return;
    window.__lexicaCapture = true;

    var STYLE = [
        ':host{all:initial;display:inline-flex;vertical-align:middle;margin-left:8px;position:relative;z-index:2}',
        'button{font:500 12px/1 system-ui,-apple-system,"Segoe UI",sans-serif;border-radius:999px;cursor:pointer;padding:5px 9px;border:1px solid rgba(127,127,127,.45);background:transparent;color:inherit;color:#8a8f98;transition:background .15s,color .15s,border-color .15s}',
        'button:hover{border-color:#C6F432;color:#C6F432}',
        'button.sent{background:#C6F432;border-color:#C6F432;color:#0E0F11}',
        'button.err{border-color:#FF5C5C;color:#FF5C5C}',
        '.panel{position:fixed;width:280px;padding:12px;border-radius:14px;background:#17181B;color:#F2F3F5;border:1px solid #2A2C31;box-shadow:0 12px 32px rgba(0,0,0,.45);display:flex;flex-direction:column;gap:8px;font:13px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif}',
        '.panel b{font-weight:600}',
        '.panel p{margin:0;color:#9DA1A9;font-size:12px;max-height:54px;overflow:hidden}',
        'textarea{resize:vertical;min-height:56px;border-radius:10px;border:1px solid #2A2C31;background:#0E0F11;color:#F2F3F5;padding:8px;font:inherit;outline:none}',
        'textarea:focus{border-color:#C6F432}',
        '.row{display:flex;gap:8px;justify-content:flex-end}',
        '.row button{color:#F2F3F5}',
        '.row .primary{background:#C6F432;border-color:#C6F432;color:#0E0F11}',
    ].join('');

    function postContainer(anchor) {
        var el = anchor.closest('[data-pressable-container="true"]');
        if (el) return el;
        el = anchor;
        for (var i = 0; i < 8 && el.parentElement; i++) {
            el = el.parentElement;
            if ((el.innerText || '').length > 60) return el;
        }
        return el;
    }

    function readPost(anchor, url) {
        var author = X.authorFromUrl(url);
        var cleaned = X.cleanPostText(postContainer(anchor).innerText, author);
        return { url: url, author: author, text: cleaned.text, metrics: cleaned.metrics };
    }

    function send(payload) {
        return new Promise(function (resolve) {
            try {
                chrome.runtime.sendMessage({ type: 'capture', payload: payload }, function (r) {
                    resolve(r || { ok: false, error: chrome.runtime.lastError ? chrome.runtime.lastError.message : 'Không có phản hồi' });
                });
            } catch (e) {
                // The extension was reloaded; this page still runs the old script.
                resolve({ ok: false, error: 'Tải lại trang Threads rồi thử lại' });
            }
        });
    }

    // The note panel lives in its own layer on <body>, so post styles
    // (overflow, transforms) cannot clip or move it.
    var overlay = null;
    function overlayRoot() {
        if (overlay) return overlay;
        var host = document.createElement('div');
        host.setAttribute('data-lexica-overlay', '');
        host.style.cssText = 'position:fixed;top:0;left:0;z-index:2147483647';
        ['click', 'mousedown', 'pointerdown', 'keydown', 'keyup', 'keypress', 'input'].forEach(function (t) {
            host.addEventListener(t, stop);
        });
        overlay = host.attachShadow({ mode: 'open' });
        var style = document.createElement('style');
        style.textContent = STYLE;
        overlay.append(style);
        document.body.append(host);
        return overlay;
    }

    function stop(e) {
        e.stopPropagation();
    }

    function addButton(anchor, url) {
        var host = document.createElement('span');
        host.setAttribute('data-lexica', '');
        ['click', 'mousedown', 'mouseup', 'pointerdown', 'pointerup', 'touchstart', 'keydown'].forEach(function (t) {
            host.addEventListener(t, stop);
        });
        var root = host.attachShadow({ mode: 'open' });
        var style = document.createElement('style');
        style.textContent = STYLE;
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = '+ Lexica';
        btn.title = 'Gửi vào Lexica Studio (Shift+click: gửi luôn, không ghi chú)';
        root.append(style, btn);

        var panel = null;
        function close() {
            if (panel) panel.remove();
            panel = null;
        }
        function setState(r) {
            btn.className = r.ok ? 'sent' : 'err';
            btn.textContent = r.ok ? 'Đã gửi' : 'Lỗi';
            btn.title = r.ok ? 'Đã có trong Radar của Studio' : r.error || 'Lỗi';
        }
        function submit(note) {
            var payload = readPost(anchor, url);
            payload.note = note;
            btn.textContent = 'Đang gửi…';
            close();
            send(payload).then(setState);
        }

        btn.addEventListener('click', function (e) {
            e.preventDefault();
            if (e.shiftKey) return submit('');
            if (panel) return close();
            var post = readPost(anchor, url);
            panel = document.createElement('div');
            panel.className = 'panel';
            var rect = btn.getBoundingClientRect();
            panel.style.top = Math.min(rect.bottom + 6, window.innerHeight - 220) + 'px';
            panel.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - 296)) + 'px';
            var title = document.createElement('b');
            title.textContent = 'Gửi vào Lexica Studio';
            var preview = document.createElement('p');
            preview.textContent = post.text || url;
            var note = document.createElement('textarea');
            note.placeholder = 'Ghi chú (tuỳ chọn): vì sao trend, ai hay nói…';
            note.maxLength = 500;
            var row = document.createElement('div');
            row.className = 'row';
            var cancel = document.createElement('button');
            cancel.type = 'button';
            cancel.textContent = 'Huỷ';
            cancel.onclick = close;
            var ok = document.createElement('button');
            ok.type = 'button';
            ok.className = 'primary';
            ok.textContent = 'Gửi';
            ok.onclick = function () {
                submit(note.value);
            };
            note.addEventListener('keydown', function (ev) {
                if (ev.key === 'Enter' && !ev.shiftKey) {
                    ev.preventDefault();
                    submit(note.value);
                } else if (ev.key === 'Escape') close();
            });
            row.append(cancel, ok);
            panel.append(title, preview, note, row);
            overlayRoot().append(panel);
            note.focus();
        });

        anchor.parentElement.insertBefore(host, anchor.nextSibling);
    }

    function scan() {
        var links = document.querySelectorAll('a[href*="/post/"]:not([data-lexica-seen])');
        for (var i = 0; i < links.length; i++) {
            var a = links[i];
            a.setAttribute('data-lexica-seen', '');
            // The timestamp link is the one that holds a <time>; other post
            // links (images, quotes) are skipped.
            if (!a.querySelector('time') || !a.parentElement) continue;
            var url = X.postUrl(a.getAttribute('href'), location.href);
            if (url) addButton(a, url);
        }
    }

    var queued = false;
    new MutationObserver(function () {
        if (queued) return;
        queued = true;
        requestAnimationFrame(function () {
            queued = false;
            scan();
        });
    }).observe(document.body, { childList: true, subtree: true });
    scan();
})();
