'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { arenaChannel, type ArenaPlayerView } from '@cortex/classroom';
import { arenaAnswer, arenaState } from '../lib/classes';
import { getGuestClient, guestApi } from '../lib/guestSupabase';
import { getSupabaseClient } from '../lib/supabase';

/** Slow polling under the teacher's Realtime signals, for a weak classroom wifi. */
const POLL_MS = 2500;

/**
 * A player's copy of the room (sql/classroom_arena.sql, arena_state):
 * refetched when the teacher's screen signals a change and every few
 * seconds. `answer` sends a choice and tells the projector to refetch.
 */
export function useArenaPlayer(roomId: string | null, asGuest = false) {
    // A guest uses the guest session (and its own Realtime connection), never the learner's
    const state = asGuest ? guestApi.arenaState : arenaState;
    const send = asGuest ? guestApi.arenaAnswer : arenaAnswer;
    const [view, setView] = useState<{ v: ArenaPlayerView; at: number } | null>(null);
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
                const v = await state(roomId);
                setView({ v, at: Date.now() });
                setError('');
            } while (again.current);
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            busy.current = false;
        }
    }, [roomId, state]);

    useEffect(() => {
        if (!roomId) return;
        const client = asGuest ? getGuestClient() : getSupabaseClient();
        const ch = client?.channel(arenaChannel(roomId), { config: { broadcast: { self: false } } });
        ch?.on('broadcast', { event: 'state' }, () => void refresh()).subscribe((status) => {
            // Tell the projector someone arrived (or came back)
            if (status === 'SUBSCRIBED') void ch.send({ type: 'broadcast', event: 'joined', payload: {} });
        });
        channel.current = ch ?? null;
        const first = setTimeout(() => void refresh(), 0);
        const poll = setInterval(() => void refresh(), POLL_MS);
        return () => {
            clearTimeout(first);
            clearInterval(poll);
            if (ch && client) void client.removeChannel(ch);
            channel.current = null;
        };
    }, [roomId, refresh, asGuest]);

    const answer = useCallback(
        async (idx: number, choice: number) => {
            if (!roomId) return;
            await send(roomId, idx, choice);
            void channel.current?.send({ type: 'broadcast', event: 'answered', payload: {} });
            await refresh();
        },
        [roomId, refresh, send],
    );

    return { view: view?.v ?? null, receivedAt: view?.at ?? 0, error, answer };
}
