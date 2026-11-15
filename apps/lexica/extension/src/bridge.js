// Runs on the Lexica site only (issue #141). Browser-local handshake, no server:
// 1. read the learner's review schedule from the app's saved store,
// 2. hand over words tapped in the extension so the app puts them back into review.
(() => {
    const STORE_KEY = 'lexica-storage';
    const TAPS_KEY = 'lexica-dial-taps';
    try {
        const raw = localStorage.getItem(STORE_KEY);
        const progress = raw ? JSON.parse(raw)?.state?.cardProgress : null;
        if (progress && typeof progress === 'object') {
            const due = {};
            for (const [id, p] of Object.entries(progress)) {
                if (/^v\d{3,4}$/.test(id) && typeof p?.nextReviewAt === 'number') due[id] = p.nextReviewAt;
            }
            chrome.storage.local.set({ lexica: { due, syncedAt: Date.now() } });
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
})();
