'use client';

import { useEffect, useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import type { Board } from '@cortex/classroom';
import { Button, Card, ErrorNote, errorText } from '../ui';
import { api } from '../../lib/supabase';
import { localDay, reviewAssignment } from '../../lib/forecasts';
import { personalReviews, weakClassWords } from '../../lib/suggest';
import { wordIndex, type WordIndex } from '../../modules/lexica/words';

export function useWordIndex(): WordIndex | null {
    const [w, setW] = useState<WordIndex | null>(null);
    useEffect(() => {
        let live = true;
        void wordIndex().then((x) => live && setW(x));
        return () => {
            live = false;
        };
    }, []);
    return w;
}

/** "a, b, c và 4 từ khác" */
export function wordsLine(ids: readonly string[], words: WordIndex | null, n = 6): string {
    const named = ids.map((id) => words?.byId.get(id)?.word).filter(Boolean) as string[];
    return named.length > n ? `${named.slice(0, n).join(', ')} và ${named.length - n} từ khác` : named.join(', ');
}

/**
 * "Gợi ý giao bài" (T3): what the class's numbers say to give next, each one
 * tap. Shown only when there is something to suggest.
 */
export default function Suggestions({ board, onChanged }: { board: Board; onChanged: () => void }) {
    const [today] = useState(() => localDay(Date.now()));
    const words = useWordIndex();
    const weak = weakClassWords(board, today);
    const personal = personalReviews(board, today);
    const [done, setDone] = useState<Record<string, boolean>>({});
    const [busy, setBusy] = useState('');
    const [error, setError] = useState('');
    if ((weak.length < 3 || done.weak) && (personal.length === 0 || done.personal)) return null;

    const run = async (key: string, fn: () => Promise<void>) => {
        setBusy(key);
        setError('');
        try {
            await fn();
            setDone((d) => ({ ...d, [key]: true }));
            onChanged();
        } catch (e) {
            setError(errorText(e));
        } finally {
            setBusy('');
        }
    };

    return (
        <Card>
            <p className="mb-1 flex items-center gap-2 font-serif text-[21px] font-semibold text-ink">
                <Sparkles className="h-5 w-5 text-accent" /> Gợi ý giao bài
            </p>
            <p className="mb-2 text-[15px] text-muted">Từ số liệu học của lớp. Bấm một lần là giao.</p>
            <ul className="divide-y divide-line">
                {weak.length >= 3 && (
                    <li className="flex flex-wrap items-center justify-between gap-4 py-4">
                        <div className="min-w-0">
                            <p className="text-ink">
                                <b className="font-semibold">{weak.length} từ cả lớp chưa vững</b>: chưa tới nửa lớp nhớ, dù đã giao hơn một tuần.
                            </p>
                            <p lang="en" className="mt-1 text-[15px] text-ink-2">
                                {wordsLine(weak, words)}
                            </p>
                        </div>
                        {done.weak ? (
                            <span className="flex items-center gap-1.5 text-[15px] text-accent-strong">
                                <Check className="h-4 w-4" /> Đã giao
                            </span>
                        ) : (
                            <Button
                                size="sm"
                                disabled={busy !== ''}
                                onClick={() =>
                                    run('weak', async () => {
                                        const a = reviewAssignment(weak, today);
                                        await api.assign(board.class.id, { ...a, title: `Ôn lại ${weak.length} từ cả lớp chưa vững` });
                                    })
                                }
                            >
                                Giao cả lớp ôn
                            </Button>
                        )}
                    </li>
                )}
                {personal.length > 0 && (
                    <li className="flex flex-wrap items-center justify-between gap-4 py-4">
                        <div className="min-w-0">
                            <p className="text-ink">
                                <b className="font-semibold">{personal.length} em có từ của lớp sắp quên</b>: mỗi em một bài ôn riêng, đúng những từ của em.
                            </p>
                            <p className="mt-1 text-[15px] text-ink-2">{personal.map((p) => `${p.name} (${p.cardIds.length})`).join(', ')}</p>
                        </div>
                        {done.personal ? (
                            <span className="flex items-center gap-1.5 text-[15px] text-accent-strong">
                                <Check className="h-4 w-4" /> Đã giao
                            </span>
                        ) : (
                            <Button
                                size="sm"
                                disabled={busy !== ''}
                                onClick={() =>
                                    run('personal', async () => {
                                        for (const p of personal) await api.assignTo(board.class.id, p.userId, reviewAssignment(p.cardIds, today));
                                    })
                                }
                            >
                                Giao ôn riêng cho {personal.length} em
                            </Button>
                        )}
                    </li>
                )}
            </ul>
            <ErrorNote error={error} />
        </Card>
    );
}
