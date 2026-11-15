// Content script body (bundled after the matcher, rules and card data by build.mjs).
(() => {
    if (window.__lexicaNumVan) return;
    window.__lexicaNumVan = true;
    const host = location.hostname;
    const SKIP = 'SCRIPT,STYLE,NOSCRIPT,TEXTAREA,INPUT,SELECT,CODE,PRE,BUTTON,SVG,CANVAS';
    // Never run on login, payment or mail pages.
    if (/(bank|login|signin|checkout|payment|mail\.)/i.test(host + location.pathname)) return;

    const index = compileRules(RULES);
    let enabled = false, level = 50, acc = 0, tip = null, observer = null, due = {};
    const DAY = 86400000;

    // The learner's words (synced from Lexica) always show when the dial is on;
    // other words follow the level, spread evenly.
    function shouldShow(h) {
        if (level > 0 && due[h.cardId] !== undefined) return true;
        acc += level / 100; if (acc >= 1 - 1e-9) { acc -= 1; return true; } return false;
    }
    function isDue(id) { return due[id] !== undefined && due[id] <= Date.now() + DAY; }

    function processNode(node) {
        const text = node.nodeValue;
        if (!text || text.length < 4 || !/[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i.test(text)) return;
        const hits = findHits(text, index).filter(shouldShow);
        if (!hits.length) return;
        const frag = document.createDocumentFragment();
        let last = 0;
        const src = text.normalize('NFC');
        for (const h of hits) {
            frag.append(src.slice(last, h.start));
            const s = document.createElement('span');
            s.className = isDue(h.cardId) ? 'lx-dial lx-due' : 'lx-dial';
            s.textContent = h.en;
            s.dataset.vi = h.vi; s.dataset.card = h.cardId; s.dataset.orig = h.vi;
            frag.append(s);
            last = h.end;
        }
        frag.append(src.slice(last));
        node.parentNode.replaceChild(frag, node);
    }

    function walk(root) {
        const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode(n) {
                const p = n.parentElement;
                if (!p || p.closest(SKIP) || p.closest('[contenteditable],.lx-dial,.lx-tip')) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            },
        });
        const nodes = []; let n;
        while ((n = w.nextNode())) nodes.push(n);
        nodes.forEach(processNode);
    }

    function undo() {
        document.querySelectorAll('.lx-dial').forEach((s) => s.replaceWith(document.createTextNode(s.dataset.orig)));
        document.body.normalize();
        closeTip();
    }

    function closeTip() { tip?.remove(); tip = null; }

    document.addEventListener('click', (e) => {
        const s = e.target.closest?.('.lx-dial');
        if (!s) { if (!e.target.closest?.('.lx-tip')) closeTip(); return; }
        e.preventDefault(); e.stopPropagation();
        closeTip();
        const c = CARDS[s.dataset.card] || {};
        tip = document.createElement('div');
        tip.className = 'lx-tip';
        tip.innerHTML = `<div><b></b><span class="ipa"></span><button title="Nghe">🔊</button></div><div class="vi"></div><div class="hint"></div>`;
        tip.querySelector('b').textContent = s.textContent;
        tip.querySelector('.ipa').textContent = c.ipa ? `/${c.ipa}/` : '';
        tip.querySelector('.vi').textContent = `Trong bài: ${s.dataset.vi}`;
        tip.querySelector('.hint').textContent = c.hint || '';
        // A tap means "not recalled": queue it for Lexica (applied next time Lexica is open).
        chrome.storage.local.get({ pendingTaps: [] }, ({ pendingTaps }) => {
            chrome.storage.local.set({ pendingTaps: [...pendingTaps, { cardId: s.dataset.card, at: Date.now() }].slice(-500) }, () => {
                // With an account the worker sends it to Lexica right away (any device).
                chrome.runtime.sendMessage({ type: 'dial-tap' }).catch?.(() => {});
            });
        });
        const note = document.createElement('div');
        note.className = 'hint';
        note.textContent = due[s.dataset.card] !== undefined ? 'Lexica sẽ đưa từ này vào lượt ôn tới.' : 'Lexica sẽ thêm từ này vào bộ thẻ học.';
        tip.append(note);
        tip.querySelector('button').onclick = () => { const u = new SpeechSynthesisUtterance(s.textContent); u.lang = 'en-US'; u.rate = 0.9; speechSynthesis.speak(u); };
        const r = s.getBoundingClientRect();
        tip.style.left = `${Math.max(8, r.left + scrollX)}px`;
        tip.style.top = `${r.bottom + scrollY + 6}px`;
        document.body.append(tip);
    }, true);

    function apply() {
        observer?.disconnect(); undo(); acc = 0;
        if (!enabled) return;
        walk(document.body);
        // New content on infinite feeds (Facebook, news lists).
        let t = null;
        observer = new MutationObserver((muts) => {
            clearTimeout(t);
            t = setTimeout(() => muts.forEach((m) => m.addedNodes.forEach((n) => {
                if (n.nodeType === 1 && !n.closest('.lx-tip')) walk(n);
                else if (n.nodeType === 3 && n.parentElement && !n.parentElement.closest(SKIP + ',.lx-dial')) processNode(n);
            })), 400);
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    chrome.storage.local.get({ lexica: null }, ({ lexica }) => { due = lexica?.due ?? {}; });
    chrome.storage.sync.get({ sites: {}, level: 50 }, (v) => { enabled = !!v.sites[host]; level = v.level; apply(); });
    chrome.storage.onChanged.addListener((ch) => {
        if (ch.lexica) due = ch.lexica.newValue?.due ?? {};
        chrome.storage.sync.get({ sites: {}, level: 50 }, (v) => {
            const e = !!v.sites[host];
            if (e !== enabled || v.level !== level) { enabled = e; level = v.level; apply(); }
        });
        void ch;
    });
})();
