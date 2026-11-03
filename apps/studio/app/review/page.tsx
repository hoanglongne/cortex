'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, Check, Pencil, SkipForward, Undo2, X } from 'lucide-react';
import { api, ApiError, errorText } from '../lib/api';
import { interleave, loadPending, minutesLeft, REVIEW_TYPES, TYPE_LABEL, type ReviewItem, type ReviewType } from '../lib/review';
import Scenario from '../components/Scenario';
import { Badge, Button, ErrorNote, Input, Label, Select, Textarea } from '../components/ui';

/** Page sizes the server returns: a full page means there may be more. */
const FULL: Record<ReviewType, number> = { drafts: 30, variants: 20, quotes: 30, passages: 15, talk: 20, filtered: 30 };

type Mode = 'view' | 'edit' | 'reject';

export default function ReviewPage() {
    return (
        <Suspense fallback={<p className="text-muted">Đang tải…</p>}>
            <Review />
        </Suspense>
    );
}

function Review() {
    const params = useSearchParams();
    const asked = params.get('type') as ReviewType | null;
    const [filter, setFilter] = useState<ReviewType | 'all'>(asked && asked in TYPE_LABEL ? asked : 'all');
    const [all, setAll] = useState<ReviewItem[]>([]);
    const [loaded, setLoaded] = useState<Partial<Record<ReviewType, number>>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mode, setMode] = useState<Mode>('view');
    const [busy, setBusy] = useState(false);
    const [history, setHistory] = useState<{ item: ReviewItem; action: 'approve' | 'reject' }[]>([]);
    const [stats, setStats] = useState({ done: 0, ms: 0 });
    const shownAt = useRef(0);

    const queue = useMemo(() => (filter === 'all' ? all.filter(i => i.type !== 'filtered') : all.filter(i => i.type === filter)), [all, filter]);

    /** Loads one kind and puts its items in the queue (replacing that kind's old ones). */
    const load = useCallback(async (type: ReviewType) => {
        try {
            const items = await loadPending(type);
            setLoaded(l => ({ ...l, [type]: items.length }));
            setAll(prev => {
                const others = prev.filter(i => i.type !== type);
                const mine = prev.filter(i => i.type === type);
                // Keep an item the editor already has open at the front of its kind
                const seen = new Set(mine.map(i => i.key));
                return [...others, ...mine.filter(i => items.some(n => n.key === i.key)), ...items.filter(i => !seen.has(i.key))];
            });
        } catch (err) {
            setError(`${TYPE_LABEL[type]}: ${errorText(err)}`);
        }
    }, []);

    useEffect(() => {
        let live = true;
        void Promise.all(REVIEW_TYPES.map(t => load(t))).then(() => live && setLoading(false));
        return () => {
            live = false;
        };
    }, [load]);

    useEffect(() => {
        if (filter === 'filtered' && loaded.filtered === undefined) void load('filtered');
    }, [filter, loaded.filtered, load]);

    // A kind ran out but the server had a full page: fetch the next one.
    useEffect(() => {
        if (loading) return;
        for (const t of [...REVIEW_TYPES, 'filtered' as const]) {
            if ((loaded[t] ?? 0) >= FULL[t] && !all.some(i => i.type === t)) void load(t);
        }
    }, [all, loaded, loading, load]);

    // Order the "all" view so kinds take turns
    const ordered = useMemo(() => {
        const by = REVIEW_TYPES.map(t => queue.filter(i => i.type === t));
        return filter === 'all' ? interleave(by) : queue;
    }, [queue, filter]);
    const shown = ordered[0];

    useEffect(() => {
        shownAt.current = performance.now();
        setMode('view');
    }, [shown?.key]);

    const counts = useMemo(() => {
        const c: Partial<Record<ReviewType, number>> = {};
        for (const i of all) c[i.type] = (c[i.type] ?? 0) + 1;
        return c;
    }, [all]);
    const total = REVIEW_TYPES.reduce((n, t) => n + (counts[t] ?? 0), 0);

    const record = () => setStats(s => ({ done: s.done + 1, ms: s.ms + (performance.now() - shownAt.current) }));

    /** The next item shows at once; the request runs in the background and the item comes back if it fails. */
    const decide = useCallback((item: ReviewItem, action: 'approve' | 'reject', reason?: string) => {
        setError('');
        setAll(a => a.filter(i => i.key !== item.key));
        setHistory(h => [...h, { item, action }]);
        record();
        item.send(action, undefined, reason).catch((err: unknown) => {
            setAll(a => (a.some(i => i.key === item.key) ? a : [item, ...a]));
            setHistory(h => h.filter(x => x.item.key !== item.key));
            setStats(s => ({ ...s, done: Math.max(0, s.done - 1) }));
            setError(`${item.title}: ${errorText(err)}`);
        });
    }, []);

    const saveEdit = async (item: ReviewItem, values: Record<string, string>) => {
        setBusy(true);
        setError('');
        try {
            await item.send('approve', values);
            setAll(a => a.filter(i => i.key !== item.key));
            record();
        } catch (err) {
            setError(err instanceof ApiError ? errorText(err) : errorText(err));
        } finally {
            setBusy(false);
        }
    };

    const skip = (item: ReviewItem) => setAll(a => (a.length < 2 ? a : [...a.filter(i => i.key !== item.key), item]));

    const undo = async () => {
        const last = history[history.length - 1];
        if (!last || last.item.type !== 'drafts') return;
        setBusy(true);
        try {
            await api(`/drafts/${last.item.id}/reset`, { method: 'POST' });
            setAll(a => [last.item, ...a]);
            setHistory(h => h.slice(0, -1));
        } catch (err) {
            setError(errorText(err));
        } finally {
            setBusy(false);
        }
    };

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (busy || mode === 'edit') return;
            const el = e.target;
            if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) return;
            if (e.metaKey || e.ctrlKey || e.altKey || !shown) return;
            const k = e.key.toLowerCase();
            if (mode === 'reject') {
                const n = Number(e.key);
                if (shown.reasons && n >= 1 && n <= shown.reasons.length) decide(shown, 'reject', shown.reasons[n - 1]);
                else if (e.key === 'Escape') setMode('view');
                return;
            }
            if ((k === 'a' || e.key === 'ArrowRight') && shown.canApprove) decide(shown, 'approve');
            else if (k === 'r' || e.key === 'ArrowLeft') {
                if (shown.reasons) setMode('reject');
                else decide(shown, 'reject');
            }
            else if (k === 'e') {
                e.preventDefault();
                setMode('edit');
            } else if (k === 's') skip(shown);
            else if (k === 'z') void undo();
            else return;
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [busy, mode, shown, decide, history]);

    // Start from 12 s per item and move toward this editor's real pace as decisions come in
    const avg = (12 * 5 + stats.ms / 1000) / (5 + stats.done);
    const lastIsDraft = history[history.length - 1]?.item.type === 'drafts';

    return (
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
            <div className="flex flex-wrap items-center gap-1.5">
                <Chip active={filter === 'all'} onClick={() => setFilter('all')} label="Tất cả" count={total} />
                {REVIEW_TYPES.map(t => (
                    <Chip key={t} active={filter === t} onClick={() => setFilter(t)} label={TYPE_LABEL[t]} count={counts[t] ?? 0} />
                ))}
                <Chip active={filter === 'filtered'} onClick={() => setFilter('filtered')} label={TYPE_LABEL.filtered} count={loaded.filtered === undefined ? undefined : (counts.filtered ?? 0)} subtle />
            </div>

            <div className="flex items-center gap-3 font-mono text-xs text-muted">
                <span>
                    còn <span className="text-ink">{ordered.length}</span>
                    {ordered.length > 0 && <> · khoảng {minutesLeft(ordered.length, avg)} phút</>}
                    {stats.done > 0 && <> · đã duyệt {stats.done}</>}
                </span>
                {lastIsDraft && (
                    <Button variant="ghost" className="ml-auto" onClick={() => void undo()} disabled={busy}>
                        <span className="flex items-center gap-1.5">
                            <Undo2 className="h-4 w-4" /> Hoàn tác (Z)
                        </span>
                    </Button>
                )}
            </div>

            <ErrorNote error={error} />

            {loading ? (
                <p className="text-muted">Đang tải…</p>
            ) : !shown ? (
                <Done filter={filter} />
            ) : (
                <ItemCard
                    key={shown.key}
                    item={shown}
                    mode={mode}
                    busy={busy}
                    onApprove={() => decide(shown, 'approve')}
                    onAskReject={() => (shown.reasons ? setMode('reject') : decide(shown, 'reject'))}
                    onReject={reason => decide(shown, 'reject', reason)}
                    onEdit={() => setMode('edit')}
                    onSkip={() => skip(shown)}
                    onCancel={() => setMode('view')}
                    onSave={values => void saveEdit(shown, values)}
                />
            )}
        </div>
    );
}

function Chip({ label, count, active, onClick, subtle }: { label: string; count?: number; active: boolean; onClick: () => void; subtle?: boolean }) {
    return (
        <button
            onClick={onClick}
            className={`flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-sm transition-colors ${
                active ? 'border-ink bg-ink text-bg' : subtle ? 'border-dashed border-line text-subtle hover:text-ink' : 'border-line text-muted hover:bg-surface-2 hover:text-ink'
            }`}
        >
            {label}
            {count !== undefined && <span className="font-mono text-[11px] opacity-70">{count}</span>}
        </button>
    );
}

function Done({ filter }: { filter: ReviewType | 'all' }) {
    return (
        <div className="rounded-2xl border border-dashed border-line-strong p-10 text-center">
            <p className="text-lg font-bold text-ink">{filter === 'all' ? 'Hết việc duyệt' : `Hết ${TYPE_LABEL[filter].toLowerCase()} chờ duyệt`}</p>
            <p className="mt-1 text-sm text-muted">Làm gì tiếp?</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Link href="/publish" className="flex h-10 items-center rounded-xl bg-accent px-4 text-sm font-bold text-on-accent hover:bg-accent-strong">
                    Xuất bản
                </Link>
                <Link href="/create" className="flex h-10 items-center rounded-xl border border-line px-4 text-sm font-medium text-ink hover:bg-surface-2">
                    Tạo thêm nội dung
                </Link>
            </div>
        </div>
    );
}

function ItemCard({
    item,
    mode,
    busy,
    onApprove,
    onAskReject,
    onReject,
    onEdit,
    onSkip,
    onCancel,
    onSave,
}: {
    item: ReviewItem;
    mode: Mode;
    busy: boolean;
    onApprove: () => void;
    onAskReject: () => void;
    onReject: (reason: string) => void;
    onEdit: () => void;
    onSkip: () => void;
    onCancel: () => void;
    onSave: (values: Record<string, string>) => void;
}) {
    const [values, setValues] = useState(item.values);
    const set = (k: string, v: string) => setValues(x => ({ ...x, [k]: v }));
    const save = () => onSave(Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.trim()])));

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="accent">{TYPE_LABEL[item.type]}</Badge>
                    {item.badges.map(b => (
                        <span key={b} className="font-mono text-[11px] text-subtle">
                            {b}
                        </span>
                    ))}
                </div>
                <div>
                    <h2 className="text-2xl font-bold lowercase text-ink">{item.title}</h2>
                    {item.subtitle && <p className="mt-0.5 text-sm text-muted">{item.subtitle}</p>}
                </div>

                {mode === 'edit' ? (
                    <div
                        className="flex flex-col gap-3"
                        onKeyDown={e => {
                            if (e.key === 'Escape') onCancel();
                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save();
                        }}
                    >
                        {item.fields.map((f, i) => (
                            <label key={f.key} className="flex flex-col gap-1.5">
                                <Label>{f.label}</Label>
                                {f.options ? (
                                    <Select value={values[f.key]} onChange={e => set(f.key, e.target.value)}>
                                        {f.options.map(o => (
                                            <option key={o}>{o}</option>
                                        ))}
                                    </Select>
                                ) : f.multiline ? (
                                    <Textarea autoFocus={i === 0} rows={f.key === 'text' ? 8 : 3} value={values[f.key]} onChange={e => set(f.key, e.target.value)} />
                                ) : (
                                    <Input autoFocus={i === 0} value={values[f.key]} onChange={e => set(f.key, e.target.value)} />
                                )}
                            </label>
                        ))}
                        <div className="flex gap-2">
                            <Button variant="primary" onClick={save} disabled={busy}>
                                Lưu và duyệt (⌘/Ctrl+Enter)
                            </Button>
                            <Button onClick={onCancel} disabled={busy}>
                                Huỷ (Esc)
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {item.blocks.map(b => (
                            <div key={b.label}>
                                <Label>{b.label}</Label>
                                {b.target ? (
                                    <Scenario text={b.text} className={b.main ? 'mt-1 text-xl' : 'mt-1 text-sm'} />
                                ) : (
                                    <p className={`mt-1 whitespace-pre-line leading-relaxed ${b.main ? 'text-lg text-ink' : b.muted ? 'text-sm text-muted' : 'text-sm text-ink-2'}`}>{b.text}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {mode !== 'edit' && item.notes.length > 0 && (
                    <ul className="flex flex-col gap-1.5 border-t border-line pt-3">
                        {item.notes.map(n => (
                            <li key={n.text} className="flex items-start gap-2 text-sm">
                                {n.tone === 'ok' ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> : n.tone === 'bad' ? <X className="mt-0.5 h-4 w-4 shrink-0 text-danger" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />}
                                <span className={n.tone === 'ok' ? 'text-muted' : 'text-ink'}>
                                    {n.text}
                                    {n.detail && <span className="block font-mono text-[11px] text-subtle">{n.detail}</span>}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {mode === 'reject' && item.reasons ? (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-muted">Vì sao bỏ?</span>
                    {item.reasons.map((r, i) => (
                        <Button key={r} variant="danger" onClick={() => onReject(r)} disabled={busy}>
                            <span className="font-mono text-xs opacity-60">{i + 1}</span> {r}
                        </Button>
                    ))}
                    <Button variant="ghost" onClick={onCancel}>
                        Huỷ (Esc)
                    </Button>
                </div>
            ) : mode === 'view' ? (
                <div className="sticky bottom-4 flex flex-wrap gap-2 rounded-2xl border border-line bg-bg/95 p-2 backdrop-blur-sm">
                    <Button onClick={onAskReject} disabled={busy}>
                        <span className="flex items-center gap-1.5">
                            <X className="h-4 w-4" /> Bỏ (R)
                        </span>
                    </Button>
                    <Button onClick={onEdit} disabled={busy}>
                        <span className="flex items-center gap-1.5">
                            <Pencil className="h-4 w-4" /> Sửa (E)
                        </span>
                    </Button>
                    <Button onClick={onSkip} disabled={busy}>
                        <span className="flex items-center gap-1.5">
                            <SkipForward className="h-4 w-4" /> Để sau (S)
                        </span>
                    </Button>
                    {item.canApprove ? (
                        <Button variant="primary" className="ml-auto" onClick={onApprove} disabled={busy}>
                            <span className="flex items-center gap-1.5">
                                <Check className="h-4 w-4" /> Duyệt (A)
                            </span>
                        </Button>
                    ) : (
                        <span className="ml-auto self-center pr-2 text-xs text-warning">Sửa câu (E) rồi duyệt</span>
                    )}
                </div>
            ) : null}
        </div>
    );
}
