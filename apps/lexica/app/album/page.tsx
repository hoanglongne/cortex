'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Gift, Hammer, Leaf, Lock, Snowflake, Sparkles, Sprout, Ticket, Trophy, Volume2, Wand2 } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { getAllCards, getCard, getCurrentDrop, useContentVersion } from '../lib/content/repository';
import { buildSets, seasonOpen, setProgress, type CollectionSet } from '../lib/engagement/collection';
import { AudioService } from '../lib/audio/AudioService';
import type { UserCardProgress } from '../lib/eloAlgorithm';
import { EDITION_LABEL, EDITION_RANK, type BoxItem, type Edition, type EconomyState, type OwnedEdition, useEconomy } from '../lib/engagement/economy';
import { readClaimed, rememberClaimed } from '../lib/engagement/claims';
import { RevealModal, useReel } from '../components/RevealReel';
import AuthGate from '../components/AuthGate';
import { shareCardImage } from '../lib/engagement/shareCard';

const STATE_ICON = { seed: Sprout, sprout: Leaf, gold: Sparkles, mastered: Trophy } as const;
const STATE_LABEL = { seed: 'Mầm non', sprout: 'Đang nhớ', gold: 'Thuộc tốt', mastered: 'Thành thạo' } as const;
const STATE_STYLE = {
    seed: 'border-line-strong bg-surface text-muted',
    sprout: 'border-accent/30 bg-accent/5 text-ink',
    gold: 'border-accent/60 bg-accent/10 text-ink',
    mastered: 'border-warning/60 bg-warning/10 text-ink',
} as const;
const EDITION_CLASS: Record<Edition, string> = {
    common: '',
    silver: 'lx-edition-silver',
    holo: 'lx-edition-holo',
    legendary: 'lx-edition-legendary',
};
const EDITIONS: Edition[] = ['common', 'silver', 'common', 'holo', 'common', 'silver', 'legendary', 'common'];

function daysLeft(iso?: string): number | null {
    if (!iso) return null;
    return Math.max(0, Math.ceil((Date.parse(iso) - Date.now()) / 86_400_000));
}

/** Short label printed on a card of this edition (none for Common). */
function editionTag(owned: OwnedEdition | undefined): string | null {
    if (!owned || owned.edition === 'common') return null;
    if (owned.edition === 'legendary') return owned.serial != null ? `No.${String(owned.serial).padStart(4, '0')}` : 'HUYỀN THOẠI';
    return owned.edition === 'silver' ? 'BẠC' : 'HOLO';
}

type Reveal =
    | { kind: 'mint'; cardId: string; edition: Edition; serial: number | null; boxes: number }
    | { kind: 'reroll'; cardId: string; rolled: Edition; kept: boolean; refund: number; edition: Edition }
    | { kind: 'box'; item: BoxItem };

export default function AlbumPage() {
    const version = useContentVersion();
    const cardProgress = useLexicaStore((s) => s.cardProgress);
    const economy = useEconomy();
    const [openId, setOpenId] = useState<string | null>(null);
    const [selected, setSelected] = useState<string | null>(null);
    const [reveal, setReveal] = useState<Reveal | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const sets = useMemo(() => {
        void version;
        const drop = getCurrentDrop();
        return buildSets(getAllCards(), drop ? { [drop.id]: drop.title } : {});
    }, [version]);

    const totals = useMemo(() => {
        const all = sets.reduce((n, s) => n + s.cardIds.length, 0);
        let owned = 0;
        let complete = 0;
        for (const set of sets) {
            const p = setProgress(set, cardProgress);
            owned += p.owned;
            if (p.complete) complete++;
        }
        return { all, owned, complete };
    }, [sets, cardProgress]);

    // Completing a set pays boxes once.
    const claim = economy.claim;
    useEffect(() => {
        if (economy.status !== 'ready') return;
        const claimed = readClaimed();
        for (const set of sets) {
            const key = `set_complete:${set.id}`;
            if (claimed.has(key) || !setProgress(set, cardProgress).complete) continue;
            rememberClaimed(key);
            void claim('set_complete', set.id).catch(() => undefined);
        }
    }, [economy.status, sets, cardProgress, claim]);

    const run = async (fn: () => Promise<void>) => {
        setBusy(true);
        setError('');
        try {
            await fn();
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setBusy(false);
        }
    };

    const state = economy.state;
    const actions = {
        mint: (cardId: string) =>
            run(async () => {
                const r = await economy.mint(cardId);
                setReveal({ kind: 'mint', cardId, edition: r.edition, serial: r.serial, boxes: r.boxes_earned });
            }),
        reroll: (cardId: string) =>
            run(async () => {
                const r = await economy.reroll(cardId);
                setReveal({ kind: 'reroll', cardId, ...r });
            }),
        upgrade: (cardId: string) => run(() => economy.upgrade(cardId)),
        buyTicket: () => run(() => economy.buyTicket()),
        openBox: () =>
            run(async () => {
                const item = await economy.openBox();
                setReveal({ kind: 'box', item });
            }),
    };

    return (
        <div className="min-h-screen bg-bg px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <Link href="/" className="inline-flex items-center gap-2 text-muted hover:text-accent transition-colors text-sm">
                        ← Học
                    </Link>
                    <p className="text-ink font-bold">Album</p>
                    <div className="w-16" />
                </div>

                <div className="rounded-2xl border border-line bg-surface p-5 mb-4">
                    <div className="grid grid-cols-3 gap-3 font-mono">
                        <Stat label="Thẻ" value={`${totals.owned}/${totals.all}`} />
                        <Stat label="Bộ đủ" value={`${totals.complete}/${sets.length}`} />
                        <Stat label="Đã đúc" value={String(state ? Object.keys(state.editions).length : 0)} />
                    </div>
                </div>

                <HowItWorks />

                {economy.status === 'signed-out' && (
                    <div className="mb-4">
                        <AuthGate reason="Đăng nhập để đúc ấn bản thẻ, nhận hộp và Bụi. Không cần mật khẩu." redirectPath="/album" />
                    </div>
                )}
                {state && <WalletBar state={state} busy={busy} onOpenBox={actions.openBox} onBuyTicket={actions.buyTicket} onMintNext={() => state.ready[0] && actions.mint(state.ready[0])} />}
                {error && <p className="mb-4 rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

                <div className="space-y-3">
                    {sets.map((set) => (
                        <SetRow
                            key={set.id}
                            set={set}
                            progress={cardProgress}
                            economy={state}
                            open={openId === set.id}
                            onToggle={() => setOpenId(openId === set.id ? null : set.id)}
                            onSelect={setSelected}
                        />
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {selected && (
                    <CardSheet
                        cardId={selected}
                        progress={cardProgress[selected]}
                        economy={state}
                        busy={busy}
                        onClose={() => setSelected(null)}
                        actions={actions}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>{reveal && <RevealView reveal={reveal} onClose={() => setReveal(null)} />}</AnimatePresence>
        </div>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-[10px] uppercase text-subtle">{label}</p>
            <p className="text-xl text-ink">{value}</p>
        </div>
    );
}

function WalletBar({
    state,
    busy,
    onOpenBox,
    onBuyTicket,
    onMintNext,
}: {
    state: EconomyState;
    busy: boolean;
    onOpenBox: () => void;
    onBuyTicket: () => void;
    onMintNext: () => void;
}) {
    const w = state.wallet;
    const price = state.config.prices.ticket;
    return (
        <div className="rounded-2xl border border-line bg-surface p-4 mb-4 space-y-3">
            <div className="grid grid-cols-4 gap-2 font-mono text-center">
                <WalletStat icon={<Gift className="w-4 h-4" />} label="Hộp" hint="mở ra quà" value={w.boxes} />
                <WalletStat icon={<Sparkles className="w-4 h-4" />} label="Bụi" hint="nâng cấp thẻ" value={w.dust} />
                <WalletStat icon={<Ticket className="w-4 h-4" />} label="Vé" hint="đúc lại thẻ" value={w.reroll_tickets} />
                <WalletStat icon={<Snowflake className="w-4 h-4" />} label="Băng" hint="giữ chuỗi" value={w.streak_freezes} />
            </div>
            <div className="flex flex-wrap gap-2">
                {state.ready.length > 0 && (
                    <button disabled={busy} onClick={onMintNext} className="flex-1 min-w-36 py-2.5 rounded-xl bg-accent hover:bg-accent-strong text-on-accent text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                        <Hammer className="w-4 h-4" /> Đúc thẻ ({state.ready.length} sẵn sàng)
                    </button>
                )}
                {w.boxes > 0 && (
                    <button disabled={busy} onClick={onOpenBox} className="flex-1 min-w-36 py-2.5 rounded-xl border border-accent/50 text-accent text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                        <Gift className="w-4 h-4" /> Mở hộp
                    </button>
                )}
                {w.dust >= price && (
                    <button disabled={busy} onClick={onBuyTicket} className="flex-1 min-w-36 py-2.5 rounded-xl border border-line text-ink-2 text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                        <Ticket className="w-4 h-4" /> Đổi vé ({price} Bụi)
                    </button>
                )}
            </div>
            {w.pending_boxes > 0 && <p className="text-xs text-muted">+{w.pending_boxes} hộp sẽ đến vào ngày mai (tối đa {state.config.boxes.daily_cap} hộp mỗi ngày).</p>}
            <details className="text-xs text-muted">
                <summary className="cursor-pointer">Tỉ lệ công khai</summary>
                <p className="mt-2 font-mono leading-relaxed">
                    Đúc: Huyền thoại {pct(state.config.mint_odds.legendary)} · Holo {pct(state.config.mint_odds.holo)} · Bạc {pct(state.config.mint_odds.silver)} · Thường còn lại.
                    <br />
                    Chắc chắn ra Holo trở lên sau {state.config.pity.holo_after} lần đúc không có Holo (còn {Math.max(0, state.config.pity.holo_after - w.since_holo)}).
                    <br />
                    Hộp: {state.config.box_table.map((b) => `${b.item === 'dust' ? `${b.amount} Bụi` : b.item === 'ticket' ? 'Vé quay lại' : 'Đóng băng'} ${pct(b.p)}`).join(' · ')}
                </p>
            </details>
        </div>
    );
}

const pct = (p: number) => `${(p * 100).toFixed(p < 0.01 ? 1 : 0)}%`;

function WalletStat({ icon, label, hint, value }: { icon: React.ReactNode; label: string; hint: string; value: number }) {
    return (
        <div className="rounded-xl bg-surface-2 py-2">
            <div className="flex items-center justify-center text-accent">{icon}</div>
            <p className="text-lg text-ink">{value}</p>
            <p className="text-[11px] text-ink-2 font-sans">{label}</p>
            <p className="text-[10px] text-subtle font-sans leading-tight">{hint}</p>
        </div>
    );
}

const GUIDE_KEY = 'lexica-album-guide-seen';

const GUIDE: { icon: React.ReactNode; title: string; body: string }[] = [
    {
        icon: <Leaf className="w-4 h-4" />,
        title: 'Học từ là sưu tầm thẻ',
        body: 'Mỗi từ bạn nhớ được thành một thẻ, gom theo bộ chủ đề. Đủ bộ thì được thưởng Hộp.',
    },
    {
        icon: <Hammer className="w-4 h-4" />,
        title: 'Nhớ thật chắc thì Đúc',
        body: 'Từ lên Thành thạo và học được từ 7 ngày thì đúc được một ấn bản: Thường, Bạc, Holo, hiếm nhất là Huyền thoại.',
    },
    {
        icon: <Gift className="w-4 h-4" />,
        title: 'Quà để làm gì',
        body: 'Hộp mở ra Bụi, Vé hoặc Băng. Bụi để nâng thẻ Thường lên Bạc. Vé để đúc lại một thẻ, thử vận may. Băng giữ chuỗi ngày khi lỡ quên học một hôm.',
    },
];

/** Plain-language guide to the album: open on the first visit, a toggle after. */
function HowItWorks() {
    const [open, setOpen] = useState<boolean | null>(null);
    useEffect(() => {
        let seen = false;
        try {
            seen = localStorage.getItem(GUIDE_KEY) === '1';
        } catch {
            // Storage blocked: show the guide every time.
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect -- reads browser storage once after mount
        setOpen(!seen);
    }, []);
    const close = () => {
        setOpen(false);
        try {
            localStorage.setItem(GUIDE_KEY, '1');
        } catch {
            // ignore
        }
    };
    if (open === null) return null;
    if (!open) {
        return (
            <button onClick={() => setOpen(true)} className="mb-4 text-xs text-muted hover:text-ink underline underline-offset-4">
                Album hoạt động thế nào?
            </button>
        );
    }
    return (
        <div className="rounded-2xl border border-accent/30 bg-surface p-5 mb-4">
            <p className="font-mono text-[11px] uppercase tracking-wider text-accent">Cách chơi</p>
            <ol className="mt-3 space-y-3">
                {GUIDE.map((step, i) => (
                    <li key={step.title} className="flex gap-3">
                        <span className="mt-0.5 shrink-0 w-7 h-7 rounded-full bg-accent/10 text-accent flex items-center justify-center">{step.icon}</span>
                        <div>
                            <p className="text-sm font-semibold text-ink">{i + 1}. {step.title}</p>
                            <p className="text-sm text-muted leading-relaxed">{step.body}</p>
                        </div>
                    </li>
                ))}
            </ol>
            <p className="mt-4 text-xs text-subtle">Không cần nhớ hết: cứ học đều, quà tự đến.</p>
            <button onClick={close} className="mt-3 w-full h-11 rounded-xl bg-accent hover:bg-accent-strong text-on-accent text-sm font-bold">
                Đã hiểu
            </button>
        </div>
    );
}

function SetRow({
    set,
    progress,
    economy,
    open,
    onToggle,
    onSelect,
}: {
    set: CollectionSet;
    progress: Record<string, UserCardProgress>;
    economy: EconomyState | null;
    open: boolean;
    onToggle: () => void;
    onSelect: (id: string) => void;
}) {
    const p = setProgress(set, progress);
    const pctOwned = p.total ? (p.owned / p.total) * 100 : 0;
    const isSeason = set.kind === 'season';
    const live = seasonOpen(set);
    const left = daysLeft(set.expiresAt);
    const allSilver = p.complete && economy && set.cardIds.every((id) => (economy.editions[id]?.edition ?? 'common') !== 'common' && economy.editions[id]);

    return (
        <div className={`rounded-2xl border bg-surface ${allSilver ? 'lx-edition-silver' : p.complete ? 'border-accent/50' : 'border-line'}`}>
            <button onClick={onToggle} className="w-full flex items-center gap-3 p-4 text-left">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="font-bold text-ink truncate">{set.label}</p>
                        {isSeason && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${live ? 'bg-accent/10 text-accent' : 'bg-surface-2 text-subtle'}`}>
                                {live ? (left !== null ? `còn ${left} ngày` : 'mùa này') : 'đã đóng'}
                            </span>
                        )}
                        {p.complete && <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-accent text-on-accent">{allSilver ? 'Đủ bộ foil' : 'Đủ bộ'}</span>}
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-surface-3 overflow-hidden">
                        <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${pctOwned}%` }} />
                    </div>
                </div>
                <span className="font-mono text-sm text-muted shrink-0">
                    {p.owned}/{p.total}
                </span>
                <ChevronDown className={`w-4 h-4 text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="px-4 pb-4 grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {set.cardIds.map((id) => {
                        const cp = progress[id];
                        if (!cp) {
                            return (
                                <div
                                    key={id}
                                    className="aspect-[3/4] rounded-xl border border-dashed border-line-strong flex items-center justify-center text-subtle"
                                    aria-label="Thẻ chưa có"
                                >
                                    {isSeason && !live ? <Lock className="w-4 h-4" /> : <span className="font-mono text-xs">?</span>}
                                </div>
                            );
                        }
                        const card = getCard(id);
                        const Icon = STATE_ICON[cp.state];
                        const owned = economy?.editions[id];
                        const ready = economy?.ready.includes(id);
                        return (
                            <button
                                key={id}
                                onClick={() => onSelect(id)}
                                className={`relative aspect-[3/4] rounded-xl border p-2 flex flex-col justify-between text-left transition-transform active:scale-95 ${owned ? `border-line-strong bg-surface-2 text-ink ${EDITION_CLASS[owned.edition]}` : STATE_STYLE[cp.state]}`}
                            >
                                <span className="flex items-center justify-between">
                                    <Icon className="w-3.5 h-3.5" />
                                    {ready && <span className="w-2 h-2 rounded-full bg-accent animate-pulse" aria-label="Sẵn sàng đúc" />}
                                    {editionTag(owned) && <span className={`font-mono text-[8px] tracking-wider lx-edition-label-${owned!.edition}`}>{editionTag(owned)}</span>}
                                </span>
                                <span className={`font-bold leading-tight [overflow-wrap:anywhere] ${(card?.word.length ?? 0) >= 9 ? 'text-[8.5px]' : 'text-[10px] tracking-wide'}`}>{card?.word ?? id}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function CardSheet({
    cardId,
    progress,
    economy,
    busy,
    onClose,
    actions,
}: {
    cardId: string;
    progress?: UserCardProgress;
    economy: EconomyState | null;
    busy: boolean;
    onClose: () => void;
    actions: { mint: (id: string) => void; reroll: (id: string) => void; upgrade: (id: string) => void };
}) {
    const card = getCard(cardId);
    if (!card || !progress) return null;
    const Icon = STATE_ICON[progress.state];
    const owned: OwnedEdition | undefined = economy?.editions[cardId];
    const ready = economy?.ready.includes(cardId);
    const waitingUntil = economy?.waiting[cardId];
    const prices = economy?.config.prices;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className={`relative w-full max-w-md rounded-2xl border border-line bg-surface p-5 ${owned ? EDITION_CLASS[owned.edition] : ''}`}
            >
                <div>
                    {owned && (
                        <p className={`font-mono text-[11px] uppercase tracking-wider mb-2 ${owned.edition === 'common' ? 'text-muted' : `lx-edition-label-${owned.edition}`}`}>
                            {EDITION_LABEL[owned.edition]}
                            {owned.serial != null && ` · No.${String(owned.serial).padStart(4, '0')}`}
                        </p>
                    )}
                    <div className="flex items-center gap-2 mb-1">
                        <p className="text-2xl font-bold text-accent tracking-wide">{card.word}</p>
                        <button onClick={() => void AudioService.play(cardId, 'word')} className="p-1.5 rounded-lg bg-accent/10 text-accent" aria-label="Nghe">
                            <Volume2 className="w-4 h-4" />
                        </button>
                    </div>
                    {card.ipa && <p className="text-muted text-sm font-mono mb-2">/{card.ipa}/</p>}
                    <p className="text-ink-2 text-sm mb-3">{card.translationHint}</p>
                    <p className="text-muted text-sm italic leading-relaxed border-t border-line pt-3">&ldquo;{card.scenario}&rdquo;</p>

                    {/* Holo and better unlock the word's origin story. */}
                    {owned && (owned.edition === 'holo' || owned.edition === 'legendary') && card.surgeryModule && (
                        <div className="mt-3 rounded-xl bg-surface-2 p-3 text-xs text-ink-2 space-y-1">
                            <p className="font-mono uppercase text-[10px] text-accent">Gốc từ</p>
                            {[card.surgeryModule.prefix, card.surgeryModule.root, card.surgeryModule.suffix]
                                .filter(Boolean)
                                .map((part) => (
                                    <p key={part!.text}>
                                        <span className="font-mono text-ink">{part!.text}</span> · {part!.meaning}
                                    </p>
                                ))}
                        </div>
                    )}

                    <div className="mt-4 flex items-center gap-2 font-mono text-xs text-muted">
                        <Icon className="w-3.5 h-3.5" /> {STATE_LABEL[progress.state]} · ôn đúng {progress.reviewCount} · sai {progress.wrongCount}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                        {ready && (
                            <button disabled={busy} onClick={() => actions.mint(cardId)} className="col-span-2 py-2.5 rounded-xl bg-accent text-on-accent text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                                <Hammer className="w-4 h-4" /> Đúc thẻ
                            </button>
                        )}
                        {!owned && !ready && waitingUntil && (
                            <p className="col-span-2 text-xs text-muted">Đúc được sau {daysLeft(waitingUntil)} ngày nữa (cần học từ ít nhất 7 ngày).</p>
                        )}
                        {!owned && !ready && !waitingUntil && economy && (
                            <p className="col-span-2 text-xs text-muted">Thành thạo từ này và ôn đúng vài lần để đúc ấn bản.</p>
                        )}
                        {owned && owned.edition !== 'legendary' && economy && economy.wallet.reroll_tickets > 0 && (
                            <button disabled={busy} onClick={() => actions.reroll(cardId)} className="py-2.5 rounded-xl border border-accent/50 text-accent text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                                <Wand2 className="w-4 h-4" /> Quay lại
                            </button>
                        )}
                        {owned?.edition === 'common' && prices && economy && economy.wallet.dust >= prices.upgrade_silver && (
                            <button disabled={busy} onClick={() => actions.upgrade(cardId)} className="py-2.5 rounded-xl border border-line text-ink-2 text-sm disabled:opacity-50">
                                Lên Bạc ({prices.upgrade_silver} Bụi)
                            </button>
                        )}
                        {owned && (
                            <button
                                onClick={() => void shareCardImage({ word: card.word, ipa: card.ipa, meaning: card.translationHint, scenario: card.scenario ?? '', edition: owned.edition, serial: owned.serial })}
                                className="py-2.5 rounded-xl border border-line text-ink-2 text-sm"
                            >
                                Chia sẻ ảnh
                            </button>
                        )}
                    </div>

                    <button onClick={onClose} className="mt-3 w-full py-2.5 rounded-xl border border-line text-sm text-ink-2">
                        Đóng
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

const BOX_ITEMS: BoxItem[] = [
    { item: 'dust', amount: 20 },
    { item: 'ticket', amount: 1 },
    { item: 'dust', amount: 50 },
    { item: 'freeze', amount: 1 },
    { item: 'dust', amount: 150 },
];
const boxLabel = (b: BoxItem) => (b.item === 'dust' ? `${b.amount} Bụi` : b.item === 'ticket' ? 'Vé quay lại' : 'Đóng băng streak');

function RevealView({ reveal, onClose }: { reveal: Reveal; onClose: () => void }) {
    const isBox = reveal.kind === 'box';
    const editionResult = reveal.kind === 'mint' ? reveal.edition : reveal.kind === 'reroll' ? reveal.rolled : null;
    const edition = useReel<Edition>(EDITIONS, isBox ? null : editionResult);
    const box = useReel<BoxItem>(BOX_ITEMS, isBox ? reveal.item : null);
    const done = isBox ? box.done : edition.done;
    const card = reveal.kind !== 'box' ? getCard(reveal.cardId) : null;

    return (
        <RevealModal onClose={onClose} canClose={done}>
            <p className="text-muted text-sm mb-4">
                {done
                    ? reveal.kind === 'box' ? 'Mở hộp xong' : reveal.kind === 'mint' ? 'Đúc xong' : 'Quay xong'
                    : reveal.kind === 'mint' ? 'Đang đúc thẻ…' : reveal.kind === 'reroll' ? 'Đang quay lại…' : 'Đang mở hộp…'}
            </p>
            {isBox ? (
                <div className="h-40 rounded-2xl border border-line bg-surface-2 flex items-center justify-center">
                    <p className={`text-2xl font-bold ${box.done ? 'text-accent' : 'text-ink-2'}`}>{box.current ? boxLabel(box.current) : ''}</p>
                </div>
            ) : (
                <div
                    className={`mx-auto w-40 aspect-[3/4] rounded-2xl border p-3 flex flex-col justify-between text-left bg-surface-2 border-line-strong ${edition.current ? EDITION_CLASS[edition.current] : ''} ${done && edition.current && EDITION_RANK[edition.current] >= 2 ? 'lx-reveal-sweep' : ''}`}
                >
                    <span className={`font-mono text-[10px] uppercase tracking-wider ${edition.current && edition.current !== 'common' ? `lx-edition-label-${edition.current}` : 'text-muted'}`}>
                        {edition.current ? EDITION_LABEL[edition.current] : ''}
                    </span>
                    <span className="text-sm font-bold text-ink break-all">{card?.word}</span>
                </div>
            )}
            {done && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-1">
                    {reveal.kind === 'mint' && (
                        <>
                            <p className="text-ink font-semibold">
                                {EDITION_LABEL[reveal.edition]}
                                {reveal.serial != null && ` · No.${String(reveal.serial).padStart(4, '0')}`}
                            </p>
                            {reveal.boxes > 0 && <p className="text-accent text-sm">Đúc đủ mốc: +{reveal.boxes} Hộp</p>}
                        </>
                    )}
                    {reveal.kind === 'reroll' &&
                        (reveal.kept ? (
                            <p className="text-muted text-sm">
                                Ra {EDITION_LABEL[reveal.rolled]}, không hơn bản đang có. Giữ {EDITION_LABEL[reveal.edition]}
                                {reveal.refund > 0 && `, hoàn ${reveal.refund} Bụi`}.
                            </p>
                        ) : (
                            <p className="text-ink font-semibold">Lên {EDITION_LABEL[reveal.edition]}!</p>
                        ))}
                    {reveal.kind === 'box' && <p className="text-ink font-semibold">Bạn nhận được {boxLabel(reveal.item)}</p>}
                </motion.div>
            )}
        </RevealModal>
    );
}
