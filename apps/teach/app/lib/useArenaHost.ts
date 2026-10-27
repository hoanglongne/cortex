'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { arenaChannel, type ArenaHost } from '@cortex/classroom';
import { api, getSupabase } from './supabase';

/** Slow polling under the Realtime signals, for a dropped connection. */
const POLL_MS = 3000;

/**
 * The projector's copy of a room: refetched when a student signals (joined,
 * answered) and every few seconds; refetches that pile up (a whole class
 * answering at once) collapse into one. `act` runs a host call, refetches and
 * tells the phones to refetch too.
 */
export function useArenaHost(roomId: string | null) {
    const [view, setView] = useState<{ v: ArenaHost; at: number } | null>(null);
    const [error, setError] = useState('');
    const channel = useRef<RealtimeChannel | null>(null);
    const busy = useRef(false);
    const again = useRef(false);

    const refresh = useCallback(async () => {
        if (!roomId) return;
        if (busy.current) {
            again.current = true;
            return;
        }
        busy.current = true;
        try {
            do {
                again.current = false;
                const v = await api.arenaHost(roomId);
                setView({ v, at: Date.now() });
                setError('');
            } while (again.current);
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            busy.current = false;
        }
    }, [roomId]);

    useEffect(() => {
        if (!roomId) return;
        const client = getSupabase();
        const ch = client?.channel(arenaChannel(roomId), { config: { broadcast: { self: false } } });
        ch?.on('broadcast', { event: '*' }, () => void refresh()).subscribe();
        channel.current = ch ?? null;
        const first = setTimeout(() => void refresh(), 0);
        const poll = setInterval(() => void refresh(), POLL_MS);
        return () => {
            clearTimeout(first);
            clearInterval(poll);
            if (ch && client) void client.removeChannel(ch);
            channel.current = null;
        };
    }, [roomId, refresh]);

    const act = useCallback(
        async (fn: () => Promise<unknown>) => {
            try {
                await fn();
                setError('');
            } catch (e) {
                setError(e instanceof Error ? e.message : String(e));
            }
            await refresh();
            void channel.current?.send({ type: 'broadcast', event: 'state', payload: {} });
        },
        [refresh],
    );

    return { host: view?.v ?? null, receivedAt: view?.at ?? 0, error, act, refresh };
}
