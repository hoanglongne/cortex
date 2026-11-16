'use client';

import { useEffect } from 'react';
import { useLexicaStore } from '../store/lexicaStore';
import { parseTaps, TAPS_EVENT, TAPS_KEY } from '../lib/dial/bridge';
import { claimDialTaps, HELLO, isHello, issueDialToken, TOKEN } from '../lib/dial/account';

/**
 * Applies words tapped in the Núm vặn extension: from this browser
 * (lib/dial/bridge.ts) and, with an account, from any device via the API
 * (lib/dial/account.ts). Also gives the extension its dial token.
 */
export default function DialTapBridge() {
    useEffect(() => {
        const applyLocal = () => {
            let raw: string | null = null;
            try { raw = localStorage.getItem(TAPS_KEY); } catch { return; }
            const taps = parseTaps(raw);
            if (raw !== null) {
                try { localStorage.removeItem(TAPS_KEY); } catch { /* private mode */ }
            }
            const { dialTap } = useLexicaStore.getState();
            for (const t of taps) dialTap(t.cardId);
        };
        const applyRemote = async () => {
            const taps = await claimDialTaps();
            const { dialTap } = useLexicaStore.getState();
            for (const t of taps) dialTap(t.cardId);
        };
        // The extension says hello on this page; give it a token for this account if it has none.
        const onMessage = async (e: MessageEvent) => {
            if (e.source !== window || e.origin !== location.origin || !isHello(e.data)) return;
            const current = (() => { try { return localStorage.getItem('cortex_user_id'); } catch { return null; } })();
            if (e.data.tokenUser && e.data.tokenUser === current) return;
            const issued = await issueDialToken();
            if (issued) window.postMessage({ type: TOKEN, token: issued.token, userId: issued.userId }, location.origin);
        };
        const onFocus = () => { applyLocal(); void applyRemote(); };

        applyLocal();
        void applyRemote();
        window.addEventListener(TAPS_EVENT, applyLocal);
        window.addEventListener('message', onMessage);
        window.addEventListener('focus', onFocus);
        // Ask a waiting extension to say hello again now that we listen.
        window.postMessage({ type: `${HELLO}-ready` }, location.origin);
        return () => {
            window.removeEventListener(TAPS_EVENT, applyLocal);
            window.removeEventListener('message', onMessage);
            window.removeEventListener('focus', onFocus);
        };
    }, []);
    return null;
}
