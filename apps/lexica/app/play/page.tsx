'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Check, Flame } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { GAME_GOAL, goalMet, playsOn, weekSummary } from '../lib/games/daily';
import { localDate } from '../lib/engagement/ghost';
import { todaysPicks } from '../lib/games/picks';
import { MIN_WORDS, usePool } from './usePool';
import GameIcon from '../components/brand/GameIcon';
import { GAME_COLOR, type GameId } from './theme';

/** Games built on something other than picking one of four. */
const FEATURED: { id: GameId; name: string; hint: string; tag: string }[] = [
    { id: 'run', name: 'Hành trình', hint: 'Bảy tầng, mỗi tầng chọn một trong hai cánh cửa: chiến đấu, kho báu, nghỉ chân. Tim không tự hồi', tag: 'Mới' },
    { id: 'rain', name: 'Mưa từ', hint: 'Nghĩa rơi từ trên xuống, gõ từ tiếng Anh để phá trước khi chạm đất', tag: 'Mới' },
    { id: 'boss', name: 'Trùm cuối', hint: 'Đánh bại trùm bằng cả 12 câu: đúng nhanh gây đau, đúng liền là đòn mạnh, sai mất tim', tag: 'Mới' },
    { id: 'grid', name: 'Bẫy chữ', hint: 'Tìm 5 từ giấu trong lưới chữ 4×4 từ nghĩa của chúng. Từ dài, điểm cao', tag: 'Mới' },
];

const GROUPS: { title: string; hint: string; games: { id: GameId; name: string; hint: string; tag?: string }[] }[] = [
    {
        title: 'Nhanh tay',
        hint: 'Phản xạ, ít nghĩ',
        games: [
            { id: 'blitz', name: 'Chớp', hint: '60 giây, đúng liền thì điểm nhân lên' },
            { id: 'listen', name: 'Nghe và bắt từ', hint: 'Nghe một từ, chọn đúng chữ' },
            { id: 'spell', name: 'Gõ', hint: 'Thấy nghĩa và chữ đầu, gõ cả từ' },
        ],
    },
    {
        title: 'Suy luận',
        hint: 'Đoán, bắt lỗi, nối',
        games: [
            { id: 'detective', name: 'Thám tử từ', hint: 'Đoán từ qua manh mối, ít manh mối nhiều điểm' },
            { id: 'liar', name: 'Từ nói dối', hint: 'Bốn cụm, một cụm bị tráo từ. Bắt nó' },
            { id: 'match', name: 'Ghép', hint: 'Nối sáu cặp từ và nghĩa' },
            { id: 'chain', name: 'Nối chuỗi', hint: 'Từ sau bắt đầu bằng chữ cuối từ trước, đấu với máy' },
        ],
    },
    {
        title: 'Luyện nghe',
        hint: 'Giọng tổng hợp, không thay bài thi thật',
        games: [
            { id: 'dictate', name: 'Nghe chép', hint: 'Nghe một câu, gõ lại, thấy chỗ nghe sai. Nhanh thì điểm cao', tag: 'Listening' },
            { id: 'fill', name: 'Nghe và điền', hint: 'Nghe một đoạn ngắn, điền các chỗ trống như bài note completion', tag: 'Listening' },
            { id: 'linked', name: 'Âm nối, âm rút', hint: 'Gonna, wanna, a nice day: nghe rồi chọn câu đầy đủ' },
        ],
    },
    {
        title: 'Kiểu bài thi',
        hint: 'Cho hướng Chứng chỉ',
        games: [
            { id: 'cloze', name: 'Điền đoạn', hint: 'Câu thật trong bài đọc, điền từ còn thiếu', tag: 'Reading' },
            { id: 'upgrade', name: 'Nâng cấp câu', hint: 'Chọn cách nói trang trọng nhất cho một câu', tag: 'Writing' },
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
    const branch = useLexicaStore((s) => s.path?.branch ?? null);
    const progress = useLexicaStore((s) => s.cardProgress);
    const [now] = useState(() => Date.now());
    const due = Object.values(progress).filter((p) => p.nextReviewAt <= now).length;
    const picks = todaysPicks(today, branch, due);
    const all = [...FEATURED, ...GROUPS.flatMap((g) => g.games)];

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
                    className="lx-soft relative overflow-hidden rounded-[22px] bg-surface p-5"
                >
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
                    <p data-testid="play-locked" className="lx-soft rounded-[18px] bg-surface p-4 text-sm text-ink-2">
                        Cần học ít nhất {MIN_WORDS} từ để chơi (bạn có {learned}). <Link href="/today" className="text-accent underline">Học tiếp</Link>
                    </p>
                )}

                <section aria-label="Hợp với bạn hôm nay" data-testid="game-picks">
                    <div className="mb-2.5 flex items-baseline gap-2">
                        <h2 className="font-semibold text-ink">3 game hợp với bạn hôm nay</h2>
                    </div>
                    <div className="grid gap-3 lg:grid-cols-3">
                        {picks.map(({ id, why }, i) => {
                            const g = all.find((x) => x.id === id);
                            if (!g) return null;
                            const c = GAME_COLOR[id];
                            return (
                                <Link
                                    key={id}
                                    href={ready ? `/play/${id}` : '/play'}
                                    aria-disabled={!ready}
                                    className={`lx-press relative flex items-center gap-4 overflow-hidden p-5 ${i === 0 && ready ? 'lx-hard lx-onblock rounded-[22px] lg:-rotate-1' : 'lx-soft rounded-[20px] bg-surface'} ${ready ? '' : 'pointer-events-none opacity-50'}`}
                                    style={i === 0 && ready ? { background: c } : undefined}
                                >
                                    {/* The challenge of the day is the one colour block; the others are cells with a coloured icon. */}
                                    <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${i === 0 && ready ? 'lx-soft !border-[var(--on-block)] bg-transparent' : 'lx-soft text-[var(--on-block)]'}`} style={i === 0 && ready ? undefined : { background: c }}>
                                        <GameIcon game={id} className="h-8 w-8" />
                                    </span>
                                    <span className="min-w-0">
                                        <span data-prose className="block font-mono text-[10px] font-bold uppercase tracking-wide text-muted">{why}</span>
                                        <span className="block whitespace-nowrap text-lg font-extrabold text-ink">{g.name}</span>
                                        <span data-prose className="mt-0.5 block text-sm leading-snug text-ink-2 line-clamp-2">{g.hint}</span>
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                <h2 className="pt-2 text-sm font-semibold uppercase tracking-wide text-subtle">Tất cả game</h2>

                <details className="lx-soft group/fold rounded-[18px] bg-surface p-3" aria-label="Cơ chế mới">
                    <summary className="flex cursor-pointer list-none items-baseline gap-2">
                        <h3 className="shrink-0 whitespace-nowrap font-semibold text-ink">Thử thách</h3>
                        <span className="min-w-0 truncate text-xs text-subtle">Không chỉ chọn đáp án · {FEATURED.length} game</span>
                        <ChevronDown className="ml-auto h-4 w-4 self-center text-muted transition-transform group-open/fold:rotate-180" />
                    </summary>
                    <div className="mt-3">
                    <div className="grid gap-3 lg:grid-cols-2">
                        {FEATURED.map(({ id, name, hint, tag }) => {
                            const c = GAME_COLOR[id];
                            return (
                                <Link
                                    key={id}
                                    href={ready ? `/play/${id}` : '/play'}
                                    aria-disabled={!ready}
                                    className={`lx-soft lx-press relative flex items-center gap-4 overflow-hidden rounded-[20px] bg-surface p-5 ${ready ? '' : 'pointer-events-none opacity-50'}`}
                                >
                                    <span className="lx-soft flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-[var(--on-block)]" style={{ background: c }}>
                                        <GameIcon game={id} className="h-9 w-9" />
                                    </span>
                                    <span className="min-w-0">
                                        <span className="flex items-center gap-2 whitespace-nowrap text-lg font-extrabold text-ink">
                                            {name}
                                            <span className="lx-sticker bg-surface px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-ink">
                                                {tag}
                                            </span>
                                        </span>
                                        <span className="mt-1 block text-sm leading-snug text-ink-2">{hint}</span>
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                    </div>
                </details>

                {GROUPS.map((g) => (
                    <details key={g.title} aria-label={g.title} className="lx-soft group/fold rounded-[18px] bg-surface p-3">
                        <summary className="flex cursor-pointer list-none items-baseline gap-2">
                            <h3 className="shrink-0 whitespace-nowrap font-semibold text-ink">{g.title}</h3>
                            <span className="min-w-0 truncate text-xs text-subtle">{g.hint} · {g.games.length} game</span>
                            <ChevronDown className="ml-auto h-4 w-4 self-center text-muted transition-transform group-open/fold:rotate-180" />
                        </summary>
                        <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
                            {g.games.map(({ id, name, hint, tag }, i) => {
                                const c = GAME_COLOR[id];
                                return (
                                    <motion.div key={id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                                        <Link
                                            href={ready ? `/play/${id}` : '/play'}
                                            aria-disabled={!ready}
                                            className={`lx-soft lx-press group relative flex h-full min-h-36 flex-col overflow-hidden rounded-[20px] bg-surface p-4 ${ready ? '' : 'pointer-events-none opacity-50'}`}
                                        >
                                            <span className="lx-soft flex h-11 w-11 items-center justify-center rounded-2xl text-[var(--on-block)]" style={{ background: c }}>
                                                <GameIcon game={id} className="h-7 w-7" />
                                            </span>
                                            <span className="mt-3 flex min-w-0 items-center gap-2 whitespace-nowrap text-[15px] font-extrabold text-ink">
                                                {name}
                                                {tag && (
                                                    <span className="lx-sticker bg-surface px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-ink">
                                                        {tag}
                                                    </span>
                                                )}
                                            </span>
                                            <span data-prose className="mt-1 text-xs leading-snug text-muted">{hint}</span>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </details>
                ))}
            </div>
        </div>
    );
}
