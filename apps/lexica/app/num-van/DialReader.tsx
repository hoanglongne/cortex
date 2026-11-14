'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Volume2, X } from 'lucide-react';
import { compileRules, findHits, type DialHit } from '../lib/dial/match';
import { DIAL_RULES_D0 } from '../lib/dial/rules';
import { VOCAB_DATABASE } from '../data/vocabCards';
import { playText } from '../lib/audio/AudioService';

const INDEX = compileRules(DIAL_RULES_D0);
const CARDS = new Map(VOCAB_DATABASE.map((c) => [c.id, c]));

const SAMPLE = `Sau nhiều tháng chuẩn bị, công ty quyết định triển khai phương án mới vì nó khả thi và tiết kiệm chi phí. Ban giám đốc thừa nhận kế hoạch cũ thiếu minh bạch và không mang lại lợi ích như mong đợi.
Theo các chuyên gia, việc duy trì chất lượng dịch vụ là điều cần thiết. Nhân viên được khuyến khích chủ động đề xuất ý tưởng, kể cả những cách tiếp cận đầy thách thức.
Tuy vậy, một số người vẫn lo lắng rằng thay đổi toàn diện sẽ gây tác động tiêu cực đến khách hàng trong ngắn hạn.`;

/** Spread the shown hits evenly: with level 30%, show about every third hit. */
function pick(hits: DialHit[], level: number): Set<number> {
    const shown = new Set<number>();
    let acc = 0;
    hits.forEach((_, i) => {
        acc += level / 100;
        if (acc >= 1 - 1e-9) {
            shown.add(i);
            acc -= 1;
        }
    });
    return shown;
}

export default function DialReader() {
    const [text, setText] = useState('');
    const [level, setLevel] = useState(100);
    const [open, setOpen] = useState<DialHit | null>(null);
    const [reading, setReading] = useState(false);

    const paras = useMemo(() => text.split(/\n+/).map((p) => p.trim()).filter(Boolean), [text]);
    const hitsByPara = useMemo(() => paras.map((p) => findHits(p, INDEX)), [paras]);
    const total = hitsByPara.reduce((n, h) => n + h.length, 0);

    // One counter across paragraphs so the density holds for the whole text.
    const shownByPara = useMemo(() => {
        const all = hitsByPara.flat();
        const shown = pick(all, level);
        let k = 0;
        return hitsByPara.map((hs) => hs.map(() => shown.has(k++)));
    }, [hitsByPara, level]);

    const card = open ? CARDS.get(open.cardId) : undefined;

    return (
        <main className="min-h-dvh bg-bg text-ink px-4 py-5 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
                <Link href="/" aria-label="Về trang chủ" className="p-2 -ml-2 text-muted hover:text-ink"><ArrowLeft className="w-5 h-5" /></Link>
                <h1 className="text-lg font-semibold">Núm vặn</h1>
                <span className="text-[11px] font-mono uppercase tracking-wider text-accent border border-accent/30 rounded px-1.5 py-0.5">Thử nghiệm</span>
            </div>

            {!reading ? (
                <section className="space-y-3">
                    <p className="text-sm text-muted">Dán một đoạn tiếng Việt (bài báo, bài viết…). Lexica sẽ đổi các từ bạn đang học sang tiếng Anh ngay trong câu.</p>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Dán đoạn văn tiếng Việt vào đây"
                        className="w-full h-56 rounded-xl bg-surface border border-line p-3 text-[15px] leading-relaxed focus:outline-none focus:border-accent/50"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={() => setReading(true)}
                            disabled={!text.trim()}
                            className="flex-1 rounded-xl bg-accent text-on-accent font-semibold py-3 disabled:opacity-40"
                        >
                            Đọc
                        </button>
                        <button onClick={() => setText(SAMPLE)} className="rounded-xl border border-line px-4 text-sm text-ink-2">Dùng đoạn mẫu</button>
                    </div>
                </section>
            ) : (
                <section>
                    <div className="sticky top-0 z-10 bg-bg/95 backdrop-blur py-3 mb-2 border-b border-line">
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-muted">Mức tiếng Anh</span>
                            <span className="font-mono text-accent">{level}%</span>
                        </div>
                        <input type="range" min={0} max={100} step={10} value={level} onChange={(e) => setLevel(Number(e.target.value))} className="w-full accent-[var(--color-accent)]" aria-label="Mức tiếng Anh" />
                        <div className="flex items-center justify-between mt-2 text-xs text-muted">
                            <span>{total === 0 ? 'Chưa có từ nào khớp trong đoạn này' : `${total} chỗ có thể đổi · chạm vào từ để xem nghĩa`}</span>
                            <button onClick={() => { setReading(false); setOpen(null); }} className="text-ink-2 underline">Đổi đoạn khác</button>
                        </div>
                    </div>
                    <article className="space-y-4 text-[17px] leading-[1.75]">
                        {paras.map((p, pi) => {
                            const out: React.ReactNode[] = [];
                            let last = 0;
                            hitsByPara[pi].forEach((h, hi) => {
                                if (!shownByPara[pi][hi]) return;
                                out.push(p.slice(last, h.start));
                                out.push(
                                    <button
                                        key={`${pi}-${hi}`}
                                        onClick={() => setOpen(h)}
                                        className="font-semibold text-accent underline decoration-accent/40 underline-offset-4 decoration-dotted"
                                    >
                                        {h.en}
                                    </button>,
                                );
                                last = h.end;
                            });
                            out.push(p.slice(last));
                            return <p key={pi}>{out}</p>;
                        })}
                    </article>
                </section>
            )}

            {open && (
                <div className="fixed inset-x-0 bottom-0 z-20 p-4 max-w-2xl mx-auto" role="dialog" aria-label={`Nghĩa của ${open.en}`}>
                    <div className="rounded-2xl bg-surface border border-line p-4 shadow-2xl">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-semibold">{open.en}</span>
                                    {card?.ipa && <span className="text-sm font-mono text-muted">/{card.ipa}/</span>}
                                    <button onClick={() => void playText(open.en, 'en')} aria-label="Nghe phát âm" className="p-1 text-accent"><Volume2 className="w-5 h-5" /></button>
                                </div>
                                <p className="text-sm text-ink-2 mt-1">Trong bài: <b className="text-ink">{open.vi}</b></p>
                                {card && <p className="text-sm text-muted mt-1">{card.translationHint}</p>}
                            </div>
                            <button onClick={() => setOpen(null)} aria-label="Đóng" className="p-1 text-muted"><X className="w-5 h-5" /></button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
