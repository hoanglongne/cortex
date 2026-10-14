'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Flame, Hammer, LayoutGrid, Sparkles, Swords } from 'lucide-react';
import { getCard } from '../lib/content/repository';
import { STATE_LABEL, type SessionState } from '../lib/engagement/session';

/**
 * End of a 10-card session: what moved, and a reason to do one more.
 * Sits where the card was, same size, so nothing else on the page shifts.
 */
export default function SessionRecap({
    session,
    readyToMint,
    nearest,
    teasers,
    onContinue,
}: {
    session: SessionState;
    readyToMint: number;
    nearest: { label: string; missing: number } | null;
    teasers: string[];
    onContinue: () => void;
}) {
    const dust = session.lucky.filter((l) => l.item === 'dust').reduce((n, l) => n + l.amount, 0);
    const boxes = session.lucky.filter((l) => l.item === 'box').reduce((n, l) => n + l.amount, 0);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute w-full top-1/2 -translate-y-1/2 px-2 sm:px-4"
        >
            <div className="h-[450px] sm:h-100 rounded-2xl bg-surface border border-line p-5 sm:p-6 flex flex-col">
                <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">Xong phiên</p>

                <div className="mt-3 grid grid-cols-3 gap-2 font-mono">
                    <Stat label="Đã nhớ" value={`${session.known}/${session.count}`} />
                    <Stat label="Từ mới" value={`+${session.newCards.length}`} />
                    <Stat label="Combo" value={`×${session.maxCombo}`} icon={session.maxCombo >= 5 ? <Flame className="w-3.5 h-3.5 text-accent" /> : null} />
                </div>

                <div className="mt-4 space-y-1.5 text-sm overflow-y-auto min-h-0 flex-1">
                    {session.levelUps.slice(0, 4).map((l) => (
                        <p key={l.cardId} className="flex items-center gap-2 text-ink-2">
                            <span className="font-bold text-ink lowercase">{getCard(l.cardId)?.word ?? l.cardId}</span>
                            <span className="font-mono text-[11px] text-muted">→ {STATE_LABEL[l.to]}</span>
                        </p>
                    ))}
                    {session.levelUps.length > 4 && (
                        <p className="font-mono text-[11px] text-muted">+{session.levelUps.length - 4} thẻ lên hạng khác</p>
                    )}
                    {session.hardBeaten.length > 0 && (
                        <p className="flex items-center gap-2 text-ink">
                            <Swords className="w-4 h-4 text-warning" />
                            Hạ được từ khó: <span className="font-bold lowercase">{session.hardBeaten.map((id) => getCard(id)?.word ?? id).join(', ')}</span>
                        </p>
                    )}
                    {(dust > 0 || boxes > 0) && (
                        <p className="flex items-center gap-2 text-accent">
                            <Sparkles className="w-4 h-4" />
                            Thẻ may mắn: {[dust > 0 && `+${dust} Bụi`, boxes > 0 && `+${boxes} Hộp`].filter(Boolean).join(' · ')}
                        </p>
                    )}
                    {readyToMint > 0 && (
                        <Link href="/album" className="flex items-center gap-2 text-ink hover:text-accent">
                            <Hammer className="w-4 h-4 text-accent" />
                            {readyToMint} thẻ sẵn sàng đúc
                        </Link>
                    )}
                    {nearest && (
                        <p className="flex items-center gap-2 text-ink-2">
                            <LayoutGrid className="w-4 h-4 text-muted" />
                            Còn {nearest.missing} từ là đủ bộ {nearest.label}
                        </p>
                    )}
                </div>

                <div className="pt-3 space-y-2">
                    {teasers.map((t) => (
                        <p key={t} className="font-mono text-[11px] text-accent">
                            {t}
                        </p>
                    ))}
                    <button
                        onClick={onContinue}
                        className="w-full h-12 rounded-xl bg-accent hover:bg-accent-strong text-on-accent font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition"
                    >
                        Thêm 10 thẻ nữa <ArrowRight className="w-4 h-4" />
                    </button>
                    <Link href="/album" className="block text-center font-mono text-[11px] text-muted hover:text-ink py-1">
                        Xem Album
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
    return (
        <div className="rounded-xl bg-surface-2 px-3 py-2">
            <p className="text-[10px] uppercase text-subtle">{label}</p>
            <p className="text-xl text-ink flex items-center gap-1">
                {value}
                {icon}
            </p>
        </div>
    );
}
