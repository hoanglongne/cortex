/**
 * Album, explained a little at a time (docs/LEXICA_FEEDBACK_TASKS.md T6).
 * The learner only needs to know the next thing to do, so the page shows a
 * "Tiếp theo" box and explains each idea once, the first time they meet it.
 * Pure functions; the page wires them to the store and the wallet.
 */
import type { UserCardProgress } from '../eloAlgorithm';
import { isOwned, seasonOpen, type CollectionSet } from './collection';
import type { Edition, EconomyState, Wallet } from './economy';

// ─── "Tiếp theo" ──────────────────────────────────────────────────────────

export interface GoalLine {
    text: string;
    /** What it pays, shown after an arrow ("2 Hộp"). */
    reward?: string;
}

const DAY_MS = 86_400_000;

/**
 * The next one or two things worth doing in the album, each with what it
 * gives. Signed out (`economy` null): only how close the nearest set is.
 */
export function nextGoal(input: {
    sets: readonly CollectionSet[];
    progress: Record<string, UserCardProgress | undefined>;
    economy: Pick<EconomyState, 'ready' | 'waiting' | 'wallet' | 'config'> | null;
    word: (cardId: string) => string;
    now?: number;
    max?: number;
}): GoalLine[] {
    const { sets, progress, economy, word, now = Date.now(), max = 2 } = input;
    const out: GoalLine[] = [];
    const setBoxes = economy?.config.boxes.set_complete ?? 2;

    if (economy && economy.ready.length > 0) {
        const n = economy.ready.length;
        out.push({ text: n === 1 ? `${word(economy.ready[0]).toUpperCase()} đúc được ngay` : `${n} thẻ đúc được ngay`, reward: n === 1 ? '1 ấn bản' : `${n} ấn bản` });
    }
    if (economy && economy.wallet.boxes > 0) {
        out.push({ text: `Mở ${economy.wallet.boxes} Hộp`, reward: 'Bụi, Vé hoặc Băng' });
    }

    let nearest: { label: string; missing: number } | null = null;
    for (const set of sets) {
        if (!seasonOpen(set, now)) continue;
        const missing = set.cardIds.filter((id) => !isOwned(progress[id])).length;
        if (missing === 0) continue;
        if (!nearest || missing < nearest.missing) nearest = { label: set.label, missing };
    }
    if (nearest) {
        out.push({ text: `Còn ${nearest.missing} từ đủ bộ ${nearest.label}`, ...(economy ? { reward: `${setBoxes} Hộp` } : {}) });
    }

    if (economy) {
        const soonest = Object.entries(economy.waiting).sort((a, b) => Date.parse(a[1]) - Date.parse(b[1]))[0];
        if (soonest) {
            const days = Math.max(1, Math.ceil((Date.parse(soonest[1]) - now) / DAY_MS));
            out.push({ text: `${word(soonest[0]).toUpperCase()} đúc được sau ${days} ngày` });
        }
    }

    if (out.length === 0) out.push({ text: 'Nhớ một từ để có thẻ đầu tiên' });
    return out.slice(0, max);
}

// ─── Explaining one idea at a time ────────────────────────────────────────

export type Concept = 'set' | 'dust' | 'box' | 'mint' | 'ticket' | 'freeze';

/** In the order a learner usually meets them. */
export const CONCEPTS: readonly { id: Concept; name: string; line: string }[] = [
    { id: 'set', name: 'Bộ thẻ', line: 'Mỗi từ bạn nhớ là một thẻ trong bộ chủ đề; đủ bộ thì được Hộp.' },
    { id: 'dust', name: 'Bụi', line: 'Để dành, khi đúc được thẻ thì dùng nâng thẻ lên Bạc.' },
    { id: 'box', name: 'Hộp', line: 'Mở ngay ở ví phía trên để nhận Bụi, Vé hoặc Băng.' },
    { id: 'mint', name: 'Đúc', line: 'Từ đã thành thạo và học từ 7 ngày trước thì đúc được thành ấn bản; bấm Đúc thẻ.' },
    { id: 'ticket', name: 'Vé', line: 'Dùng để đúc lại một thẻ đã có, thử ra ấn bản cao hơn.' },
    { id: 'freeze', name: 'Băng', line: 'Tự giữ chuỗi ngày nếu bạn lỡ một ngày không học.' },
];

/** What the learner has run into so far. */
export interface AlbumFacts {
    wallet: Pick<Wallet, 'dust' | 'boxes' | 'pending_boxes' | 'reroll_tickets' | 'streak_freezes'> | null;
    readyToMint: number;
    minted: number;
}

function met(id: Concept, f: AlbumFacts): boolean {
    const w = f.wallet;
    switch (id) {
        case 'set':
            return true; // the first day
        case 'dust':
            return !!w && w.dust > 0;
        case 'box':
            return !!w && w.boxes + w.pending_boxes > 0;
        case 'mint':
            return f.readyToMint > 0 || f.minted > 0;
        case 'ticket':
            return !!w && w.reroll_tickets > 0;
        case 'freeze':
            return !!w && w.streak_freezes > 0;
    }
}

/** The one idea to explain now: the first one met but not yet explained. */
export function nextExplainer(seen: ReadonlySet<Concept>, facts: AlbumFacts): (typeof CONCEPTS)[number] | null {
    return CONCEPTS.find((c) => !seen.has(c.id) && met(c.id, facts)) ?? null;
}

const SEEN_KEY = 'lexica-album-explained-v1';

export function readExplained(): Set<Concept> {
    try {
        return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]') as Concept[]);
    } catch {
        return new Set();
    }
}

export function markExplained(id: Concept): Set<Concept> {
    const seen = readExplained();
    seen.add(id);
    try {
        localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
    } catch {
        // Private mode: the note shows again next visit.
    }
    return seen;
}

// ─── Wallet ───────────────────────────────────────────────────────────────

export interface WalletLine {
    key: 'boxes' | 'dust' | 'ticket' | 'freeze';
    name: string;
    amount: number;
    /** What the amount does right now. */
    use: string;
}

export function walletLines(state: Pick<EconomyState, 'wallet' | 'config' | 'editions'>): WalletLine[] {
    const w = state.wallet;
    const price = state.config.prices.upgrade_silver;
    const commons = Object.values(state.editions).filter((e) => e.edition === 'common').length;
    const upgrades = Math.floor(w.dust / price);
    return [
        {
            key: 'boxes',
            name: 'Hộp',
            amount: w.boxes,
            use: w.boxes > 0 ? 'mở ngay' : w.pending_boxes > 0 ? `+${w.pending_boxes} đến vào ngày mai` : 'nhận khi đủ bộ, đạt mục tiêu ngày',
        },
        {
            key: 'dust',
            name: 'Bụi',
            amount: w.dust,
            use: upgrades > 0 ? (commons > 0 ? `đủ nâng ${Math.min(upgrades, commons)} thẻ lên Bạc` : `đủ nâng ${upgrades} thẻ, khi bạn đúc được thẻ`) : `cần ${price} để nâng 1 thẻ`,
        },
        { key: 'ticket', name: 'Vé', amount: w.reroll_tickets, use: w.reroll_tickets > 0 ? `đúc lại ${w.reroll_tickets} thẻ` : 'đổi bằng Bụi hoặc mở từ Hộp' },
        { key: 'freeze', name: 'Băng', amount: w.streak_freezes, use: w.streak_freezes > 0 ? `giữ chuỗi ${w.streak_freezes} ngày lỡ học` : 'mở từ Hộp' },
    ];
}

/** A wallet worth showing: something in it, or a card to mint. */
export function walletVisible(state: Pick<EconomyState, 'wallet' | 'ready' | 'editions'> | null): boolean {
    if (!state) return false;
    const w = state.wallet;
    return w.boxes + w.pending_boxes + w.dust + w.reroll_tickets + w.streak_freezes > 0 || state.ready.length > 0 || Object.keys(state.editions).length > 0;
}

// ─── What an edition is worth for learning ────────────────────────────────

export type Perk = 'second_example' | 'origin' | 'shield' | 'in_the_wild';

export const PERK_LABEL: Record<Perk, string> = {
    second_example: 'Câu ví dụ thứ 2',
    origin: 'Gốc từ',
    shield: 'Khiên trong "Liều hay Dừng"',
    in_the_wild: 'Câu "Ngoài đời"',
};

/** What each edition unlocks; higher editions keep the lower ones' perks. */
export function editionPerks(edition: Edition): Perk[] {
    const out: Perk[] = [];
    if (edition === 'common') return out;
    out.push('second_example');
    if (edition === 'silver') return out;
    out.push('origin', 'shield');
    if (edition === 'holo') return out;
    out.push('in_the_wild');
    return out;
}

/**
 * The Silver "second example": a sentence written for another learner type
 * (Studio variants), different from the one the learner sees on the card.
 */
export function secondExample(card: { scenario?: string; scenarios?: Partial<Record<string, string>> }, shown: string): string | null {
    const all = [...Object.values(card.scenarios ?? {}), card.scenario].filter((s): s is string => !!s && s.trim().length > 0);
    return all.find((s) => s.trim() !== shown.trim()) ?? null;
}
