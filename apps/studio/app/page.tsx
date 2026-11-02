'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { Check, X, Pencil, SkipForward, Undo2, AlertTriangle } from 'lucide-react';
import { api, cached, ApiError, errorText } from './lib/api';
import { runBulk } from './lib/bulk';
import { decide, initQueue, restore, skip, undo, type QueueState } from './lib/queue';
import { LEVELS, RULE_LABELS, type Draft, type Level, type RuleResult } from './lib/types';
import Scenario from './components/Scenario';
import { Badge, Button, ErrorNote, Input, Label, Select, Textarea } from './components/ui';

const REASONS = ['cringe', 'sai nghĩa', 'nhạy cảm', 'trend cũ', 'khác'];
type Tab = 'pending' | 'rejected_auto';
type Mode = 'view' | 'reject' | 'edit';

/** A page of drafts: small enough to load fast, refilled when the queue runs out. */
const PAGE = 30;
const PENDING = `/drafts?status=pending&limit=${PAGE}`;

export default function InboxPage() {
    const [tab, setTab] = useState<Tab>('pending');
    const [queue, setQueue] = useState<QueueState<Draft>>(() => initQueue(cached<Draft[]>(PENDING) ?? []));
    const [loading, setLoading] = useState(() => !cached(PENDING));
    const [error, setError] = useState('');
    const [failed, setFailed] = useState<Record<string, RuleResult> | null>(null);
    const [mode, setMode] = useState<Mode>('view');
    const [busy, setBusy] = useState(false);
    const [stats, setStats] = useState({ approved: 0, rejected: 0, ms: 0 });
    const shownAt = useRef(0);
    const lastCount = useRef(0);

    const current = queue.items[0];

    const load = useCallback(async (t: Tab) => {
        const path = `/drafts?status=${t}&limit=${PAGE}`;
        const hit = cached<Draft[]>(path);
        if (hit) setQueue(initQueue(hit));
        setLoading(!hit);
        setError('');
        try {
            const fresh = await api<Draft[]>(path);
            lastCount.current = fresh.length;
            setQueue(initQueue(fresh));
        } catch (err) {
            setError(errorText(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load(tab);
    }, [tab, load]);

    // The page ran out but the server had more: fetch the next page.
    useEffect(() => {
        if (tab === 'pending' && !current && !loading && lastCount.current >= PAGE) void load(tab);
    }, [tab, current, loading, load]);

    useEffect(() => {
        shownAt.current = performance.now();
        setMode('view');
        setFailed(null);
    }, [current?.id]);

    const run = useCallback(async (fn: () => Promise<void>) => {
        setBusy(true);
        setError('');
        setFailed(null);
        try {
            await fn();
        } catch (err) {
            setError(errorText(err));
            if (err instanceof ApiError) {
                const validation = (err.body as { validation?: { rules?: Record<string, RuleResult> } } | null)?.validation;
                if (validation?.rules) setFailed(validation.rules);
            }
        } finally {
            setBusy(false);
        }
    }, []);

    const record = (kind: 'approved' | 'rejected') =>
        setStats(s => ({ ...s, [kind]: s[kind] + 1, ms: s.ms + (performance.now() - shownAt.current) }));

    /**
     * The next card shows at once; the request runs in the background and the
     * card comes back with the reason if it fails. Edits are checked first
     * because a rule failure must keep the editor open.
     */
    const decideNow = useCallback((item: Draft, action: 'approve' | 'reject', body: unknown) => {
        setError('');
        setQueue(q => decide(q, item.id, action));
        record(action === 'approve' ? 'approved' : 'rejected');
        api(`/drafts/${item.id}/${action}`, { method: 'POST', body }).catch((err: unknown) => {
            setQueue(q => restore(q, item));
            setStats(s => ({ ...s, [action === 'approve' ? 'approved' : 'rejected']: Math.max(0, s[action === 'approve' ? 'approved' : 'rejected'] - 1) }));
            setError(errorText(err));
            if (err instanceof ApiError) {
                const validation = (err.body as { validation?: { rules?: Record<string, RuleResult> } } | null)?.validation;
                if (validation?.rules) setFailed(validation.rules);
            }
        });
    }, []);

    const approve = useCallback(
        (edits?: { scenario: string; translationHint: string; level: Level }) => {
            if (!current) return;
            if (!edits) return decideNow(current, 'approve', {});
            return run(async () => {
                await api(`/drafts/${current.id}/approve`, { method: 'POST', body: edits });
                record('approved');
                setQueue(q => decide(q, current.id, 'approve'));
            });
        },
        [current, run, decideNow],
    );

    const reject = useCallback(
        (reason: string) => {
            if (current) decideNow(current, 'reject', { reason });
        },
        [current, decideNow],
    );

    const undoLast = useCallback(
        () =>
            run(async () => {
                const u = undo(queue);
                if (!u) return;
                await api(`/drafts/${u.item.id}/reset`, { method: 'POST' });
                setQueue(u.state);
            }),
        [queue, run],
    );

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (busy || mode === 'edit') return;
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if (e.key === 'z' || e.key === 'Z') return void undoLast();
            if (!current) return;
            if (mode === 'reject') {
                const n = Number(e.key);
                if (n >= 1 && n <= REASONS.length) void reject(REASONS[n - 1]);
                if (e.key === 'Escape') setMode('view');
                return;
            }
            if (e.key === 'ArrowRight' || e.key === 'a' || e.key === 'A') void approve();
            else if (e.key === 'ArrowLeft' || e.key === 'r' || e.key === 'R') setMode('reject');
            else if (e.key === 'e' || e.key === 'E') {
                e.preventDefault();
                setMode('edit');
            } else if (e.key === 's' || e.key === 'S') setQueue(q => skip(q, current.id));
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [busy, mode, current, approve, reject, undoLast]);

    // One passing sentence per word and trend: its siblings are not needed once one is approved
    const quick = (() => {
        const seen = new Set<string>();
        return queue.items.filter(d => {
            if (!d.validation.ok || d.warnings.length > 0) return false;
            const key = `${d.trend_id}:${d.word}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    })();
    const [quickBusy, setQuickBusy] = useState('');
    const approveQuick = async () => {
        setError('');
        setQuickBusy(`0/${quick.length}`);
        const r = await runBulk(
            quick.map(d => d.id),
            id => api(`/drafts/${id}/approve`, { method: 'POST', body: {} }),
            n => setQuickBusy(`${n}/${quick.length}`),
        );
        setQuickBusy('');
        for (const id of r.done) {
            setQueue(q => decide(q, id, 'approve'));
            record('approved');
        }
        if (r.failed.length) setError(`Lỗi ${r.failed.length}: ${r.failed[0].error}`);
    };

    const reviewed = stats.approved + stats.rejected;

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex rounded-xl bg-surface border border-line p-1">
                    {(['pending', 'rejected_auto'] as Tab[]).map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`h-8 px-3 rounded-lg text-sm font-medium ${tab === t ? 'bg-surface-3 text-ink' : 'text-muted hover:text-ink'}`}
                        >
                            {t === 'pending' ? 'Chờ duyệt' : 'Bị lọc tự động'}
                        </button>
                    ))}
                </div>
                <span className="font-mono text-xs text-muted">
                    còn <span className="text-ink">{queue.items.length}</span> · đã duyệt {reviewed}
                    {reviewed > 0 && (
                        <>
                            {' '}· nhận {Math.round((stats.approved / reviewed) * 100)}% · {(stats.ms / reviewed / 1000).toFixed(1)}s/thẻ
                        </>
                    )}
                </span>
                {tab === 'pending' && quick.length > 1 && (
                    <Button className="ml-auto" onClick={() => void approveQuick()} disabled={busy || !!quickBusy}>
                        {quickBusy ? `Đang duyệt ${quickBusy}` : `Duyệt nhanh ${quick.length} thẻ đạt kiểm tra`}
                    </Button>
                )}
                <Button variant="ghost" className={quick.length > 1 && tab === 'pending' ? '' : 'ml-auto'} onClick={undoLast} disabled={busy || queue.history.length === 0}>
                    <span className="flex items-center gap-1.5">
                        <Undo2 className="w-4 h-4" /> Hoàn tác (Z)
                    </span>
                </Button>
            </div>

            <ErrorNote error={error} />

            {loading ? (
                <p className="text-muted">Đang tải…</p>
            ) : !current ? (
                <div className="rounded-2xl border border-dashed border-line-strong p-10 text-center text-muted">
                    Hết nháp. Vào <a href="/trends" className="text-accent">Trend</a> để thêm trend và sinh nháp mới.
                </div>
            ) : (
                <div className="grid md:grid-cols-[minmax(0,1fr)_260px] gap-5 items-start">
                    <div className="relative">
                        {queue.items[1] && (
                            <div className="absolute inset-x-3 -bottom-2 h-full rounded-2xl bg-surface/60 border border-line" aria-hidden />
                        )}
                        <AnimatePresence mode="popLayout">
                            <DraftCard
                                key={current.id}
                                draft={current}
                                mode={mode}
                                busy={busy}
                                onApprove={approve}
                                onAskReject={() => setMode('reject')}
                                onReject={reject}
                                onCancel={() => setMode('view')}
                            />
                        </AnimatePresence>
                    </div>
                    <Rules draft={current} failed={failed} />
                </div>
            )}

            {current && mode === 'view' && (
                <div className="flex flex-wrap gap-2">
                    <Button onClick={() => setMode('reject')} disabled={busy}>
                        <span className="flex items-center gap-1.5"><X className="w-4 h-4" /> Bỏ (← hoặc R)</span>
                    </Button>
                    <Button onClick={() => setMode('edit')} disabled={busy}>
                        <span className="flex items-center gap-1.5"><Pencil className="w-4 h-4" /> Sửa (E)</span>
                    </Button>
                    <Button onClick={() => setQueue(q => skip(q, current.id))} disabled={busy}>
                        <span className="flex items-center gap-1.5"><SkipForward className="w-4 h-4" /> Để sau (S)</span>
                    </Button>
                    <Button variant="primary" onClick={() => approve()} disabled={busy || current.status === 'rejected_auto'}>
                        <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> Duyệt (→ hoặc A)</span>
                    </Button>
                </div>
            )}
        </div>
    );
}

function DraftCard({
    draft,
    mode,
    busy,
    onApprove,
    onAskReject,
    onReject,
    onCancel,
}: {
    draft: Draft;
    mode: Mode;
    busy: boolean;
    onApprove: (edits?: { scenario: string; translationHint: string; level: Level }) => void;
    onAskReject: () => void;
    onReject: (reason: string) => void;
    onCancel: () => void;
}) {
    const [scenario, setScenario] = useState(draft.scenario);
    const [hint, setHint] = useState(draft.translation_hint);
    const [level, setLevel] = useState<Level>(draft.level);

    const onDragEnd = (_: unknown, info: PanInfo) => {
        if (busy || mode !== 'view') return;
        if (info.offset.x > 120) onApprove();
        else if (info.offset.x < -120) onAskReject();
    };

    const save = () => onApprove({ scenario: scenario.trim(), translationHint: hint.trim(), level });

    return (
        <motion.div
            drag={mode === 'view' ? 'x' : false}
            dragSnapToOrigin
            onDragEnd={onDragEnd}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 0, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="relative rounded-2xl bg-surface border border-line p-6 min-h-[320px] flex flex-col gap-5 cursor-grab active:cursor-grabbing"
        >
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-subtle">
                {draft.trend_label && <Badge tone="accent">{draft.trend_label}</Badge>}
                <span>{draft.level}</span>
                {draft.tone && <span>· {draft.tone}</span>}
                {draft.archetype && <span>· {draft.archetype}</span>}
                <span className="ml-auto">{draft.model}</span>
            </div>

            {mode === 'edit' ? (
                <div
                    className="flex flex-col gap-3"
                    onKeyDown={e => {
                        if (e.key === 'Escape') onCancel();
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save();
                    }}
                >
                    <label className="flex flex-col gap-1.5">
                        <Label>Câu (từ đích viết HOA)</Label>
                        <Textarea autoFocus rows={3} value={scenario} onChange={e => setScenario(e.target.value)} className="text-base" />
                        <span className="font-mono text-[11px] text-subtle">{scenario.trim().length}/160</span>
                    </label>
                    <div className="grid grid-cols-[1fr_auto] gap-3">
                        <label className="flex flex-col gap-1.5">
                            <Label>Nghĩa</Label>
                            <Input value={hint} onChange={e => setHint(e.target.value)} />
                        </label>
                        <label className="flex flex-col gap-1.5">
                            <Label>Level</Label>
                            <Select value={level} onChange={e => setLevel(e.target.value as Level)}>
                                {LEVELS.map(l => (
                                    <option key={l}>{l}</option>
                                ))}
                            </Select>
                        </label>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={onCancel}>Huỷ (Esc)</Button>
                        <Button variant="primary" onClick={save} disabled={busy}>
                            Lưu & duyệt (⌘/Ctrl+Enter)
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                    <Scenario text={draft.scenario} className="text-xl" />
                    <div className="mt-auto border-l-2 border-accent pl-4">
                        <p className="text-2xl font-bold tracking-tight">{draft.word}</p>
                        {draft.ipa && <p className="font-mono text-sm text-muted">/{draft.ipa}/</p>}
                        <p className="text-ink mt-1">{draft.translation_hint}</p>
                        {draft.collocations && draft.collocations.length > 0 && (
                            <p className="font-mono text-xs text-muted mt-1">Hay đi với: {draft.collocations.join(' · ')}</p>
                        )}
                    </div>
                </>
            )}

            {mode === 'reject' && (
                <div className="absolute inset-0 rounded-2xl bg-surface p-6 flex flex-col justify-center gap-3">
                    <p className="font-medium">Lý do bỏ?</p>
                    <div className="flex flex-wrap gap-2">
                        {REASONS.map((r, i) => (
                            <Button key={r} variant="danger" onClick={() => onReject(r)} disabled={busy}>
                                <span className="font-mono text-xs mr-1.5">{i + 1}</span>
                                {r}
                            </Button>
                        ))}
                    </div>
                    <Button variant="ghost" className="self-start" onClick={onCancel}>
                        Huỷ (Esc)
                    </Button>
                </div>
            )}
        </motion.div>
    );
}

function Rules({ draft, failed }: { draft: Draft; failed: Record<string, RuleResult> | null }) {
    const rules = failed ?? draft.validation.rules;
    return (
        <div className="rounded-2xl bg-surface border border-line p-4 flex flex-col gap-2">
            <Label>{failed ? 'Bản sửa chưa qua' : 'Kiểm tra tự động'}</Label>
            {Object.entries(rules).map(([name, r]) => (
                <div key={name} className="flex items-start gap-2 text-sm">
                    {r.pass ? (
                        <Check className="w-4 h-4 mt-0.5 text-accent shrink-0" />
                    ) : r.hard ? (
                        <X className="w-4 h-4 mt-0.5 text-danger shrink-0" />
                    ) : (
                        <AlertTriangle className="w-4 h-4 mt-0.5 text-warning shrink-0" />
                    )}
                    <span className={r.pass ? 'text-muted' : 'text-ink'}>
                        {RULE_LABELS[name] ?? name}
                        {r.detail && <span className="block font-mono text-[11px] text-subtle">{r.detail}</span>}
                    </span>
                </div>
            ))}
            {draft.status === 'rejected_auto' && !failed && (
                <p className="text-xs text-warning mt-1">Nháp bị lọc: sửa lại câu (E) để duyệt.</p>
            )}
        </div>
    );
}
