'use client';

import { useState } from 'react';
import { Flame, Hand, HeartHandshake } from 'lucide-react';
import { CHEER_KINDS, CHEER_LABEL, cheerSend, teamLine, type CheerKind, type CheersToday, type TeamWeek } from '../lib/cheers';

const ICON: Record<CheerKind, React.ReactNode> = {
    fire: <Flame className="w-4 h-4" />,
    clap: <Hand className="w-4 h-4" />,
    muscle: <HeartHandshake className="w-4 h-4" />,
};

/** The group's week as a ring: goal days reached by all members out of 5 each. */
export function TeamCard({ team, me }: { team: TeamWeek; me: string }) {
    const R = 34;
    const C = 2 * Math.PI * R;
    return (
        <section className={`rounded-2xl border p-4 ${team.reached ? 'border-accent/40 bg-accent/5' : 'border-line bg-surface'}`}>
            <h2 className="font-semibold text-ink">Nhóm tuần này</h2>
            <div className="mt-3 flex items-center gap-4">
                <svg viewBox="0 0 80 80" className="w-20 h-20 shrink-0 -rotate-90" role="img" aria-label={`${team.done} trên ${team.goal} ngày đạt mục tiêu`}>
                    <circle cx="40" cy="40" r={R} fill="none" strokeWidth="8" className="stroke-surface-3" />
                    <circle cx="40" cy="40" r={R} fill="none" strokeWidth="8" strokeLinecap="round" className="stroke-accent transition-all duration-500" strokeDasharray={C} strokeDashoffset={C * (1 - team.share)} />
                </svg>
                <div className="min-w-0 flex-1">
                    <p className="font-mono text-2xl text-ink">
                        {team.done}
                        <span className="text-muted text-base">/{team.goal} ngày</span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted">{teamLine(team)}</p>
                </div>
            </div>
            <ul className="mt-3 flex flex-wrap gap-1.5">
                {team.members.map((m) => (
                    <li key={m.id} className={`rounded-full border px-2.5 py-1 text-xs ${m.today ? 'border-accent/50 text-accent' : 'border-line text-ink-2'}`}>
                        {m.id === me ? 'Bạn' : m.name} · {Math.min(m.days, 5)}/5
                    </li>
                ))}
            </ul>
        </section>
    );
}

/** Cheers I got today, as a small banner. */
export function CheersBanner({ cheers }: { cheers: CheersToday | null }) {
    if (!cheers || cheers.received.length === 0) return null;
    return (
        <section className="rounded-2xl border border-accent/40 bg-accent/5 p-3 text-sm text-ink">
            {cheers.received.map((c) => (
                <p key={c.from_id} className="flex items-center gap-2">
                    <span className="text-accent">{ICON[c.kind]}</span>
                    <span>
                        <b>{c.from_name ?? 'Bạn học'}</b> cổ vũ bạn: {CHEER_LABEL[c.kind]}
                    </span>
                </p>
            ))}
        </section>
    );
}

/** Three one-tap cheers for a buddy, one a day. */
export function CheerButtons({ buddyId, sent, onSent }: { buddyId: string; sent: CheerKind | undefined; onSent: (kind: CheerKind) => void }) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    return (
        <div className="flex items-center gap-1" aria-label="Cổ vũ">
            {CHEER_KINDS.map((k) => (
                <button
                    key={k}
                    disabled={busy}
                    title={CHEER_LABEL[k]}
                    aria-label={`Cổ vũ: ${CHEER_LABEL[k]}`}
                    aria-pressed={sent === k}
                    onClick={async () => {
                        setBusy(true);
                        try {
                            setError('');
                            await cheerSend(buddyId, k);
                            onSent(k);
                        } catch (e) {
                            setError(e instanceof Error ? e.message : String(e));
                        } finally {
                            setBusy(false);
                        }
                    }}
                    className={`h-9 w-9 rounded-lg border flex items-center justify-center ${sent === k ? 'border-accent bg-accent/10 text-accent' : 'border-line text-ink-2 hover:border-line-strong'}`}
                >
                    {ICON[k]}
                </button>
            ))}
            {error && <span className="ml-1 text-xs text-danger">{error}</span>}
        </div>
    );
}
