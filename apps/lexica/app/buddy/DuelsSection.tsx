'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Swords } from 'lucide-react';
import { getDeckCards, useContentVersion } from '../lib/content/repository';
import { useLexicaStore } from '../store/lexicaStore';
import { DUEL_MAX, DUEL_MIN, duelCreate, duelInbox, duelLine, duelGameQuestions, sortDuels, type DuelGame, type DuelListItem } from '../lib/duels';
import type { BuddyInfo } from '../lib/buddy';

/** Words I learned, newest first (card ids). */
function useKnownWords(): string[] {
    const journeys = useLexicaStore((s) => s.journeys);
    return Object.entries(journeys)
        .filter(([, j]) => j.understoodAt > 0)
        .sort((a, b) => b[1].understoodAt - a[1].understoodAt)
        .map(([id]) => id);
}

/**
 * Start a duel with a buddy: questions from the words I know, then straight
 * into playing them. Used by the buddy cards.
 */
export function useStartDuel() {
    const router = useRouter();
    const known = useKnownWords();
    const version = useContentVersion();
    const [busy, setBusy] = useState<string | null>(null);
    const [error, setError] = useState('');
    const start = useCallback(
        async (buddy: BuddyInfo, game: DuelGame = 'words') => {
            setError('');
            void version;
            const bank = getDeckCards();
            const qs = duelGameQuestions(game, known, bank, DUEL_MAX - 2);
            if (qs.length < DUEL_MIN) {
                setError(`Chưa đủ từ để ra đề ${game === 'words' ? '' : 'cho game này '}(cần ít nhất ${DUEL_MIN} câu). Học thêm vài từ rồi quay lại nhé.`);
                return;
            }
            setBusy(buddy.id);
            try {
                const r = await duelCreate(buddy.id, qs);
                router.push(`/buddy/duel/${r.id}`);
            } catch (e) {
                setError(e instanceof Error ? e.message : String(e));
            } finally {
                setBusy(null);
            }
        },
        [known, router, version],
    );
    return { start, busy, error, enough: known.length >= DUEL_MIN };
}

/** "Thách đấu": what waits for me, what waits for the buddy, and how past ones ended. */
export default function DuelsSection({ reloadKey, startError }: { reloadKey: number; startError: string }) {
    const [list, setList] = useState<DuelListItem[] | null>(null);
    const [error, setError] = useState('');
    const [now] = useState(() => Date.now());
    useEffect(() => {
        let live = true;
        duelInbox().then(
            (r) => live && setList(r),
            (e: unknown) => {
                if (live) {
                    setError(e instanceof Error ? e.message : String(e));
                    setList([]);
                }
            },
        );
        return () => {
            live = false;
        };
    }, [reloadKey]);

    const rows = sortDuels(list ?? []);
    return (
        <section className="rounded-2xl border border-line bg-surface p-4">
            <h2 className="flex items-center gap-2 font-semibold text-ink">
                <Swords className="w-4 h-4 text-accent" /> Thách đấu
            </h2>
            {list === null ? (
                <div className="flex justify-center py-4">
                    <Loader2 className="w-5 h-5 text-accent animate-spin" />
                </div>
            ) : rows.length === 0 ? (
                <p className="mt-2 text-sm text-muted">Chưa có ván nào. Bấm “Thách đấu” ở thẻ một người bạn: {DUEL_MIN}–{DUEL_MAX} câu từ những từ bạn đã học, bạn ấy trả lời trong 48 giờ.</p>
            ) : (
                <ul className="mt-2 divide-y divide-line">
                    {rows.map((d) => {
                        const line = duelLine(d, now);
                        return (
                            <li key={d.id} className="py-2.5">
                                <Link href={`/buddy/duel/${d.id}`} className="flex items-center justify-between gap-3">
                                    <span className="min-w-0">
                                        <span className="block text-sm font-semibold text-ink truncate">{d.with_name ?? 'Bạn học'}</span>
                                        <span className={`block text-xs ${line.tone === 'warn' ? 'text-warning' : line.tone === 'accent' ? 'text-accent' : 'text-muted'}`}>{line.text}</span>
                                    </span>
                                    <span className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold ${line.action === 'play' ? 'bg-accent text-on-accent' : 'border border-line text-ink-2'}`}>
                                        {line.action === 'play' ? 'Chơi' : line.action === 'result' ? 'Kết quả' : line.action === 'wait' ? 'Xem' : 'Mở'}
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
            {(error || startError) && <p className="mt-2 text-xs text-danger">{error || startError}</p>}
        </section>
    );
}
