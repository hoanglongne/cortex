'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, errorText } from '../lib/api';
import { Badge, Button, Card, ErrorNote, Textarea } from '../components/ui';

/**
 * "Ngoài đời": real quotes that contain a card's word. Books are found
 * automatically (public-domain only); headlines and song lines are added by
 * hand. Approve or edit each one, then publish with the variants overlay.
 */

type Kind = 'book' | 'news' | 'song';
const KIND_LABEL: Record<Kind, string> = { book: 'Sách', news: 'Báo', song: 'Bài hát' };

interface Quote {
    id: string;
    card_id: string;
    word: string;
    kind: Kind;
    text: string;
    translation: string | null;
    source: string;
    url: string | null;
    media: { provider: 'youtube'; id: string; start: number; end: number } | null;
    status: 'pending' | 'approved' | 'rejected';
}

const EMPTY_FORM = { card_id: '', kind: 'news' as Kind, text: '', source: '', url: '', translation: '', youtube: '', start: '', end: '' };

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/** "1:23" or "83" → seconds; NaN when unreadable. */
function seconds(v: string): number {
    const m = /^(\d+):(\d{1,2})$/.exec(v.trim());
    return m ? Number(m[1]) * 60 + Number(m[2]) : Number(v.trim() || NaN);
}

const INPUT = 'rounded-lg border border-line bg-surface px-3 py-2';

export default function QuotesPage() {
    const [pending, setPending] = useState<Quote[]>([]);
    const [busy, setBusy] = useState('');
    const [error, setError] = useState('');
    const [note, setNote] = useState('');
    const [form, setForm] = useState(EMPTY_FORM);

    const load = useCallback(async () => {
        try {
            setPending(await api<Quote[]>('/quotes?status=pending&limit=30'));
        } catch (err) {
            setError(errorText(err));
        }
    }, []);

    useEffect(() => {
        const t = setTimeout(() => void load(), 0);
        return () => clearTimeout(t);
    }, [load]);

    const run = async (label: string, fn: () => Promise<string | void>) => {
        setBusy(label);
        setError('');
        setNote('');
        try {
            const msg = await fn();
            if (msg) setNote(msg);
            await load();
        } catch (err) {
            setError(errorText(err));
        } finally {
            setBusy('');
        }
    };

    const findBooks = () =>
        run('find', async () => {
            const r = await api<{ cards: number; saved: number; rejected: number; missed: number }>('/quotes/find-books', { method: 'POST', body: { limit: 10 } });
            return `Đã tìm trong sách cho ${r.cards} thẻ: ${r.saved} câu chờ duyệt, ${r.rejected} câu bị loại tự động, ${r.missed} thẻ không tìm thấy.`;
        });

    const add = () =>
        run('add', async () => {
            const { youtube, start, end, ...rest } = form;
            const clip = form.kind === 'song' && youtube.trim() ? { youtube, start: seconds(start), end: seconds(end) } : {};
            await api('/quotes', { method: 'POST', body: { ...rest, ...clip } });
            setForm({ ...EMPTY_FORM, card_id: form.card_id, kind: form.kind });
            return 'Đã thêm, chờ duyệt.';
        });

    const review = (q: Quote, action: 'approve' | 'reject', text?: string) =>
        run(q.id, async () => {
            await api(`/quotes/${q.id}/${action}`, { method: 'POST', body: text !== undefined ? { text } : {} });
        });

    const publish = () =>
        run('publish', async () => {
            const r = await api<{ variants: number; quotes: number; cards: number }>('/variants/publish', { method: 'POST' });
            return `Đã xuất bản ${r.quotes} câu trích và ${r.variants} câu theo hình mẫu, cho ${r.cards} thẻ.`;
        });

    const set = (key: keyof typeof EMPTY_FORM) => (e: { target: { value: string } }) => setForm({ ...form, [key]: e.target.value });

    return (
        <div className="flex flex-col gap-4">
            <Card>
                <p className="text-sm text-ink-2">
                    Câu trích thật có chứa từ của thẻ, hiện ở mặt sau thẻ trong Lexica. Sách hết bản quyền được tìm tự động; báo và bài hát thì thêm tay, kèm link nguồn. Bài
                    hát chỉ lấy một dòng lời, kèm đoạn video tối đa 30 giây từ link YouTube chính thức.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="primary" onClick={findBooks} disabled={!!busy}>
                        {busy === 'find' ? 'Đang tìm…' : 'Tìm trong sách (10 thẻ)'}
                    </Button>
                    <Button onClick={publish} disabled={!!busy}>
                        {busy === 'publish' ? 'Đang xuất bản…' : 'Xuất bản câu đã duyệt'}
                    </Button>
                </div>
                {note && <p className="mt-3 text-sm text-accent">{note}</p>}
            </Card>

            <Card>
                <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">Thêm câu tay</p>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <input className={INPUT} placeholder="Mã thẻ (v001 hoặc t…)" value={form.card_id} onChange={set('card_id')} />
                    <select className={INPUT} value={form.kind} onChange={e => setForm({ ...form, kind: e.target.value as Kind })}>
                        {(Object.keys(KIND_LABEL) as Kind[]).map(k => (
                            <option key={k} value={k}>
                                {KIND_LABEL[k]}
                            </option>
                        ))}
                    </select>
                    <Textarea className="sm:col-span-2 w-full" rows={2} placeholder="Câu trích (chứa đúng từ của thẻ)" value={form.text} onChange={set('text')} />
                    <input className={INPUT} placeholder="Nguồn (tên báo, tên bài hát — ca sĩ)" value={form.source} onChange={set('source')} />
                    <input className={INPUT} placeholder="Link nguồn (https://…)" value={form.url} onChange={set('url')} />
                    <input className={`sm:col-span-2 ${INPUT}`} placeholder="Bản dịch tiếng Việt (không bắt buộc)" value={form.translation} onChange={set('translation')} />
                    {form.kind === 'song' && (
                        <>
                            <input className={`sm:col-span-2 ${INPUT}`} placeholder="Link YouTube chính thức của bài hát" value={form.youtube} onChange={set('youtube')} />
                            <input className={INPUT} placeholder="Bắt đầu (vd 1:23)" value={form.start} onChange={set('start')} />
                            <input className={INPUT} placeholder="Kết thúc (tối đa 30 giây sau)" value={form.end} onChange={set('end')} />
                        </>
                    )}
                </div>
                <div className="mt-3">
                    <Button onClick={add} disabled={!!busy || !form.card_id || !form.text || !form.source}>
                        Thêm
                    </Button>
                </div>
            </Card>

            <ErrorNote error={error} />

            {pending.length === 0 && <p className="text-sm text-muted">Không có câu nào chờ duyệt.</p>}
            {pending.map(q => (
                <QuoteRow key={q.id} quote={q} busy={busy === q.id} onReview={(a, t) => review(q, a, t)} />
            ))}
        </div>
    );
}

function QuoteRow({ quote, busy, onReview }: { quote: Quote; busy: boolean; onReview: (action: 'approve' | 'reject', text?: string) => void }) {
    const [editing, setEditing] = useState(false);
    const [text, setText] = useState(quote.text);
    return (
        <Card>
            <div className="flex items-baseline gap-2">
                <span className="font-bold text-ink lowercase">{quote.word}</span>
                <Badge tone="accent">{KIND_LABEL[quote.kind]}</Badge>
                <span className="ml-auto font-mono text-[11px] text-subtle">{quote.card_id}</span>
            </div>
            {editing ? <Textarea value={text} onChange={e => setText(e.target.value)} rows={2} className="mt-2 w-full" /> : <p className="mt-2 text-sm text-ink-2">{quote.text}</p>}
            {quote.translation && <p className="mt-1 text-sm text-muted">{quote.translation}</p>}
            {quote.media && (
                <a
                    href={`https://www.youtube.com/watch?v=${quote.media.id}&t=${quote.media.start}s`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block font-mono text-[11px] text-accent underline"
                >
                    ▶ {clock(quote.media.start)}–{clock(quote.media.end)} trên YouTube
                </a>
            )}
            <p className="mt-1 font-mono text-[11px] text-subtle">
                {quote.url ? (
                    <a href={quote.url} target="_blank" rel="noopener noreferrer" className="underline">
                        {quote.source}
                    </a>
                ) : (
                    quote.source
                )}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
                {editing ? (
                    <>
                        <Button
                            variant="primary"
                            disabled={busy}
                            onClick={() => {
                                onReview('approve', text);
                                setEditing(false);
                            }}
                        >
                            Lưu và duyệt
                        </Button>
                        <Button
                            disabled={busy}
                            onClick={() => {
                                setEditing(false);
                                setText(quote.text);
                            }}
                        >
                            Huỷ
                        </Button>
                    </>
                ) : (
                    <>
                        <Button variant="primary" disabled={busy} onClick={() => onReview('approve')}>
                            Duyệt
                        </Button>
                        <Button disabled={busy} onClick={() => setEditing(true)}>
                            Sửa
                        </Button>
                        <Button disabled={busy} onClick={() => onReview('reject')}>
                            Loại
                        </Button>
                    </>
                )}
            </div>
        </Card>
    );
}
