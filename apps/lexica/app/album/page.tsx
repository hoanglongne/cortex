'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronDown, Gift, Hammer, HelpCircle, Leaf, Lock, Shield, Snowflake, Sparkles, Sprout, Ticket, Trophy, Volume2, Wand2, X } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { getAllCards, getCard, getCurrentDrop, getQuotes, useContentVersion } from '../lib/content/repository';
import { buildSets, isOwned, seasonOpen, setProgress, type CollectionSet } from '../lib/engagement/collection';
import { CONCEPTS, editionPerks, markExplained, nextExplainer, nextGoal, PERK_LABEL, readExplained, secondExample, walletLines, walletVisible, type Concept } from '../lib/engagement/albumGuide';
import { scenarioFor } from '../lib/content/persona';
import InTheWild from '../components/InTheWild';
import { AudioService } from '../lib/audio/AudioService';
import type { UserCardProgress } from '../lib/eloAlgorithm';
import { EDITION_LABEL, EDITION_RANK, type BoxItem, type Edition, type EconomyState, type OwnedEdition, useEconomy } from '../lib/engagement/economy';
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

    // Completed sets are claimed by EngagementSync, wherever they were completed.
    const [seen, setSeen] = useState<Set<Concept>>(() => (typeof window === 'undefined' ? new Set() : readExplained()));
    const [showGuide, setShowGuide] = useState(false);
    const [showSignIn, setShowSignIn] = useState(false);

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
    const signedOut = economy.status === 'signed-out';
    const word = (id: string) => getCard(id)?.word ?? id;
    const goals = nextGoal({ sets, progress: cardProgress, economy: state, word });
    const explainer = nextExplainer(seen, {
        wallet: state?.wallet ?? null,
        readyToMint: state?.ready.length ?? 0,
        minted: state ? Object.keys(state.editions).length : 0,
    });
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
                <div className="flex items-center justify-between mb-1">
                    <Link href="/" className="inline-flex items-center gap-2 text-muted hover:text-accent transition-colors text-sm">
                        ← Học
                    </Link>
                    <p className="text-ink font-bold">Album</p>
                    <button onClick={() => setShowGuide(true)} className="w-16 flex justify-end text-muted hover:text-ink" aria-label="Từ điển Album">
                        <HelpCircle className="w-5 h-5" />
                    </button>
                </div>
                <p className="mb-5 text-center font-mono text-[11px] text-subtle">
                    {totals.owned}/{totals.all} thẻ · {totals.complete}/{sets.length} bộ đủ
                    {state && Object.keys(state.editions).length > 0 && ` · ${Object.keys(state.editions).length} đã đúc`}
                </p>

                {explainer && (
                    <div data-testid="album-explainer" className="mb-3 rounded-2xl border border-accent/30 bg-surface p-4 flex items-start gap-3">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-accent bg-accent/10 rounded-md px-1.5 py-0.5 shrink-0 mt-0.5">Mới</span>
                        <p className="flex-1 text-sm text-ink-2">
                            <span className="font-semibold text-ink">{explainer.name}:</span> {explainer.line}
                        </p>
                        <button onClick={() => setSeen(markExplained(explainer.id))} className="text-sm text-ink underline underline-offset-4 shrink-0">
                            Hiểu rồi
                        </button>
                    </div>
                )}

                <div data-testid="album-next" className="mb-4 rounded-2xl border border-line bg-surface p-4">
                    <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">Tiếp theo</p>
                    <ul className="mt-2 space-y-1.5">
                        {goals.map((g) => (
                            <li key={g.text} className="flex items-center gap-2 text-sm text-ink">
                                <span className="flex-1">{g.text}</span>
                                {g.reward && (
                                    <span className="flex items-center gap-1 font-mono text-xs text-accent shrink-0">
                                        <ArrowRight className="w-3.5 h-3.5" /> {g.reward}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                {signedOut && (
                    <div className="mb-4">
                        <p className="text-sm text-muted">
                            Đăng nhập để nhận quà khi đủ bộ.{' '}
                            <button onClick={() => setShowSignIn(!showSignIn)} className="text-ink underline underline-offset-4">
                                Đăng nhập
                            </button>
                        </p>
                        {showSignIn && (
                            <div className="mt-3">
                                <AuthGate reason="Đăng nhập để sưu tầm thẻ trên mọi máy." redirectPath="/album" />
                            </div>
                        )}
                    </div>
                )}
                {state && walletVisible(state) && <WalletBar state={state} busy={busy} onOpenBox={actions.openBox} onBuyTicket={actions.buyTicket} onMintNext={() => state.ready[0] && actions.mint(state.ready[0])} />}
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
            <AnimatePresence>{showGuide && <AlbumDictionary onClose={() => setShowGuide(false)} />}</AnimatePresence>
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
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                {walletLines(state).map((line) => (
                    <li key={line.key} className="flex items-center gap-2 text-sm">
                        <span className="text-accent">{WALLET_ICON[line.key]}</span>
                        <span className="text-ink">
                            {line.name} <span className="font-mono">{line.amount}</span>
                        </span>
                        <span className="text-muted text-xs truncate">· {line.use}</span>
                    </li>
                ))}
            </ul>
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

const WALLET_ICON = {
    boxes: <Gift className="w-4 h-4" />,
    dust: <Sparkles className="w-4 h-4" />,
    ticket: <Ticket className="w-4 h-4" />,
    freeze: <Snowflake className="w-4 h-4" />,
} as const;

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
                        if (!cp || !isOwned(cp)) {
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
    const archetype = useLexicaStore((s) => s.userArchetype);
    if (!card || !progress) return null;
    const Icon = STATE_ICON[progress.state];
    const owned: OwnedEdition | undefined = economy?.editions[cardId];
    const ready = economy?.ready.includes(cardId);
    const waitingUntil = economy?.waiting[cardId];
    const prices = economy?.config.prices;
    const shownSentence = scenarioFor(card, archetype) || card.scenario || '';
    const second = secondExample(card, shownSentence);

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
                    <p className="text-muted text-sm italic leading-relaxed border-t border-line pt-3">&ldquo;{shownSentence}&rdquo;</p>

                    {/* What each edition adds for learning; the ones this card has are lit. */}
                    <ul data-testid="edition-perks" className="mt-3 space-y-1 font-mono text-[11px]">
                        {(['silver', 'holo', 'legendary'] as const).map((ed) => {
                            const has = !!owned && EDITION_RANK[owned.edition] >= EDITION_RANK[ed];
                            const added = editionPerks(ed).filter((p) => !editionPerks(ed === 'silver' ? 'common' : ed === 'holo' ? 'silver' : 'holo').includes(p));
                            return (
                                <li key={ed} className={has ? 'text-accent' : 'text-subtle'}>
                                    {EDITION_LABEL[ed]}: + {added.map((p) => PERK_LABEL[p]).join(', ')}
                                </li>
                            );
                        })}
                    </ul>

                    {/* Silver and better: a second example sentence. */}
                    {owned && EDITION_RANK[owned.edition] >= EDITION_RANK.silver && second && (
                        <div className="mt-3 rounded-xl bg-surface-2 p-3 text-xs text-ink-2">
                            <p className="font-mono uppercase text-[10px] text-accent mb-1">Câu ví dụ thứ 2</p>
                            <p className="italic leading-relaxed">&ldquo;{second}&rdquo;</p>
                        </div>
                    )}

                    {/* Holo and better: the word's origin, and a shield in "Liều hay Dừng". */}
                    {owned && EDITION_RANK[owned.edition] >= EDITION_RANK.holo && (
                        <p className="mt-3 flex items-center gap-1.5 text-xs text-accent">
                            <Shield className="w-3.5 h-3.5" /> Khiên: sai từ này trong &ldquo;Liều hay Dừng&rdquo; vẫn giữ hũ (1 lần mỗi ngày)
                        </p>
                    )}
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

                    {/* Legendary: real quotes with the word. */}
                    {owned?.edition === 'legendary' && <InTheWild word={card.word} quotes={getQuotes(cardId)} />}

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
                        {!owned && !ready && !waitingUntil && economy && <MintNeeds state={progress.state} reviews={progress.reviewCount} rules={economy.config.mint_rules} />}
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

/** "Từ điển Album": one line per idea, opened from the ? button. */
function AlbumDictionary({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-md rounded-2xl border border-line bg-surface p-5 max-h-[85vh] overflow-y-auto"
                role="dialog"
                aria-label="Từ điển Album"
            >
                <div className="flex items-center justify-between">
                    <p className="font-bold text-ink">Từ điển Album</p>
                    <button onClick={onClose} className="text-muted hover:text-ink" aria-label="Đóng">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <dl className="mt-4 divide-y divide-line text-sm">
                    {CONCEPTS.map((c) => (
                        <div key={c.id} className="py-2 grid grid-cols-[4.5rem_1fr] gap-2">
                            <dt className="font-semibold text-ink">{c.name}</dt>
                            <dd className="text-ink-2">{c.line}</dd>
                        </div>
                    ))}
                    {(['silver', 'holo', 'legendary'] as const).map((ed) => (
                        <div key={ed} className="py-2 grid grid-cols-[4.5rem_1fr] gap-2">
                            <dt className="font-semibold text-ink">{EDITION_LABEL[ed]}</dt>
                            <dd className="text-ink-2">Ấn bản mở thêm: {editionPerks(ed).map((p) => PERK_LABEL[p]).join(', ')}.</dd>
                        </div>
                    ))}
                </dl>
            </motion.div>
        </div>
    );
}

/**
 * What is left before a card can be minted, in numbers: the server mints a
 * card at Thành thạo, with `min_reviews` right reviews, `min_days` after it
 * was first seen (lexica_mint).
 */
function MintNeeds({ state, reviews, rules }: { state: keyof typeof STATE_LABEL; reviews: number; rules: { min_days: number; min_reviews: number } }) {
    const left = Math.max(0, rules.min_reviews - reviews);
    const steps = [
        state !== 'mastered' ? `lên ${STATE_LABEL.mastered} (đang ${STATE_LABEL[state]})` : null,
        left > 0 ? `ôn đúng thêm ${left} lần (đã ${reviews}/${rules.min_reviews})` : null,
    ].filter(Boolean);
    return (
        <div className="col-span-2 text-xs text-muted">
            <p>Để đúc ấn bản, từ này cần {steps.length ? steps.join(' và ') : 'thêm vài ngày'}.</p>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={Math.min(reviews, rules.min_reviews)} aria-valuemax={rules.min_reviews} aria-label="Lần ôn đúng">
                <div className="h-full rounded-full bg-accent" style={{ width: `${(Math.min(reviews, rules.min_reviews) / Math.max(1, rules.min_reviews)) * 100}%` }} />
            </div>
            <p className="mt-1">Từ cũng cần học ít nhất {rules.min_days} ngày.</p>
        </div>
    );
}
