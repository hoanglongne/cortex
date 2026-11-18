// Runs on the Lexica site only (issue #141).
// 1. Without an account: read the review schedule from the app's saved store and
//    hand over taps through localStorage (this browser only).
// 2. With an account: say hello; Lexica answers with a dial token so the
//    extension can use the API from any device.
(() => {
    const STORE_KEY = 'lexica-storage';
    const TAPS_KEY = 'lexica-dial-taps';
    try {
        const raw = localStorage.getItem(STORE_KEY);
        const state = raw ? JSON.parse(raw)?.state : null;
        const progress = state?.cardProgress;
        if (progress && typeof progress === 'object') {
            const due = {};
            for (const [id, p] of Object.entries(progress)) {
                if (/^v\d{3,4}$/.test(id) && typeof p?.nextReviewAt === 'number') due[id] = p.nextReviewAt;
            }
            // Words marked "Đã thuộc" (#163) are never swapped; the learned count picks the default display mode (#162).
            const known = {};
            for (const [id, t] of Object.entries(state.dialKnown ?? {})) if (/^v\d{3,4}$/.test(id) && typeof t === 'number') known[id] = t;
            chrome.storage.local.set({ lexica: { due, known, learned: Object.keys(due).length, syncedAt: Date.now(), via: 'page' } });
        }
    } catch { /* not signed in or storage blocked */ }

    chrome.storage.local.get({ pendingTaps: [] }, ({ pendingTaps }) => {
        if (!pendingTaps.length) return;
        try {
            const prev = JSON.parse(localStorage.getItem(TAPS_KEY) || '[]');
            localStorage.setItem(TAPS_KEY, JSON.stringify([...(Array.isArray(prev) ? prev : []), ...pendingTaps].slice(-1000)));
            window.dispatchEvent(new Event(TAPS_KEY));
            chrome.storage.local.set({ pendingTaps: [] });
        } catch { /* keep them for next time */ }
    });

    // Account link: only messages from this page, of the expected shape.
    const hello = () => chrome.storage.local.get({ dialUser: null }, ({ dialUser }) => {
        window.postMessage({ type: 'lexica-dial-hello', tokenUser: dialUser }, location.origin);
    });
    window.addEventListener('message', (e) => {
        if (e.source !== window || e.origin !== location.origin) return;
        if (e.data?.type === 'lexica-dial-hello-ready') hello();
        if (e.data?.type === 'lexica-dial-token' && typeof e.data.token === 'string' && e.data.token.startsWith('lxd_') && typeof e.data.userId === 'string') {
            chrome.storage.local.set({ dialToken: e.data.token, dialUser: e.data.userId }, () => chrome.runtime.sendMessage({ type: 'dial-refresh' }));
        }
    });
    hello();
})();
