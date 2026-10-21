'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { useEconomy } from '../lib/engagement/economy';
import { freezeTarget, pendingClaims, readClaimed, rememberClaimed } from '../lib/engagement/claims';
import { localDate, previousDate } from '../lib/engagement/ghost';
import { buildSets, setProgress } from '../lib/engagement/collection';
import { getAllCards, getCurrentDrop, useContentVersion } from '../lib/content/repository';

/**
 * Mount once in the root layout. For signed-in users it loads the wallet,
 * spends a streak freeze when exactly one day was missed, and claims boxes
 * for the daily goal, streak milestones and completed album sets (wherever
 * the set was completed). Shows a small toast on rewards.
 */
export default function EngagementSync() {
    const status = useEconomy((s) => s.status);
    const refresh = useEconomy((s) => s.refresh);
    const claim = useEconomy((s) => s.claim);
    const spendFreeze = useEconomy((s) => s.spendFreeze);
    const dailyProgress = useLexicaStore((s) => s.dailyProgress);
    const dailyGoal = useLexicaStore((s) => s.dailyGoal);
    const progressDate = useLexicaStore((s) => s.lastLearnedWordsReset);
    const currentStreak = useLexicaStore((s) => s.currentStreak);
    const lastActivityDate = useLexicaStore((s) => s.lastActivityDate);
    const cardProgress = useLexicaStore((s) => s.cardProgress);
    const contentVersion = useContentVersion();
    const [toast, setToast] = useState<string | null>(null);
    const freezeTried = useRef(false);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    // Streak freeze: the last activity was the day before yesterday.
    useEffect(() => {
        if (status !== 'ready' || freezeTried.current) return;
        const missed = freezeTarget(lastActivityDate, localDate(), previousDate);
        if (!missed) return;
        freezeTried.current = true;
        spendFreeze(missed)
            .then((used) => {
                if (!used) return;
                useLexicaStore.setState({ lastActivityDate: missed });
                setToast('Đã dùng 1 Đóng băng để giữ chuỗi ngày');
            })
            .catch(() => undefined);
    }, [status, lastActivityDate, spendFreeze]);

    const completedSets = useMemo(() => {
        void contentVersion;
        const drop = getCurrentDrop();
        return buildSets(getAllCards(), drop ? { [drop.id]: drop.title } : {})
            .filter((set) => setProgress(set, cardProgress).complete)
            .map((set) => ({ id: set.id, label: set.label }));
    }, [contentVersion, cardProgress]);

    useEffect(() => {
        if (status !== 'ready') return;
        const todo = pendingClaims({
            today: localDate(),
            dailyProgress,
            dailyGoal,
            progressDate,
            currentStreak,
            claimed: readClaimed(),
            completedSets,
        });
        for (const c of todo) {
            rememberClaimed(`${c.kind}:${c.ref}`);
            claim(c.kind, c.ref)
                .then((r) => {
                    if (!r.claimed) return;
                    if (r.boxes > 0) setToast(`${c.label}: +${r.boxes} Hộp`);
                    else if (r.pending > 0) setToast(`${c.label}: +${r.pending} Hộp (nhận vào ngày mai)`);
                })
                .catch(() => undefined);
        }
    }, [status, dailyProgress, dailyGoal, progressDate, currentStreak, completedSets, claim]);

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 3500);
        return () => clearTimeout(t);
    }, [toast]);

    return (
        <AnimatePresence>
            {toast && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 rounded-full border border-accent/40 bg-surface px-4 py-2 text-sm text-ink shadow-lg"
                    role="status"
                >
                    <Gift className="w-4 h-4 text-accent" /> {toast}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
