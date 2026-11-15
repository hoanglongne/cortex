'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';
import { DialParagraph, DialSheet, DialSlider, useDialParagraphs, useDialSheet } from '../components/DialText';
import { useDialLevel } from '../lib/dial/level';
import { allowedUrl, firstUrl, DIAL_SITES } from '../lib/dial/extract';
import { useLexicaStore } from '../store/lexicaStore';

const SAMPLE = `Sau nhiều tháng chuẩn bị, công ty quyết định triển khai phương án mới vì nó khả thi và tiết kiệm chi phí. Ban giám đốc thừa nhận kế hoạch cũ thiếu minh bạch và không mang lại lợi ích như mong đợi.
Theo các chuyên gia, việc duy trì chất lượng dịch vụ là điều cần thiết. Nhân viên được khuyến khích chủ động đề xuất ý tưởng, kể cả những cách tiếp cận đầy thách thức.
Tuy vậy, một số người vẫn lo lắng rằng thay đổi toàn diện sẽ gây tác động tiêu cực đến khách hàng trong ngắn hạn.`;

const ERRORS: Record<string, string> = {
    site: 'Trang này chưa được hỗ trợ. Hãy sao chép phần chữ của bài rồi dán vào đây.',
    limit: 'Bạn đã mở quá nhiều bài trong giờ này. Thử lại sau nhé.',
    empty: 'Không tìm thấy nội dung bài ở link này. Hãy dán phần chữ vào đây.',
    fetch: 'Không tải được bài. Kiểm tra mạng hoặc dán phần chữ vào đây.',
    size: 'Trang quá lớn để tải.',
};

interface Article { title: string; paragraphs: string[]; url?: string }

/** Núm vặn reader: paste text or a news link (or share one to Lexica on Android). */
export default function DialReader() {
    const [input, setInput] = useState('');
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [level, setLevel] = useDialLevel();
    const sheet = useDialSheet();

    // The learner's own words come first when the level is below 100 %.
    const progress = useLexicaStore((s) => s.cardProgress);
    const priority = useMemo(() => new Set(Object.keys(progress ?? {})), [progress]);

    const open = useCallback(async (raw: string) => {
        setError(null);
        const link = firstUrl(raw);
        const onlyLink = link && raw.trim().length - link.length < 40;
        if (link && onlyLink) {
            if (!allowedUrl(link)) { setError(ERRORS.site); return; }
            setLoading(true);
            try {
                const res = await fetch(`/api/dial/article?url=${encodeURIComponent(link)}`);
                const body = await res.json();
                if (!res.ok) { setError(ERRORS[body.error] ?? ERRORS.fetch); return; }
                setArticle(body);
            } catch {
                setError(ERRORS.fetch);
            } finally {
                setLoading(false);
            }
            return;
        }
        const paragraphs = raw.split(/\n+/).map((p) => p.trim()).filter(Boolean);
        if (paragraphs.length) setArticle({ title: '', paragraphs });
    }, []);

    // Shared to Lexica (Android share sheet → manifest share_target → ?url=&text=).
    useEffect(() => {
        const q = new URLSearchParams(location.search);
        const shared = q.get('url') || q.get('text') || '';
        if (shared) {
            setInput(shared);
            void open(shared);
            history.replaceState(null, '', '/num-van');
        }
    }, [open]);

    const paras = useMemo(() => article?.paragraphs ?? [], [article]);
    const dial = useDialParagraphs(paras, level, priority);

    return (
        <main className="min-h-dvh bg-bg text-ink px-4 py-5 max-w-2xl mx-auto pb-40">
            <div className="flex items-center gap-3 mb-4">
                <Link href="/" aria-label="Về trang chủ" className="p-2 -ml-2 text-muted hover:text-ink"><ArrowLeft className="w-5 h-5" /></Link>
                <h1 className="text-lg font-semibold">Núm vặn</h1>
                <span className="text-[11px] font-mono uppercase tracking-wider text-accent border border-accent/30 rounded px-1.5 py-0.5">Thử nghiệm</span>
            </div>

            {!article ? (
                <section className="space-y-3">
                    <p className="text-sm text-muted">Dán link bài báo hoặc một đoạn tiếng Việt. Lexica đổi các từ bạn đang học sang tiếng Anh ngay trong câu.</p>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="https://vnexpress.net/… hoặc dán đoạn văn"
                        className="w-full h-48 rounded-xl bg-surface border border-line p-3 text-[15px] leading-relaxed focus:outline-none focus:border-accent/50"
                    />
                    {error && <p className="text-sm text-danger">{error}</p>}
                    <div className="flex gap-2">
                        <button onClick={() => void open(input)} disabled={!input.trim() || loading} className="flex-1 rounded-xl bg-accent text-on-accent font-semibold py-3 disabled:opacity-40 flex items-center justify-center gap-2">
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />} Đọc
                        </button>
                        <button onClick={() => setInput(SAMPLE)} className="rounded-xl border border-line px-4 text-sm text-ink-2">Đoạn mẫu</button>
                    </div>
                    <details className="text-xs text-muted">
                        <summary className="cursor-pointer">Link từ những trang nào?</summary>
                        <p className="mt-1">{DIAL_SITES.join(', ')}. Trên Android, bấm Chia sẻ trong trình duyệt hoặc app báo rồi chọn Lexica.</p>
                    </details>
                </section>
            ) : (
                <section>
                    <div className="sticky top-0 z-10 bg-bg/95 backdrop-blur py-3 mb-3 border-b border-line">
                        <DialSlider level={level} onChange={setLevel} total={dial.total} />
                        <div className="mt-2 flex items-center justify-between text-xs">
                            {article.url ? (
                                <a href={article.url} target="_blank" rel="noreferrer" className="text-muted flex items-center gap-1 truncate"><ExternalLink className="w-3 h-3" /> {new URL(article.url).hostname}</a>
                            ) : <span />}
                            <button onClick={() => { setArticle(null); sheet.close(); }} className="text-ink-2 underline shrink-0">Đổi bài khác</button>
                        </div>
                    </div>
                    {article.title && <h2 className="text-xl font-semibold mb-3">{article.title}</h2>}
                    <article className="space-y-4 text-[17px] leading-[1.75]">
                        {paras.map((p, i) => (
                            <p key={i}><DialParagraph text={p} hits={dial.hits[i]} shown={dial.shown[i]} onOpen={sheet.setOpen} /></p>
                        ))}
                    </article>
                    {article.url && <p className="mt-6 text-xs text-subtle">Nội dung thuộc về trang gốc. Lexica không lưu bài này.</p>}
                </section>
            )}
            <DialSheet hit={sheet.open} onClose={sheet.close} />
        </main>
    );
}
