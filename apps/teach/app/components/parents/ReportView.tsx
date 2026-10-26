import type { ReportContent } from '@cortex/classroom';

/**
 * A weekly report as the parent reads it: the opening sentence, what the
 * child did (with the words), the one number, how to help, the teacher's
 * line. The same block on the parent page (large) and in the teacher's
 * preview. Serif for what matters, like a letter home.
 */
export default function ReportView({ content, large = false }: { content: ReportContent; large?: boolean }) {
    const label = `${large ? 'text-sm' : 'text-[13px]'} font-semibold uppercase tracking-[0.06em] text-muted`;
    return (
        <div className={large ? 'space-y-8 text-[17px] leading-relaxed' : 'space-y-6 text-[15px] leading-relaxed'}>
            <p className={`font-serif font-medium leading-snug text-ink ${large ? 'text-[23px]' : 'text-[19px]'}`}>{content.summary}</p>

            {content.did.length > 0 && (
                <div className={large ? 'border-t border-line pt-6' : ''}>
                    <p className={label}>Con làm được</p>
                    <ol className="mt-3 space-y-4">
                        {content.did.map((d, i) => (
                            <li key={d.text} className="flex gap-3.5">
                                <span className={`font-serif font-semibold leading-tight text-accent-strong ${large ? 'text-[22px]' : 'text-lg'}`}>{i + 1}</span>
                                <div className="min-w-0">
                                    <p className="text-ink">{d.text}</p>
                                    {d.words && d.words.length > 0 && (
                                        <p lang="en" className={`mt-1 font-serif italic text-accent-strong ${large ? 'text-[19px]' : 'text-[17px]'}`}>
                                            {d.words.join(' · ')}
                                        </p>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            )}

            {content.score && (
                <div className={large ? 'border-t border-line pt-6' : ''}>
                    <p className={label}>Điểm từ vựng</p>
                    <p className="mt-1 flex flex-wrap items-baseline gap-x-3">
                        <span className={`font-serif font-semibold leading-none tabular text-ink ${large ? 'text-[52px]' : 'text-[34px]'}`}>{content.score.score}</span>
                        {content.score.delta !== undefined && content.score.delta !== 0 && (
                            <span className={`font-semibold ${content.score.delta > 0 ? 'text-accent-strong' : 'text-warm'}`}>
                                {content.score.delta > 0 ? '▲' : '▼'} {Math.abs(content.score.delta)} so với lần trước
                            </span>
                        )}
                    </p>
                    <p className="mt-2 text-ink-2">Tương đương IELTS từ vựng khoảng {content.score.ielts}</p>
                    <p className="mt-1 text-[13px] text-muted">Bài kiểm tra trong Lexica, máy chấm. Là ước lượng, không phải điểm thi chính thức.</p>
                </div>
            )}

            {content.help && (
                <div className={`rounded-[var(--radius-card)] bg-surface ${large ? 'p-5 shadow-[var(--shadow-card)]' : 'border border-line p-4'}`}>
                    <p className="text-sm font-semibold text-accent-strong">Phụ huynh có thể giúp</p>
                    <p className="mt-1 text-ink">{content.help}</p>
                </div>
            )}

            {content.note && (
                <div>
                    <p className={`font-serif italic leading-normal text-ink ${large ? 'text-xl' : 'text-lg'}`}>“{content.note}”</p>
                    <p className="mt-1.5 text-sm text-muted">Lời nhắn của giáo viên</p>
                </div>
            )}
        </div>
    );
}
