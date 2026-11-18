// Content script body (bundled after the matcher, prefs, rules and card data by build.mjs).
// Uses from lib/dial/prefs.ts: INTENSITY, hitText, ruleKey, isBlocked, onSite, pageLanguage, defaultMode, intensityFromLevel.
(() => {
    if (window.__lexicaNumVan) return;
    window.__lexicaNumVan = true;
    const host = location.hostname;
    const SKIP = 'SCRIPT,STYLE,NOSCRIPT,TEXTAREA,INPUT,SELECT,CODE,PRE,BUTTON,SVG,CANVAS';
    // N4 (#160): never on money, mail, health, government or sign-in pages, or pages with password/card fields.
    const signals = () => ({
        password: !!document.querySelector('input[type=password]'),
        card: !!document.querySelector('input[autocomplete^="cc-"],input[name*="card" i][inputmode="numeric"]'),
    });
    if (isBlocked(host, location.pathname, signals())) return;

    const VI_INDEX = compileRules(RULES);
    const EN_INDEX = compileRules(RULES_EN);
    let enabled = false, settings = { intensity: 'medium', mode: 'replace', en: false };
    let index = VI_INDEX, lang = 'vi', acc = 0, shownCount = 0, tip = null, observer = null, due = {}, known = {}, learned = 0;
    const hiddenRules = new Set();
    const DAY = 86400000;

    // The learner's words (synced from Lexica) go first; other words follow the
    // intensity, spread evenly; never more than the intensity's cap per page.
    function shouldShow(h) {
        if (known[h.cardId] || hiddenRules.has(ruleKey(h.cardId, h.vi))) return false;
        if (shownCount >= INTENSITY[settings.intensity].cap) return false;
        if (due[h.cardId] !== undefined) return true;
        acc += INTENSITY[settings.intensity].share / 100; if (acc >= 1 - 1e-9) { acc -= 1; return true; } return false;
    }
    function isDue(id) { return due[id] !== undefined && due[id] <= Date.now() + DAY; }

    function processNode(node) {
        const text = node.nodeValue;
        if (!text || text.length < 4) return;
        if (lang === 'vi' && !/[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i.test(text)) return;
        const hits = findHits(text, index).filter((h) => { const ok = shouldShow(h); if (ok) shownCount++; return ok; });
        if (!hits.length) return;
        const frag = document.createDocumentFragment();
        let last = 0;
        const src = text.normalize('NFC');
        for (const h of hits) {
            frag.append(src.slice(last, h.start));
            const orig = src.slice(h.start, h.end);
            const t = hitText(settings.mode, orig, h.en);
            const s = document.createElement('span');
            s.className = `lx-dial${t.hiddenEn ? ' lx-hl' : ''}${isDue(h.cardId) ? ' lx-due' : ''}`;
            s.textContent = t.text;
            s.dataset.vi = h.vi; s.dataset.en = h.en; s.dataset.card = h.cardId; s.dataset.orig = orig;
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

    // Queue an event for Lexica (applied next time Lexica is open, or sent by the worker with an account).
    function queue(ev) {
        chrome.storage.local.get({ pendingTaps: [] }, ({ pendingTaps }) => {
            chrome.storage.local.set({ pendingTaps: [...pendingTaps, { ...ev, at: Date.now() }].slice(-500) }, () => {
                if (ev.kind === 'tap') chrome.runtime.sendMessage({ type: 'dial-tap' }).catch?.(() => {});
            });
        });
    }

    // A tap means "not recalled"; it is queued when the tooltip closes, unless "Đã thuộc" or 👎 replaced it.
    let pendingTap = null;
    function closeTip() {
        if (pendingTap) queue({ kind: 'tap', cardId: pendingTap });
        pendingTap = null;
        tip?.remove(); tip = null;
    }
    function removeWord(cardId, key) {
        document.querySelectorAll('.lx-dial').forEach((s) => {
            if (s.dataset.card === cardId && (!key || ruleKey(s.dataset.card, s.dataset.vi) === key)) s.replaceWith(document.createTextNode(s.dataset.orig));
        });
    }

    document.addEventListener('click', (e) => {
        const s = e.target.closest?.('.lx-dial');
        if (!s) { if (!e.target.closest?.('.lx-tip')) closeTip(); return; }
        e.preventDefault(); e.stopPropagation();
        closeTip();
        const c = CARDS[s.dataset.card] || {};
        const id = s.dataset.card, key = ruleKey(id, s.dataset.vi);
        tip = document.createElement('div');
        tip.className = 'lx-tip';
        tip.innerHTML = `<div><b></b><span class="ipa"></span><button class="say" title="Nghe">🔊</button></div><div class="vi"></div><div class="hint"></div><div class="note hint"></div>
<div class="acts"><button class="known">Đã thuộc</button><span class="sp"></span><span class="hint">Thay chỗ này</span><button class="up" title="Thay hay">👍</button><button class="down" title="Thay sai chỗ">👎</button></div>`;
        tip.querySelector('b').textContent = s.dataset.en;
        tip.querySelector('.ipa').textContent = c.ipa ? `/${c.ipa}/` : '';
        tip.querySelector('.vi').textContent = `Trong bài: ${s.dataset.vi}`;
        tip.querySelector('.hint').textContent = c.hint || '';
        tip.querySelector('.note').textContent = due[id] !== undefined ? 'Lexica sẽ đưa từ này vào lượt ôn tới.' : 'Lexica sẽ thêm từ này vào bộ thẻ học.';
        pendingTap = id;
        tip.querySelector('.say').onclick = () => { const u = new SpeechSynthesisUtterance(s.dataset.en); u.lang = 'en-US'; u.rate = 0.9; speechSynthesis.speak(u); };
        tip.querySelector('.known').onclick = () => {
            pendingTap = null; known[id] = Date.now();
            queue({ kind: 'known', cardId: id });
            chrome.storage.local.get({ knownLocal: {} }, ({ knownLocal }) => chrome.storage.local.set({ knownLocal: { ...knownLocal, [id]: Date.now() } }));
            removeWord(id); closeTip();
        };
        tip.querySelector('.up').onclick = (ev) => { ev.target.classList.add('on'); queue({ kind: 'up', cardId: id, rule: key }); };
        tip.querySelector('.down').onclick = () => {
            pendingTap = null; hiddenRules.add(key);
            queue({ kind: 'down', cardId: id, rule: key });
            removeWord(id, key); closeTip();
        };
        const r = s.getBoundingClientRect();
        tip.style.left = `${Math.max(8, Math.min(r.left, innerWidth - 316)) + scrollX}px`;
        tip.style.top = `${r.bottom + scrollY + 6}px`;
        document.body.append(tip);
    }, true);

    // Pages read and words shown per day (7 days), for the popup's estimate (#161). Numbers only, on this device.
    function countPage() {
        if (!shownCount) return;
        const day = new Date().toISOString().slice(0, 10);
        chrome.storage.local.get({ pageStats: {} }, ({ pageStats }) => {
            const d = pageStats[day] ?? { pages: 0, shown: 0 };
            const next = { ...pageStats, [day]: { pages: d.pages + 1, shown: d.shown + shownCount } };
            for (const k of Object.keys(next).sort().slice(0, -7)) delete next[k];
            chrome.storage.local.set({ pageStats: next });
        });
    }

    function apply() {
        observer?.disconnect(); undo(); acc = 0; shownCount = 0;
        if (!enabled || isBlocked(host, location.pathname, signals())) return;
        lang = pageLanguage(document.body.innerText || '');
        // N7 (#165): English pages only when the learner turned it on.
        if (lang === 'en' && !settings.en) return;
        if (lang === 'other') return;
        index = lang === 'en' ? EN_INDEX : VI_INDEX;
        walk(document.body);
        countPage();
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

    const DEFAULTS = { sites: {}, level: 50, intensity: null, mode: null, en: false };
    function read(v) {
        settings = {
            intensity: v.intensity || intensityFromLevel(v.level),
            mode: v.mode || defaultMode(learned),
            en: !!v.en,
        };
        return !!v.sites[host];
    }
    chrome.storage.local.get({ lexica: null, knownLocal: {} }, ({ lexica, knownLocal }) => {
        due = lexica?.due ?? {}; known = { ...(lexica?.known ?? {}), ...knownLocal }; learned = lexica?.learned ?? Object.keys(due).length;
        chrome.storage.sync.get(DEFAULTS, (v) => { enabled = read(v); apply(); });
    });
    chrome.storage.onChanged.addListener((ch) => {
        if (ch.lexica) { const l = ch.lexica.newValue; due = l?.due ?? {}; known = { ...known, ...(l?.known ?? {}) }; learned = l?.learned ?? learned; }
        chrome.storage.sync.get(DEFAULTS, (v) => {
            const before = JSON.stringify([enabled, settings]);
            enabled = read(v);
            if (JSON.stringify([enabled, settings]) !== before) apply();
        });
    });
})();
