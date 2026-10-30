'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Ear, Grid2x2, Keyboard, Link2, Search, ShieldQuestion, Zap } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { GAME_GOAL, goalMet, playsOn, weekSummary } from '../lib/games/daily';
import { localDate } from '../lib/engagement/ghost';
import { MIN_WORDS, usePool } from './usePool';

export const GAME_LIST = [
    { id: 'blitz', name: 'Chớp', hint: '60 giây, càng đúng liền càng nhiều điểm', icon: Zap },
    { id: 'detective', name: 'Thám tử từ', hint: 'Đoán từ qua manh mối, ít manh mối nhiều điểm', icon: Search },
    { id: 'liar', name: 'Từ nói dối', hint: 'Bốn cụm từ, một cụm bị tráo từ. Bắt nó', icon: ShieldQuestion },
    { id: 'listen', name: 'Nghe và bắt từ', hint: 'Nghe một từ, chọn đúng chữ', icon: Ear },
    { id: 'match', name: 'Ghép', hint: 'Nối sáu cặp từ và nghĩa', icon: Grid2x2 },
    { id: 'spell', name: 'Gõ', hint: 'Thấy nghĩa và chữ đầu, gõ cả từ', icon: Keyboard },
    { id: 'chain', name: 'Nối chuỗi', hint: 'Từ sau bắt đầu bằng chữ cuối từ trước, đấu với máy', icon: Link2 },
] as const;

/** "Chơi": games where playing is also reviewing (docs/LEXICA_GAMES_PLAN.md). */
export default function PlayPage() {
    const { known } = usePool();
    const learned = useLexicaStore((s) => s.learnedWords.size);
    const log = useLexicaStore((s) => s.gameLog);
    const [today] = useState(() => localDate());
    const met = goalMet(log ?? {}, today);
    const week = weekSummary(log ?? {}, today);
    const ready = known.length >= MIN_WORDS;
    return (
        <div className="min-h-screen bg-bg px-4 py-6">
            <div className="max-w-xl mx-auto space-y-4">
                <div>
                    <Link href="/practice" className="text-muted hover:text-accent text-sm">← Luyện</Link>
                    <h1 className="mt-2 text-xl font-semibold text-ink">Chơi</h1>
                    <p className="text-sm text-muted">Chơi cũng là ôn: từ sai quay lại phần ôn, từ đúng được tính một lần nhớ.</p>
                </div>
                <div data-testid="game-goal" className={`rounded-2xl border p-4 flex items-center justify-between gap-3 ${met ? 'border-accent/50 bg-accent/5' : 'border-line bg-surface'}`}>
                    <div>
                        <p className="text-sm font-semibold text-ink">{met ? 'Xong mục tiêu hôm nay' : `Hôm nay chơi ${GAME_GOAL} ván`}</p>
                        <p className="text-xs text-muted">
                            {playsOn(log ?? {}, today)} ván hôm nay · tuần này {week.plays} ván{week.best ? `, điểm cao nhất ${week.best}` : ''}
                        </p>
                    </div>
                    <span className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm ${met ? 'bg-accent text-on-accent border-accent' : 'border-line text-subtle'}`}>{met ? '✓' : playsOn(log ?? {}, today)}</span>
                </div>
                {!ready && (
                    <p data-testid="play-locked" className="rounded-2xl border border-line bg-surface p-4 text-sm text-ink-2">
                        Cần học ít nhất {MIN_WORDS} từ để chơi (bạn có {learned}). <Link href="/today" className="text-accent underline">Học tiếp</Link>
                    </p>
                )}
                <div className="grid gap-2">
                    {GAME_LIST.map(({ id, name, hint, icon: Icon }) => (
                        <Link
                            key={id}
                            href={ready ? `/play/${id}` : '/play'}
                            aria-disabled={!ready}
                            className={`rounded-2xl border border-line bg-surface p-4 flex items-center gap-3 hover:border-line-strong ${ready ? '' : 'opacity-50 pointer-events-none'}`}
                        >
                            <span className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                                <Icon className="w-5 h-5" />
                            </span>
                            <span>
                                <span className="block font-medium text-ink">{name}</span>
                                <span className="block text-xs text-muted">{hint}</span>
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
