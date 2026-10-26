'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import type { Board } from '@cortex/classroom';
import type { Forecast, ForecastAction } from '@cortex/classroom-lexica';
import { Badge, Button, CopyChip, errorText } from './ui';
import { api } from '../lib/supabase';
import { localDay, reviewAssignment } from '../lib/forecasts';
import { parentMessage } from '../lib/today';
import { moduleFor } from '../modules';

const URGENCY: Record<Forecast['urgency'], { label: string; tone: 'warm' | 'neutral' | 'accent' | 'lilac' }> = {
    urgent: { label: 'Gấp', tone: 'warm' },
    watch: { label: 'Để ý', tone: 'neutral' },
    good: { label: 'Tốt', tone: 'accent' },
    info: { label: 'Dự báo', tone: 'lilac' },
};

/** "Vì sao?": the numbers the forecast rests on, and advice the teacher can pass on. */
export function Why({ forecast, open }: { forecast: Forecast; open: boolean }) {
    if (!open) return null;
    const advice = forecast.actions.filter((a): a is Extract<ForecastAction, { kind: 'advice' }> => a.kind === 'advice');
    return (
        <div className="mt-2 rounded-xl bg-surface-2 px-3 py-2 text-sm text-ink-2">
            <ul className="list-disc space-y-0.5 pl-4">
                {forecast.why.map((w) => (
                    <li key={w}>{w}</li>
                ))}
            </ul>
            {advice.map((a) => (
                <p key={a.text} className="mt-1.5 text-ink">
                    Gợi ý: {a.text}
                </p>
            ))}
        </div>
    );
}

/**
 * A forecast's buttons: give the words back as a review (one tap), copy a
 * message for the student, the parent or a praise, open the student's page.
 */
export function ForecastActions({ forecast, board, userId, onAssigned, showView = true }: { forecast: Forecast; board: Board; userId: string; onAssigned?: () => void; showView?: boolean }) {
    const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle');
    const [error, setError] = useState('');
    const student = board.students.find((s) => s.user_id === userId);
    const buttons = forecast.actions.some((a) => a.kind !== 'advice');
    if (!student || (!buttons && !showView)) return null;
    return (
        <div className="flex flex-wrap items-center gap-2">
            {forecast.actions.map((a, i) => {
                if (a.kind === 'assign_review') {
                    return state === 'done' ? (
                        <Badge key={i} tone="accent">
                            <Check className="h-3.5 w-3.5" /> Đã giao ôn lại {a.cardIds.length} từ
                        </Badge>
                    ) : (
                        <Button
                            key={i}
                            size="sm"
                            disabled={state === 'busy'}
                            onClick={async () => {
                                setState('busy');
                                setError('');
                                try {
                                    await api.assignTo(board.class.id, userId, reviewAssignment(a.cardIds, localDay(Date.now())));
                                    setState('done');
                                    onAssigned?.();
                                } catch (e) {
                                    setError(errorText(e));
                                    setState('idle');
                                }
                            }}
                        >
                            Giao ôn lại {a.cardIds.length} từ
                        </Button>
                    );
                }
                if (a.kind === 'message') return <CopyChip key={i} text={a.text} label="Nhắn em" />;
                if (a.kind === 'praise') return <CopyChip key={i} text={a.text} label="Khen em" />;
                if (a.kind === 'parent') return <CopyChip key={i} text={parentMessage(student, board, moduleFor)} label="Báo phụ huynh" />;
                return null;
            })}
            {showView && (
                <Link prefetch={false} href={`/classes/${board.class.id}/students/${userId}`} className="text-sm text-accent hover:underline">
                    Xem
                </Link>
            )}
            {error && <span className="text-sm text-danger">{error}</span>}
        </div>
    );
}

/** One forecast as a block: what, how sure, why, what to do. */
export function ForecastBlock({ forecast, board, userId, onAssigned, onDone, who }: { forecast: Forecast; board: Board; userId: string; onAssigned?: () => void; onDone?: () => void; who?: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const u = URGENCY[forecast.urgency];
    return (
        <div className="py-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="min-w-0 text-ink">
                    {who}
                    <span className={who ? 'text-ink-2' : 'font-medium'}>{forecast.title}</span>
                </p>
                <Badge tone={u.tone}>{u.label}</Badge>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
                <ForecastActions forecast={forecast} board={board} userId={userId} onAssigned={onAssigned} showView={Boolean(who)} />
                <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
                    Vì sao? <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
                {onDone && (
                    <button onClick={onDone} className="text-sm text-muted hover:text-ink" title="Ẩn việc này trong 7 ngày">
                        Đã xử lý
                    </button>
                )}
            </div>
            <Why forecast={forecast} open={open} />
        </div>
    );
}
