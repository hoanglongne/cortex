import { create } from 'zustand';
import { rpc, signedIn, useEconomy } from './economy';

/**
 * Lucky cards in the swipe deck (about 1 in 15, decided by the server per
 * user, card and day). Signed-in users only; nothing shows when signed out.
 * The server also says how many lucky rewards are left today; at zero no
 * card shows the badge, so the app never promises a gift it can't pay.
 */

export type LuckyPayout = { paid: boolean; item?: 'dust' | 'box'; amount?: number; reason?: string };

interface LuckyStore {
    lucky: Set<string>;
    checked: Set<string>;
    day: string;
    /** Lucky rewards left today; null until the server answered. */
    remaining: number | null;
    check: (cardIds: string[]) => Promise<void>;
    claim: (cardId: string) => Promise<LuckyPayout | null>;
}

const today = () => new Date().toDateString();

export const useLucky = create<LuckyStore>((set, get) => ({
    lucky: new Set(),
    checked: new Set(),
    day: today(),
    remaining: null,

    check: async (cardIds) => {
        // A new day draws new lucky cards.
        if (get().day !== today()) set({ lucky: new Set(), checked: new Set(), day: today(), remaining: null });
        if (get().remaining === 0) return;
        const todo = cardIds.filter((id) => !get().checked.has(id)).slice(0, 50);
        if (todo.length === 0 || !(await signedIn())) return;
        try {
            const status = await rpc<{ cards: string[]; remaining: number }>('lexica_lucky_status', { p_card_ids: todo });
            set((s) => withRemaining({ ...s, checked: new Set([...s.checked, ...todo]), lucky: new Set([...s.lucky, ...(status.cards ?? [])]) }, status.remaining));
        } catch {
            // Offline or migration not run yet: no lucky cards, nothing breaks.
        }
    },

    claim: async (cardId) => {
        if (!get().lucky.has(cardId)) return null;
        set((s) => {
            const lucky = new Set(s.lucky);
            lucky.delete(cardId);
            return { lucky };
        });
        try {
            const result = await rpc<LuckyPayout>('lexica_lucky_claim', { p_card_id: cardId });
            const left = get().remaining;
            if (result.paid && left !== null) set((s) => withRemaining(s, left - 1));
            if (!result.paid && result.reason === 'daily cap') set((s) => withRemaining(s, 0));
            const eco = useEconomy.getState().state;
            if (result.paid && eco && result.item === 'dust' && result.amount) {
                // Keep the wallet in step without a full refresh.
                useEconomy.setState({ state: { ...eco, wallet: { ...eco.wallet, dust: eco.wallet.dust + result.amount } } });
            } else if (result.paid) {
                void useEconomy.getState().refresh();
            }
            return result;
        } catch {
            return null;
        }
    },
}));

/** Today's lucky cards given what is left: none once the daily cap is used. */
export function withRemaining<T extends { lucky: Set<string>; remaining: number | null }>(state: T, remaining: number): T {
    const left = Math.max(0, remaining);
    return { ...state, remaining: left, lucky: left === 0 ? new Set<string>() : state.lucky };
}
