import { create } from 'zustand';
import { getSupabaseClient } from '../supabase';
import { syncNow } from '../cloudSync';

/**
 * Card editions, boxes and dust (docs/LEXICA_ENGAGEMENT_SPEC.md §2.2–2.5).
 * All rolls and balances live in Supabase functions
 * (apps/lexica/supabase/migration_engagement.sql); this module only calls
 * them and keeps the latest answer for the UI. Signed-in users only.
 */

export type Edition = 'common' | 'silver' | 'holo' | 'legendary';

export const EDITION_LABEL: Record<Edition, string> = {
    common: 'Thường',
    silver: 'Bạc',
    holo: 'Holo',
    legendary: 'Huyền thoại',
};

export const EDITION_RANK: Record<Edition, number> = { common: 0, silver: 1, holo: 2, legendary: 3 };

export interface Wallet {
    boxes: number;
    pending_boxes: number;
    dust: number;
    reroll_tickets: number;
    streak_freezes: number;
    since_holo: number;
    since_legendary: number;
    mints_total: number;
    mints_today: number;
    boxes_today: number;
    day: string | null;
}

export interface OwnedEdition {
    edition: Edition;
    serial: number | null;
    rerolls: number;
}

export interface EconomyConfig {
    mint_odds: { silver: number; holo: number; legendary: number };
    pity: { holo_after: number; legendary_soft_after: number; legendary_soft_step: number };
    mint_rules: { min_days: number; min_reviews: number; max_per_day: number; box_every: number };
    boxes: Record<string, number>;
    box_table: { item: 'dust' | 'freeze' | 'ticket'; amount: number; p: number }[];
    prices: { ticket: number; upgrade_silver: number; freeze_max: number; refund_common: number; refund_silver: number };
}

export interface EconomyState {
    wallet: Wallet;
    editions: Record<string, OwnedEdition>;
    ready: string[];
    waiting: Record<string, string>; // cardId → ISO time it becomes mintable
    config: EconomyConfig;
}

export type BoxItem = { item: 'dust' | 'freeze' | 'ticket'; amount: number };
export type ClaimKind = 'daily_goal' | 'set_complete' | 'ghost_streak' | 'streak_7' | 'streak_30' | 'streak_100';

const MESSAGES: Record<string, string> = {
    'not signed in': 'Đăng nhập để sưu tầm ấn bản thẻ.',
    'card not ready to mint': 'Thẻ chưa đủ điều kiện đúc (thành thạo, ôn đủ và học từ 7 ngày trước).',
    'already minted': 'Thẻ này đã được đúc rồi.',
    'daily mint limit reached': 'Hôm nay bạn đã đúc đủ số thẻ tối đa. Mai quay lại nhé.',
    'no boxes': 'Bạn chưa có hộp nào.',
    'not enough dust': 'Chưa đủ Bụi.',
    'no reroll tickets': 'Bạn chưa có Vé quay lại.',
    'card not minted': 'Thẻ chưa được đúc.',
    'already legendary': 'Thẻ đã là Huyền thoại.',
    'only common cards can be upgraded': 'Chỉ nâng được thẻ Thường lên Bạc.',
};

export class EconomyError extends Error {}

/** Vietnamese text for a database error, or the original message. */
export function economyMessage(raw: string): string {
    return MESSAGES[raw] ?? (/fetch|network/i.test(raw) ? 'Không kết nối được. Thử lại khi có mạng.' : raw);
}

async function rpc<T>(name: string, args?: Record<string, unknown>): Promise<T> {
    const client = getSupabaseClient();
    if (!client) throw new EconomyError(MESSAGES['not signed in']);
    const { data, error } = await client.rpc(name, args);
    if (error) throw new EconomyError(economyMessage(error.message));
    return data as T;
}

async function signedIn(): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    const { data } = await client.auth.getSession();
    return Boolean(data.session);
}

/** Whether a word gives a shield in "Liều hay Dừng" (Holo or better). */
export function hasShield(edition: OwnedEdition | undefined): boolean {
    return Boolean(edition && EDITION_RANK[edition.edition] >= EDITION_RANK.holo);
}

interface EconomyStore {
    status: 'idle' | 'loading' | 'ready' | 'signed-out' | 'error';
    state: EconomyState | null;
    error: string | null;
    refresh: () => Promise<EconomyState | null>;
    mint: (cardId: string) => Promise<{ edition: Edition; serial: number | null; boxes_earned: number }>;
    openBox: () => Promise<BoxItem>;
    reroll: (cardId: string) => Promise<{ rolled: Edition; kept: boolean; refund: number; edition: Edition }>;
    upgrade: (cardId: string) => Promise<void>;
    buyTicket: () => Promise<void>;
    claim: (kind: ClaimKind, ref: string) => Promise<{ claimed: boolean; boxes: number; pending: number }>;
    spendFreeze: (missedDate: string) => Promise<boolean>;
}

export const useEconomy = create<EconomyStore>((set, get) => {
    const withWallet = (wallet: Wallet) => {
        const state = get().state;
        if (state) set({ state: { ...state, wallet } });
    };

    return {
        status: 'idle',
        state: null,
        error: null,

        refresh: async () => {
            if (!(await signedIn())) {
                set({ status: 'signed-out', state: null, error: null });
                return null;
            }
            set({ status: get().state ? 'ready' : 'loading' });
            try {
                // The server checks mint rules against the synced backup.
                await syncNow().catch(() => undefined);
                const state = await rpc<EconomyState>('lexica_engagement_state');
                set({ status: 'ready', state, error: null });
                return state;
            } catch (err) {
                set({ status: 'error', error: err instanceof Error ? err.message : String(err) });
                return null;
            }
        },

        mint: async (cardId) => {
            const result = await rpc<{ edition: Edition; serial: number | null; boxes_earned: number }>('lexica_mint', { p_card_id: cardId });
            await get().refresh();
            return result;
        },

        openBox: async () => {
            const result = await rpc<BoxItem & { wallet: Wallet }>('lexica_open_box');
            withWallet(result.wallet);
            return { item: result.item, amount: result.amount };
        },

        reroll: async (cardId) => {
            const result = await rpc<{ rolled: Edition; kept: boolean; refund: number; edition: Edition; serial: number | null; wallet: Wallet }>(
                'lexica_reroll',
                { p_card_id: cardId },
            );
            const state = get().state;
            if (state) {
                const prev = state.editions[cardId];
                set({
                    state: {
                        ...state,
                        wallet: result.wallet,
                        editions: {
                            ...state.editions,
                            [cardId]: { edition: result.edition, serial: result.kept ? (prev?.serial ?? null) : result.serial, rerolls: (prev?.rerolls ?? 0) + 1 },
                        },
                    },
                });
            }
            return result;
        },

        upgrade: async (cardId) => {
            const result = await rpc<{ edition: Edition; wallet: Wallet }>('lexica_upgrade', { p_card_id: cardId });
            const state = get().state;
            if (state) {
                const prev = state.editions[cardId];
                set({ state: { ...state, wallet: result.wallet, editions: { ...state.editions, [cardId]: { edition: 'silver', serial: null, rerolls: prev?.rerolls ?? 0 } } } });
            }
        },

        buyTicket: async () => {
            const result = await rpc<{ wallet: Wallet }>('lexica_buy_ticket');
            withWallet(result.wallet);
        },

        claim: async (kind, ref) => {
            const result = await rpc<{ claimed: boolean; boxes: number; pending?: number }>('lexica_claim', { p_kind: kind, p_ref: ref });
            if (result.claimed) await get().refresh();
            return { claimed: result.claimed, boxes: result.boxes, pending: result.pending ?? 0 };
        },

        spendFreeze: async (missedDate) => {
            const result = await rpc<{ used: boolean; wallet: Wallet }>('lexica_use_freeze', { p_missed_date: missedDate });
            withWallet(result.wallet);
            return result.used;
        },
    };
});
