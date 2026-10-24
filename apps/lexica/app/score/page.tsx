'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { BadgeCheck, Copy, Gauge, Loader2, Share2 } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { levelDef } from '../lib/levels';
import { ieltsRange, retake, vocabSize, type Placement } from '../lib/placement/engine';
import { drawShareCard, shareCanvas } from '../lib/placement/shareCard';

/** The brand look of a shared score, the same in light and dark mode. */
const SHARE_THEME = { bg: '#0E0F11', ink: '#EDEEF0', muted: '#9A9DA3', accent: '#C6F432', line: '#34373D' };

/**
 * "Điểm từ vựng": the last score, how it moved test after test, when the
 * next test counts, and the score as an image to share
 * (docs/LEXICA_LEVEL_TEST_DESIGN.md, PR B).
 */
export default function ScorePage() {
    const placements = useLexicaStore((s) => s.placements);
    const progress = useLexicaStore((s) => s.cardProgress);
    const startTest = useLexicaStore((s) => s.startTest);
    const [now] = useState(() => Date.now());
    const canvas = useRef<HTMLCanvasElement>(null);
    const [sharing, setSharing] = useState<'idle' | 'busy' | 'downloaded'>('idle');

    const last = placements[placements.length - 1];
    const before = placements[placements.length - 2];
    const reviews = Object.values(progress).reduce((n, c) => n + c.reviewCount + c.wrongCount, 0);
    const gate = retake(placements, reviews, now);
    const link = last?.code && typeof window !== 'undefined' ? `${window.location.origin}/score/${last.code}` : null;
    const [copied, setCopied] = useState(false);

    const share = async () => {
        if (!last || !canvas.current) return;
        setSharing('busy');
        const level = levelDef(last.level);
        drawShareCard(canvas.current, { score: last.score, sd: last.sd, at: last.at, level: `${level.label} · ${level.cefr}`, change: before ? last.score - before.score : null, verifyUrl: link }, SHARE_THEME);
        try {
            setSharing((await shareCanvas(canvas.current)) === 'downloaded' ? 'downloaded' : 'idle');
        } catch {
            setSharing('idle');
        }
    };

    return (
        <div className="min-h-screen bg-bg px-4 py-6">
            <div className="max-w-xl mx-auto space-y-5">
                <div>
                    <Link href="/me" className="text-muted hover:text-accent text-sm">
                        ← Tôi
                    </Link>
                    <h1 className="mt-3 text-xl font-semibold text-ink">Điểm từ vựng</h1>
                </div>

                {!last ? (
                    <section className="rounded-2xl border border-line bg-surface p-5 space-y-3">
                        <p className="text-sm text-ink-2">Bạn chưa làm bài kiểm tra từ vựng. Khoảng 6 phút, ra điểm Lexica, mức tương đương IELTS và vốn từ ước lượng.</p>
                        <Link href="/test/quiz" onClick={() => startTest()} className="inline-flex h-11 px-5 items-center rounded-xl bg-accent text-on-accent text-sm font-semibold">
                            Làm bài kiểm tra
                        </Link>
                    </section>
                ) : (
                    <>
                        <section className="rounded-3xl border border-accent/40 bg-gradient-to-b from-accent/10 to-accent/[0.02] p-5">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-mono text-[11px] uppercase tracking-wider text-accent">Điểm gần nhất</p>
                                    <p className="mt-1 font-mono text-5xl font-bold text-ink">{last.score}</p>
                                    <p className="text-xs text-muted">
                                        ± {last.sd} · {new Date(last.at).toLocaleDateString('vi-VN')}
                                        {before ? ` · ${last.score - before.score >= 0 ? '+' : ''}${last.score - before.score} so với lần trước` : ''}
                                    </p>
                                </div>
                                <button onClick={() => void share()} disabled={sharing === 'busy'} className="h-10 px-3 shrink-0 whitespace-nowrap rounded-xl border border-accent/40 text-accent text-sm font-medium flex items-center gap-1.5 hover:bg-accent/10">
                                    {sharing === 'busy' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />} Chia sẻ
                                </button>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-2">
                                <Stat label="Tương đương IELTS từ vựng" value={`khoảng ${ieltsRange(last.score, last.sd)}`} />
                                <Stat label="Vốn từ ước lượng" value={`~${vocabSize(last.score).toLocaleString('vi-VN')} từ`} />
                            </div>
                            {link ? (
                                <button
                                    onClick={() => {
                                        void navigator.clipboard?.writeText(link).then(() => setCopied(true));
                                    }}
                                    className="mt-3 w-full flex items-center gap-2 rounded-xl bg-bg/60 border border-line px-3 py-2 text-left"
                                >
                                    <BadgeCheck className="w-4 h-4 text-accent shrink-0" />
                                    <span className="flex-1 min-w-0">
                                        <span className="block text-xs text-ink">Đã xác minh · ai mở link cũng thấy điểm này</span>
                                        <span className="block font-mono text-[11px] text-muted truncate">{link.replace(/^https?:\/\//, '')}</span>
                                    </span>
                                    <span className="text-xs text-accent shrink-0 flex items-center gap-1">
                                        <Copy className="w-3.5 h-3.5" /> {copied ? 'Đã chép' : 'Chép'}
                                    </span>
                                </button>
                            ) : (
                                <p className="mt-3 text-xs text-muted">Điểm luyện tập (chấm trên máy). Đăng nhập rồi thi để có điểm đã xác minh và link chia sẻ.</p>
                            )}
                            {sharing === 'downloaded' && <p className="mt-3 text-xs text-muted">Đã tải ảnh về máy. Đăng lên đâu tuỳ bạn.</p>}
                        </section>

                        {placements.length > 1 && <History list={placements} />}

                        <section className="rounded-2xl border border-line bg-surface p-4 flex items-start gap-3">
                            <span className="w-9 h-9 rounded-xl bg-accent/12 text-accent flex items-center justify-center shrink-0">
                                <Gauge className="w-4 h-4" />
                            </span>
                            <div className="flex-1">
                                {gate.ok ? (
                                    <>
                                        <p className="text-sm font-medium text-ink">Thi lại được rồi</p>
                                        <p className="mt-0.5 text-xs text-muted">Bạn đã ôn thêm {reviews - last.reviewsAt} lượt từ lần trước.</p>
                                        <Link href="/test/quiz" onClick={() => startTest()} className="mt-2 inline-block text-xs font-medium text-accent hover:underline">
                                            Thi lại
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-sm font-medium text-ink">Lần thi tới</p>
                                        <p className="mt-0.5 text-xs text-muted">
                                            Còn
                                            {gate.daysLeft > 0 ? ` ${gate.daysLeft} ngày` : ''}
                                            {gate.daysLeft > 0 && gate.reviewsLeft > 0 ? ' và' : ''}
                                            {gate.reviewsLeft > 0 ? ` ${gate.reviewsLeft} lượt ôn` : ''}. Điểm mới chỉ có ý nghĩa khi bạn đã học thêm.
                                        </p>
                                    </>
                                )}
                            </div>
                        </section>
                        <p className="text-center text-xs text-subtle">Ước lượng, không phải điểm thi IELTS chính thức.</p>
                    </>
                )}
                <canvas ref={canvas} className="hidden" aria-hidden />
            </div>
        </div>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl bg-bg/60 border border-line p-3">
            <p className="text-[11px] text-subtle">{label}</p>
            <p className="mt-0.5 font-semibold text-ink">{value}</p>
        </div>
    );
}

/** Every test as a point, oldest left; the band of each point is its ± spread. */
function History({ list }: { list: readonly Placement[] }) {
    const w = 320;
    const h = 140;
    const pad = 24;
    const lo = Math.min(...list.map((p) => p.score - p.sd)) - 20;
    const hi = Math.max(...list.map((p) => p.score + p.sd)) + 20;
    const x = (i: number) => pad + (list.length === 1 ? (w - 2 * pad) / 2 : (i * (w - 2 * pad)) / (list.length - 1));
    const y = (v: number) => h - pad - ((v - lo) / Math.max(1, hi - lo)) * (h - 2 * pad);
    const line = list.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.score).toFixed(1)}`).join(' ');
    return (
        <section className="rounded-2xl border border-line bg-surface p-4">
            <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">Qua các lần thi</p>
            <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 w-full h-auto" role="img" aria-label={`Điểm qua ${list.length} lần thi: ${list.map((p) => p.score).join(', ')}`}>
                {list.map((p, i) => (
                    <line key={`b${p.at}`} x1={x(i)} x2={x(i)} y1={y(p.score + p.sd)} y2={y(p.score - p.sd)} className="stroke-accent/25" strokeWidth={8} strokeLinecap="round" />
                ))}
                <path d={line} fill="none" className="stroke-accent" strokeWidth={2.5} strokeLinejoin="round" />
                {list.map((p, i) => (
                    <g key={p.at}>
                        <circle cx={x(i)} cy={y(p.score)} r={4.5} className="fill-accent" />
                        <text x={x(i)} y={y(p.score) - 12} textAnchor="middle" className="fill-ink font-mono" fontSize={11}>
                            {p.score}
                        </text>
                        <text x={x(i)} y={h - 4} textAnchor="middle" className="fill-muted" fontSize={10}>
                            {new Date(p.at).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })}
                        </text>
                    </g>
                ))}
            </svg>
        </section>
    );
}
