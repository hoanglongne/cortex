'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Check } from 'lucide-react';
import type { Board } from '@cortex/classroom';
import type { Forecast, ForecastAction } from '@cortex/classroom-lexica';
import { Badge, Button, CopyChip, DoneButton, errorText } from './ui';
import { api } from '../lib/supabase';
import { localDay, reviewAssignment } from '../lib/forecasts';
import { parentMessage } from '../lib/today';
import { moduleFor } from '../modules';

/** How sure and how pressing, in words; colour only for "cần làm ngay" and "tốt". */
const URGENCY: Record<Forecast['urgency'], { label: string; className: string }> = {
    urgent: { label: 'Cần làm ngay', className: 'text-warm' },
    watch: { label: 'Nên để ý', className: 'text-muted' },
    good: { label: 'Tốt', className: 'text-accent-strong' },
    info: { label: 'Dự báo', className: 'text-muted' },
};

/** "Vì sao?": the numbers the forecast rests on, and advice the teacher can pass on. */
export function Why({ forecast, open }: { forecast: Forecast; open: boolean }) {
    if (!open) return null;
    const advice = forecast.actions.filter((a): a is Extract<ForecastAction, { kind: 'advice' }> => a.kind === 'advice');
    return (
        <div className="mt-4 border-l-2 border-line-strong pl-4 text-[15px] text-ink-2">
            <ul className="space-y-1">
                {forecast.why.map((w) => (
                    <li key={w}>{w}</li>
                ))}
            </ul>
            {advice.map((a) => (
                <p key={a.text} className="mt-2 text-ink">
                    Gợi ý: {a.text}
                </p>
            ))}
        </div>
    );
}

/**
 * A forecast's buttons: give the words back as a review (one tap), copy a
 * message for the student, the parent or a praise. The first one is the
 * row's main action; the rest are secondary.
 */
export function ForecastActions({ forecast, board, userId, onAssigned }: { forecast: Forecast; board: Board; userId: string; onAssigned?: () => void }) {
    const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle');
    const [error, setError] = useState('');
    const student = board.students.find((s) => s.user_id === userId);
    const actions = forecast.actions.filter((a) => a.kind !== 'advice');
    if (!student || actions.length === 0) return null;
    return (
        <>
            {actions.map((a, i) => {
                const primary = i === 0;
                if (a.kind === 'assign_review') {
                    return state === 'done' ? (
                        <Badge key={i} tone="accent">
                            <Check className="h-3.5 w-3.5" /> Đã giao ôn lại {a.cardIds.length} từ
                        </Badge>
                    ) : (
                        <Button
                            key={i}
                            size="sm"
                            kind={primary ? 'primary' : 'secondary'}
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
                if (a.kind === 'message') return <CopyChip key={i} primary={primary} text={a.text} label="Chép tin nhắn cho em" />;
                if (a.kind === 'praise') return <CopyChip key={i} primary={primary} text={a.text} label="Chép lời khen" />;
                if (a.kind === 'parent') return <CopyChip key={i} primary={primary} text={parentMessage(student, board, moduleFor)} label="Chép tin cho phụ huynh" />;
                return null;
            })}
            {error && <span className="text-[15px] text-danger">{error}</span>}
        </>
    );
}

/**
 * One forecast. `card`: a to-do on its own white card (Hôm nay, "cần làm
 * ngay"); `row`: a line inside a shared card. With `who` (a student's name
 * and class) it links to the student; without it, it sits on their page.
 */
export function ForecastBlock({
    forecast,
    board,
    userId,
    onAssigned,
    onDone,
    who,
    note,
    variant = 'row',
}: {
    forecast: Forecast;
    board: Board;
    userId: string;
    onAssigned?: () => void;
    onDone?: () => void;
    who?: { name: string; className: string };
    /** One more fact from outside the forecast (lessons missed in class). */
    note?: string;
    variant?: 'card' | 'row';
}) {
    const [open, setOpen] = useState(false);
    const u = URGENCY[forecast.urgency];
    const body = (
        <div className="flex gap-4">
            {onDone && <DoneButton onClick={onDone} />}
            <div className="min-w-0 flex-1">
                {who ? (
                    <p className="text-[17px] text-ink">
                        <b className="font-semibold">{who.name}</b>
                        <span className="text-[15px] text-muted"> · {who.className}</span>
                    </p>
                ) : (
                    <p className={`text-[13px] font-semibold uppercase tracking-[0.06em] ${u.className}`}>{u.label}</p>
                )}
                <p className={who ? 'mt-1 text-ink-2' : 'mt-1 text-[17px] font-medium text-ink'}>{forecast.title}</p>
                {note && <p className="mt-1 font-medium text-warm">{note}</p>}
                <Why forecast={forecast} open={open} />
                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <ForecastActions forecast={forecast} board={board} userId={userId} onAssigned={onAssigned} />
                    <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="px-1 text-[15px] text-accent-strong hover:underline">
                        {open ? 'Ẩn lý do' : 'Vì sao?'}
                    </button>
                    {who && (
                        <Link prefetch={false} href={`/classes/${board.class.id}/students/${userId}`} className="px-1 text-[15px] text-accent-strong hover:underline">
                            Xem em
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
    if (variant === 'card') return <div className="rounded-[var(--radius-card)] bg-surface p-6 shadow-[var(--shadow-card)] sm:p-7">{body}</div>;
    return <div className="py-5">{body}</div>;
}
