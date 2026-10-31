'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, CloudRain, Check, Compass, Ear, Grid3x3, Skull, FileText, Flame, Grid2x2, Keyboard, Link2, Search, ShieldQuestion, Zap, type LucideIcon } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { GAME_GOAL, goalMet, playsOn, weekSummary } from '../lib/games/daily';
import { localDate } from '../lib/engagement/ghost';
import { MIN_WORDS, usePool } from './usePool';
import { edge, GAME_COLOR, tint, type GameId } from './theme';

/** Games built on something other than picking one of four. */
const FEATURED: { id: GameId; name: string; hint: string; icon: LucideIcon; tag: string }[] = [
    { id: 'run', name: 'Hành trình', hint: 'Bảy tầng, mỗi tầng chọn một trong hai cánh cửa: chiến đấu, kho báu, nghỉ chân. Tim không tự hồi', icon: Compass, tag: 'Mới' },
    { id: 'rain', name: 'Mưa từ', hint: 'Nghĩa rơi từ trên xuống, gõ từ tiếng Anh để phá trước khi chạm đất', icon: CloudRain, tag: 'Mới' },
    { id: 'boss', name: 'Trùm cuối', hint: 'Đánh bại trùm bằng cả 12 câu: đúng nhanh gây đau, đúng liền là đòn mạnh, sai mất tim', icon: Skull, tag: 'Mới' },
    { id: 'grid', name: 'Bẫy chữ', hint: 'Tìm 5 từ giấu trong lưới chữ 4×4 từ nghĩa của chúng. Từ dài, điểm cao', icon: Grid3x3, tag: 'Mới' },
];

const GROUPS: { title: string; hint: string; games: { id: GameId; name: string; hint: string; icon: LucideIcon; tag?: string }[] }[] = [
    {
        title: 'Nhanh tay',
        hint: 'Phản xạ, ít nghĩ',
        games: [
            { id: 'blitz', name: 'Chớp', hint: '60 giây, đúng liền thì điểm nhân lên', icon: Zap },
            { id: 'listen', name: 'Nghe và bắt từ', hint: 'Nghe một từ, chọn đúng chữ', icon: Ear },
            { id: 'spell', name: 'Gõ', hint: 'Thấy nghĩa và chữ đầu, gõ cả từ', icon: Keyboard },
        ],
    },
    {
        title: 'Suy luận',
        hint: 'Đoán, bắt lỗi, nối',
        games: [
            { id: 'detective', name: 'Thám tử từ', hint: 'Đoán từ qua manh mối, ít manh mối nhiều điểm', icon: Search },
            { id: 'liar', name: 'Từ nói dối', hint: 'Bốn cụm, một cụm bị tráo từ. Bắt nó', icon: ShieldQuestion },
            { id: 'match', name: 'Ghép', hint: 'Nối sáu cặp từ và nghĩa', icon: Grid2x2 },
            { id: 'chain', name: 'Nối chuỗi', hint: 'Từ sau bắt đầu bằng chữ cuối từ trước, đấu với máy', icon: Link2 },
        ],
    },
    {
        title: 'Kiểu bài thi',
        hint: 'Cho hướng Chứng chỉ',
        games: [
            { id: 'cloze', name: 'Điền đoạn', hint: 'Câu thật trong bài đọc, điền từ còn thiếu', icon: FileText, tag: 'Reading' },
            { id: 'upgrade', name: 'Nâng cấp câu', hint: 'Chọn cách nói trang trọng nhất cho một câu', icon: ArrowUpRight, tag: 'Writing' },
        ],
    },
];

/** "Chơi": games where playing is also reviewing (docs/LEXICA_GAMES_PLAN.md). */
export default function PlayPage() {
    const { known } = usePool();
    const learned = useLexicaStore((s) => s.learnedWords.size);
    const log = useLexicaStore((s) => s.gameLog);
    const [today] = useState(() => localDate());
    const met = goalMet(log ?? {}, today);
    const week = weekSummary(log ?? {}, today);
    const ready = known.length >= MIN_WORDS;
    const plays = playsOn(log ?? {}, today);
    const pct = Math.min(100, Math.round((plays / GAME_GOAL) * 100));

    return (
        <div className="min-h-screen bg-bg px-4 py-6 lg:py-8">
            <div className="max-w-xl lg:max-w-5xl mx-auto space-y-6">
                <header>
                    <Link href="/practice" className="lg:hidden text-muted hover:text-accent text-sm">
                        ← Luyện
                    </Link>
                    <h1 className="mt-2 lg:mt-0 text-3xl font-bold tracking-tight text-ink">Chơi</h1>
                    <p className="mt-1 text-sm text-muted">Chơi cũng là ôn: từ sai quay lại phần ôn, từ đúng được tính một lần nhớ.</p>
                </header>

                {/* Today's goal */}
                <section
                    data-testid="game-goal"
                    className="relative overflow-hidden rounded-3xl border p-5"
                    style={{ background: tint('var(--color-accent)', met ? 16 : 7), borderColor: edge('var(--color-accent)', met ? 55 : 25) }}
                >
                    <span aria-hidden className="pointer-events-none absolute -right-6 -top-8 h-32 w-32 rounded-full" style={{ background: edge('var(--color-accent)', 14) }} />
                    <span aria-hidden className="pointer-events-none absolute right-10 top-16 h-10 w-10 rounded-full" style={{ background: edge('var(--color-warning)', 22) }} />
                    <div className="relative flex items-center gap-4">
                        <div className="relative h-16 w-16 shrink-0">
                            <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
                                <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--color-surface-3)" strokeWidth="4" />
                                <motion.circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--color-accent)" strokeWidth="4" strokeLinecap="round" strokeDasharray={97.4} initial={{ strokeDashoffset: 97.4 }} animate={{ strokeDashoffset: 97.4 - (97.4 * pct) / 100 }} transition={{ duration: 0.8 }} />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-accent">{met ? <Check className="h-6 w-6" /> : <Flame className="h-6 w-6" />}</span>
                        </div>
                        <div>
                            <p className="font-semibold text-ink">{met ? 'Xong mục tiêu hôm nay' : `Hôm nay chơi ${GAME_GOAL} ván`}</p>
                            <p className="text-sm text-muted">
                                {plays} ván hôm nay · tuần này {week.plays} ván{week.best ? `, cao nhất ${week.best} điểm` : ''}
                            </p>
                        </div>
                    </div>
                </section>

                {!ready && (
                    <p data-testid="play-locked" className="rounded-2xl border border-line bg-surface p-4 text-sm text-ink-2">
                        Cần học ít nhất {MIN_WORDS} từ để chơi (bạn có {learned}). <Link href="/today" className="text-accent underline">Học tiếp</Link>
                    </p>
                )}

                <section aria-label="Cơ chế mới">
                    <div className="mb-2.5 flex items-baseline gap-2">
                        <h2 className="font-semibold text-ink">Thử thách</h2>
                        <span className="text-xs text-subtle">Không chỉ chọn đáp án</span>
                    </div>
                    <div className="grid gap-3 lg:grid-cols-2">
                        {FEATURED.map(({ id, name, hint, icon: Icon, tag }) => {
                            const c = GAME_COLOR[id];
                            return (
                                <Link
                                    key={id}
                                    href={ready ? `/play/${id}` : '/play'}
                                    aria-disabled={!ready}
                                    className={`relative flex items-center gap-4 overflow-hidden rounded-3xl border p-5 transition-transform active:scale-[0.98] ${ready ? 'hover:-translate-y-0.5' : 'pointer-events-none opacity-50'}`}
                                    style={{ background: `linear-gradient(135deg, ${tint(c, 22)}, ${tint(c, 6)})`, borderColor: edge(c, 50) }}
                                >
                                    <Icon aria-hidden className="pointer-events-none absolute -bottom-6 -right-4 h-32 w-32 -rotate-12 opacity-[0.1]" style={{ color: c }} />
                                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-on-status" style={{ background: c }}>
                                        <Icon className="h-7 w-7" />
                                    </span>
                                    <span>
                                        <span className="flex items-center gap-2 text-lg font-bold text-ink">
                                            {name}
                                            <span className="rounded-md px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-on-status" style={{ background: c }}>
                                                {tag}
                                            </span>
                                        </span>
                                        <span className="mt-1 block text-sm leading-snug text-ink-2">{hint}</span>
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                {GROUPS.map((g) => (
                    <section key={g.title} aria-label={g.title}>
                        <div className="mb-2.5 flex items-baseline gap-2">
                            <h2 className="font-semibold text-ink">{g.title}</h2>
                            <span className="text-xs text-subtle">{g.hint}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                            {g.games.map(({ id, name, hint, icon: Icon, tag }, i) => {
                                const c = GAME_COLOR[id];
                                return (
                                    <motion.div key={id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                                        <Link
                                            href={ready ? `/play/${id}` : '/play'}
                                            aria-disabled={!ready}
                                            className={`group relative flex h-full min-h-36 flex-col overflow-hidden rounded-3xl border p-4 transition-transform active:scale-[0.97] ${ready ? 'hover:-translate-y-0.5' : 'pointer-events-none opacity-50'}`}
                                            style={{ background: tint(c, 13), borderColor: edge(c, 34) }}
                                        >
                                            {/* decor: a big faded icon and a dot */}
                                            <Icon aria-hidden className="pointer-events-none absolute -bottom-4 -right-3 h-24 w-24 -rotate-12 opacity-[0.09]" style={{ color: c }} />
                                            <span aria-hidden className="pointer-events-none absolute right-3 top-3 h-2 w-2 rounded-full" style={{ background: c, opacity: 0.55 }} />
                                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl text-on-status" style={{ background: c }}>
                                                <Icon className="h-5 w-5" />
                                            </span>
                                            <span className="mt-3 flex items-center gap-2 font-semibold text-ink">
                                                {name}
                                                {tag && (
                                                    <span className="rounded-md px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide" style={{ background: edge(c, 22), color: c }}>
                                                        {tag}
                                                    </span>
                                                )}
                                            </span>
                                            <span className="mt-1 text-xs leading-snug text-muted">{hint}</span>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}
