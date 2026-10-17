'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { buildSummary, coverageText, findSummary, quoteError, type BuildResult, type FindResult } from '../lib/quotes';
import { Badge, Button, Card, ErrorNote, Textarea } from '../components/ui';

/**
 * "Ngoài đời": real quotes that contain a card's word. The machine finds them
 * (book lines from the public-domain corpus, headlines from the RSS feeds,
 * every night); the editor only approves, edits or rejects. Song lines are
 * still added by hand.
 */

type Kind = 'book' | 'news' | 'song';
type Status = 'pending' | 'approved' | 'rejected';
const KIND_LABEL: Record<Kind, string> = { book: 'Sách', news: 'Báo', song: 'Bài hát' };
const TABS: { id: Status; label: string }[] = [
    { id: 'pending', label: 'Chờ duyệt' },
    { id: 'approved', label: 'Đã duyệt' },
    { id: 'rejected', label: 'Đã loại' },
];
const PAGE = 30;

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
    status: Status;
    published_at: string | null;
}

interface Stats {
    cards: number;
    covered: number;
    pending: number;
    approved: number;
    rejected: number;
    unpublished: number;
    searched: number;
    corpus: { books: number; built: number; sentences: number; failed: { id: string; error: string }[] };
}

interface CardHit {
    id: string;
    word: string;
}

const EMPTY_FORM = { kind: 'news' as Kind, text: '', source: '', url: '', translation: '', youtube: '', start: '', end: '' };

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/** "1:23" or "83" → seconds; NaN when unreadable. */
function seconds(v: string): number {
    const m = /^(\d+):(\d{1,2})$/.exec(v.trim());
    return m ? Number(m[1]) * 60 + Number(m[2]) : Number(v.trim() || NaN);
}

const INPUT = 'rounded-lg border border-line bg-surface px-3 py-2';

export default function QuotesPage() {
    const [tab, setTab] = useState<Status>('pending');
    const [list, setList] = useState<Quote[]>([]);
    const [more, setMore] = useState(false);
    const [stats, setStats] = useState<Stats | null>(null);
    const [busy, setBusy] = useState('');
    const [error, setError] = useState('');
    const [note, setNote] = useState('');

    const load = useCallback(async (status: Status) => {
        try {
            const [rows, s] = await Promise.all([api<Quote[]>(`/quotes?status=${status}&limit=${PAGE}`), api<Stats>('/quotes/stats')]);
            setList(rows);
            setMore(rows.length === PAGE);
            setStats(s);
        } catch (err) {
            setError(quoteError(err));
        }
    }, []);

    useEffect(() => {
        const t = setTimeout(() => void load(tab), 0);
        return () => clearTimeout(t);
    }, [load, tab]);

    const loadMore = async () => {
        try {
            const rows = await api<Quote[]>(`/quotes?status=${tab}&limit=${PAGE}&offset=${list.length}`);
            setList([...list, ...rows]);
            setMore(rows.length === PAGE);
        } catch (err) {
            setError(quoteError(err));
        }
    };

    const run = async (label: string, fn: () => Promise<string | void>) => {
        setBusy(label);
        setError('');
        setNote('');
        try {
            const msg = await fn();
            if (msg) setNote(msg);
            await load(tab);
        } catch (err) {
            setError(quoteError(err));
        } finally {
            setBusy('');
        }
    };

    const buildCorpus = () => run('build', async () => buildSummary(await api<BuildResult>('/quotes/build-corpus', { method: 'POST', body: { books: 6 } })));
    const find = () => run('find', async () => findSummary(await api<FindResult>('/quotes/find', { method: 'POST', body: { limit: 50 } })));
    const publish = () =>
        run('publish', async () => {
            const r = await api<{ variants: number; quotes: number; cards: number }>('/variants/publish', { method: 'POST' });
            return `Đã xuất bản ${r.quotes} câu trích và ${r.variants} câu theo hình mẫu, cho ${r.cards} thẻ.`;
        });
    const review = (q: Quote, action: 'approve' | 'reject', text?: string) =>
        run(q.id, async () => {
            await api(`/quotes/${q.id}/${action}`, { method: 'POST', body: text !== undefined ? { text } : {} });
        });

    const corpusReady = (stats?.corpus.built ?? 0) > 0;

    return (
        <div className="flex flex-col gap-4">
            <Card>
                <p className="text-sm text-ink-2">
                    Câu trích thật có chứa từ của thẻ, hiện ở mặt sau thẻ trong Lexica. Máy tự tìm mỗi đêm: câu trong sách hết bản quyền (kho câu dựng sẵn) và tiêu đề báo từ các
                    nguồn RSS. Bạn chỉ cần duyệt. Bài hát thì thêm tay.
                </p>
                {stats && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3" data-testid="quote-stats">
                        <Stat label="Độ phủ" value={coverageText(stats.covered, stats.cards)} />
                        <Stat label="Chưa xuất bản" value={`${stats.unpublished} thay đổi`} tone={stats.unpublished > 0 ? 'warning' : undefined} />
                        <Stat label="Kho câu" value={`${stats.corpus.built}/${stats.corpus.books} sách · ${stats.corpus.sentences.toLocaleString('vi-VN')} câu`} />
                        <Stat label="Đã tìm" value={`${stats.searched}/${stats.cards} thẻ`} />
                    </div>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant={corpusReady ? 'secondary' : 'primary'} onClick={buildCorpus} disabled={!!busy || (!!stats && stats.corpus.built >= stats.corpus.books)}>
                        {busy === 'build' ? 'Đang tải sách…' : 'Dựng kho câu (6 sách)'}
                    </Button>
                    <Button variant={corpusReady ? 'primary' : 'secondary'} onClick={find} disabled={!!busy || !corpusReady} title={corpusReady ? undefined : 'Dựng kho câu trước'}>
                        {busy === 'find' ? 'Đang tìm…' : 'Tìm câu (50 thẻ)'}
                    </Button>
                    <Button onClick={publish} disabled={!!busy || stats?.unpublished === 0}>
                        {busy === 'publish' ? 'Đang xuất bản…' : `Xuất bản${stats?.unpublished ? ` (${stats.unpublished})` : ''}`}
                    </Button>
                </div>
                {stats && stats.corpus.failed.length > 0 && (
                    <p className="mt-3 text-xs text-warning">
                        {stats.corpus.failed.length} sách chưa dựng được lần trước, sẽ thử lại ở lần dựng sau.
                    </p>
                )}
                {note && <p className="mt-3 text-sm text-accent">{note}</p>}
            </Card>

            <AddQuote busy={!!busy} onAdd={(body) => run('add', async () => {
                await api('/quotes', { method: 'POST', body });
                return 'Đã thêm, chờ duyệt.';
            })} />

            <ErrorNote error={error} />

            <div className="flex gap-1 border-b border-line" role="tablist">
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        role="tab"
                        aria-selected={tab === t.id}
                        onClick={() => {
                            setList([]);
                            setTab(t.id);
                        }}
                        className={`px-3 py-2 text-sm -mb-px border-b-2 ${tab === t.id ? 'border-accent text-ink' : 'border-transparent text-muted hover:text-ink'}`}
                    >
                        {t.label}
                        {stats && <span className="ml-1.5 font-mono text-[11px] text-subtle">{stats[t.id]}</span>}
                    </button>
                ))}
            </div>

            {list.length === 0 && (
                <p className="text-sm text-muted">
                    {tab === 'pending' ? (corpusReady ? 'Không có câu nào chờ duyệt. Bấm "Tìm câu" để tìm thêm.' : 'Chưa có kho câu. Bấm "Dựng kho câu" để bắt đầu.') : 'Chưa có câu nào.'}
                </p>
            )}
            {list.map((q) => (
                <QuoteRow key={q.id} quote={q} busy={busy === q.id} onReview={(a, t) => review(q, a, t)} />
            ))}
            {more && (
                <Button onClick={() => void loadMore()} disabled={!!busy}>
                    Xem thêm
                </Button>
            )}
        </div>
    );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'warning' }) {
    return (
        <div className="rounded-xl bg-surface-2 px-3 py-2">
            <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">{label}</p>
            <p className={`mt-0.5 text-sm ${tone === 'warning' ? 'text-warning' : 'text-ink'}`}>{value}</p>
        </div>
    );
}

/** Hand-added quote; the card is picked by typing its word. */
function AddQuote({ busy, onAdd }: { busy: boolean; onAdd: (body: Record<string, unknown>) => Promise<void> }) {
    const [card, setCard] = useState<CardHit | null>(null);
    const [query, setQuery] = useState('');
    const [hits, setHits] = useState<CardHit[]>([]);
    const [searchError, setSearchError] = useState('');
    const [form, setForm] = useState(EMPTY_FORM);

    useEffect(() => {
        if (card || query.trim().length < 2) return;
        const t = setTimeout(async () => {
            try {
                setHits(await api<CardHit[]>(`/cards/search?q=${encodeURIComponent(query.trim())}`));
                setSearchError('');
            } catch (err) {
                setSearchError(quoteError(err));
            }
        }, 250);
        return () => clearTimeout(t);
    }, [query, card]);

    const set = (key: keyof typeof EMPTY_FORM) => (e: { target: { value: string } }) => setForm({ ...form, [key]: e.target.value });

    const submit = async () => {
        if (!card) return;
        const { youtube, start, end, ...rest } = form;
        const clip = form.kind === 'song' && youtube.trim() ? { youtube, start: seconds(start), end: seconds(end) } : {};
        await onAdd({ card_id: card.id, ...rest, ...clip });
        setForm({ ...EMPTY_FORM, kind: form.kind });
    };

    return (
        <Card>
            <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">Thêm câu tay</p>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div className="relative">
                    {card ? (
                        <div className={`${INPUT} flex items-center gap-2`}>
                            <span className="font-bold lowercase text-ink">{card.word}</span>
                            <span className="font-mono text-[11px] text-subtle">{card.id}</span>
                            <button type="button" className="ml-auto text-xs text-muted hover:text-ink" onClick={() => { setCard(null); setQuery(''); setHits([]); }}>
                                Đổi thẻ
                            </button>
                        </div>
                    ) : (
                        <input className={`w-full ${INPUT}`} placeholder="Gõ từ của thẻ (vd: abundant)" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Tìm thẻ theo từ" />
                    )}
                    {!card && query.trim().length >= 2 && (hits.length > 0 || searchError) && (
                        <ul className="absolute z-10 mt-1 w-full rounded-lg border border-line bg-surface shadow-lg">
                            {searchError && <li className="px-3 py-2 text-xs text-danger">{searchError}</li>}
                            {hits.map((h) => (
                                <li key={h.id}>
                                    <button type="button" className="w-full px-3 py-2 text-left hover:bg-surface-2 flex gap-2" onClick={() => { setCard(h); setHits([]); }}>
                                        <span className="lowercase text-ink">{h.word}</span>
                                        <span className="ml-auto font-mono text-[11px] text-subtle">{h.id}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <select className={INPUT} value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as Kind })}>
                    {(Object.keys(KIND_LABEL) as Kind[]).map((k) => (
                        <option key={k} value={k}>
                            {KIND_LABEL[k]}
                        </option>
                    ))}
                </select>
                <Textarea className="sm:col-span-2 w-full" rows={2} placeholder="Câu trích (chứa từ của thẻ)" value={form.text} onChange={set('text')} />
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
                <Button onClick={() => void submit()} disabled={busy || !card || !form.text || !form.source}>
                    Thêm
                </Button>
            </div>
        </Card>
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
                {quote.status === 'approved' && !quote.published_at && <Badge tone="warning">Chưa xuất bản</Badge>}
                <span className="ml-auto font-mono text-[11px] text-subtle">{quote.card_id}</span>
            </div>
            {editing ? <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} className="mt-2 w-full" /> : <p className="mt-2 text-sm text-ink-2">{quote.text}</p>}
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
                        {quote.status !== 'approved' && (
                            <Button variant="primary" disabled={busy} onClick={() => onReview('approve')}>
                                Duyệt
                            </Button>
                        )}
                        <Button disabled={busy} onClick={() => setEditing(true)}>
                            Sửa
                        </Button>
                        {quote.status !== 'rejected' && (
                            <Button disabled={busy} onClick={() => onReview('reject')}>
                                Loại
                            </Button>
                        )}
                    </>
                )}
            </div>
        </Card>
    );
}
