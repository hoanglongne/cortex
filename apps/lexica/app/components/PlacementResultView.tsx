'use client';

import { levelDef } from '../lib/levels';
import { ieltsRange, RETAKE_DAYS, RETAKE_REVIEWS, vocabSize, type PlacementResult } from '../lib/placement/engine';

const KIND_LABEL = { meaning: 'Nhận nghĩa', phrase: 'Dùng trong cụm', real: 'Nhận ra từ' } as const;

/** The result of the adaptive test: the score with its spread, what it is roughly worth, strengths, the level to start. */
export default function PlacementResultView({
    result,
    previous,
    onAccept,
    onChoose,
}: {
    result: PlacementResult;
    /** The score of the test before, to show the change. */
    previous: number | null;
    onAccept: () => void;
    onChoose: () => void;
}) {
    const level = levelDef(result.level);
    const change = previous === null ? null : result.score - previous;
    const kinds = (Object.keys(result.byKind) as (keyof typeof KIND_LABEL)[]).filter((k) => result.byKind[k].total > 0);
    const overclaim = result.fakes.total > 0 && result.fakes.yes / result.fakes.total >= 0.5;

    return (
        <div className="min-h-screen bg-bg px-4 py-8">
            <div className="max-w-xl mx-auto space-y-5">
                <section className="rounded-3xl border border-accent/40 bg-gradient-to-b from-accent/10 to-accent/[0.02] p-6 text-center">
                    <p className="font-mono text-[11px] uppercase tracking-wider text-accent">Điểm từ vựng Lexica</p>
                    <p className="mt-3 font-mono text-6xl font-bold text-ink">{result.score}</p>
                    <p className="mt-1 text-sm text-muted">± {result.sd} điểm</p>
                    {change !== null && change !== 0 && (
                        <p className={`mt-2 text-sm font-medium ${change > 0 ? 'text-accent' : 'text-muted'}`}>
                            {change > 0 ? `+${change}` : change} so với lần trước
                        </p>
                    )}
                    <div className="mt-5 grid grid-cols-2 gap-2 text-left">
                        <div className="rounded-xl bg-bg/60 border border-line p-3">
                            <p className="text-[11px] text-subtle">Tương đương IELTS từ vựng</p>
                            <p className="mt-0.5 font-semibold text-ink">khoảng {ieltsRange(result.score, result.sd)}</p>
                        </div>
                        <div className="rounded-xl bg-bg/60 border border-line p-3">
                            <p className="text-[11px] text-subtle">Vốn từ ước lượng</p>
                            <p className="mt-0.5 font-semibold text-ink">~{vocabSize(result.score).toLocaleString('vi-VN')} từ</p>
                        </div>
                    </div>
                    <p className="mt-3 text-[11px] text-subtle">Ước lượng{result.questions > 0 ? ` từ ${result.questions} câu` : ''}, không phải điểm thi IELTS chính thức.</p>
                </section>

                {kinds.length > 0 && (
                    <section className="rounded-2xl border border-line bg-surface p-4 space-y-2.5">
                        <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">Theo dạng câu</p>
                        {kinds.map((k) => {
                            const { right, total } = result.byKind[k];
                            return (
                                <div key={k} className="flex items-center gap-3">
                                    <span className="w-32 shrink-0 text-sm text-ink">{KIND_LABEL[k]}</span>
                                    <span className="flex-1 h-2 rounded-full bg-surface-3 overflow-hidden">
                                        <span className="block h-full rounded-full bg-accent/80" style={{ width: `${(right / total) * 100}%` }} />
                                    </span>
                                    <span className="w-10 text-right text-xs text-muted tabular-nums">
                                        {right}/{total}
                                    </span>
                                </div>
                            );
                        })}
                        {overclaim && <p className="pt-1 text-xs text-muted">Bạn nhận nhầm vài từ bịa là từ thật. Lần sau, không chắc thì chọn “Không biết” để điểm sát hơn.</p>}
                    </section>
                )}

                <section className="rounded-2xl border border-line bg-surface p-4">
                    <p className="text-sm text-ink">
                        Level gợi ý: <b className="text-accent">{level.label}</b> <span className="text-muted">· {level.cefr}</span>
                    </p>
                    <p className="mt-1 text-xs text-muted">{level.description}</p>
                    <div className="mt-4 flex flex-col sm:flex-row gap-2">
                        <button onClick={onAccept} className="h-12 flex-1 rounded-xl bg-accent hover:bg-accent-strong text-on-accent font-semibold">
                            Học ở level {level.label}
                        </button>
                        <button onClick={onChoose} className="h-12 px-4 rounded-xl border border-line text-sm text-ink-2 hover:border-line-strong">
                            Tự chọn level
                        </button>
                    </div>
                </section>

                <p className="text-center text-xs text-subtle">
                    Thi lại được sau {RETAKE_DAYS} ngày và {RETAKE_REVIEWS} lượt ôn, để điểm phản ánh đúng những gì bạn học thêm.
                </p>
            </div>
        </div>
    );
}
