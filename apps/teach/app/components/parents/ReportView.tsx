import type { ReportContent } from '@cortex/classroom';
import { scoreLine } from '../../lib/parentReport';

/**
 * A weekly report as the parent reads it: the opening sentence, what the
 * child did (with the words), the one number, how to help, the teacher's
 * line. The same block on the parent page and in the teacher's preview.
 */
export default function ReportView({ content, large = false }: { content: ReportContent; large?: boolean }) {
    return (
        <div className={large ? 'space-y-5 text-[17px] leading-relaxed' : 'space-y-3 text-sm'}>
            <p className={`text-ink ${large ? 'text-lg font-medium' : 'font-medium'}`}>{content.summary}</p>
            {content.did.length > 0 && (
                <div>
                    <p className={`${large ? 'text-sm' : 'text-xs'} font-medium uppercase tracking-wide text-muted`}>Con làm được</p>
                    <ul className="mt-1.5 space-y-2">
                        {content.did.map((d) => (
                            <li key={d.text} className="text-ink-2">
                                {d.text}
                                {d.words && d.words.length > 0 && (
                                    <span className="mt-1 flex flex-wrap gap-1.5">
                                        {d.words.map((w) => (
                                            <span key={w} lang="en" className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[0.9em] text-accent-strong">
                                                {w}
                                            </span>
                                        ))}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {content.score && (
                <div>
                    <p className={`${large ? 'text-sm' : 'text-xs'} font-medium uppercase tracking-wide text-muted`}>Điểm từ vựng đã xác minh</p>
                    <p className="mt-1 text-ink">{scoreLine(content.score)}</p>
                    <p className="text-xs text-subtle">Bài kiểm tra trong Lexica, máy chấm. Đây là ước lượng, không phải điểm thi IELTS chính thức.</p>
                </div>
            )}
            {content.help && (
                <div className="rounded-xl bg-lilac-soft px-3.5 py-2.5">
                    <p className={`${large ? 'text-sm' : 'text-xs'} font-medium text-lilac`}>Phụ huynh có thể giúp</p>
                    <p className="mt-0.5 text-ink">{content.help}</p>
                </div>
            )}
            {content.note && (
                <blockquote className="border-l-2 border-accent pl-3 text-ink">
                    <p className={`${large ? 'text-sm' : 'text-xs'} font-medium text-muted`}>Lời nhắn của giáo viên</p>
                    <p className="mt-0.5">{content.note}</p>
                </blockquote>
            )}
        </div>
    );
}
