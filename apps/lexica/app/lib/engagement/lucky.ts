import { create } from 'zustand';
import { rpc, signedIn, useEconomy } from './economy';

/**
 * Lucky cards in the swipe deck (about 1 in 15, decided by the server per
 * user, card and day). Signed-in users only; nothing shows when signed out.
 */

export type LuckyPayout = { paid: boolean; item?: 'dust' | 'box'; amount?: number; reason?: string };

interface LuckyStore {
    lucky: Set<string>;
    checked: Set<string>;
    day: string;
    check: (cardIds: string[]) => Promise<void>;
    claim: (cardId: string) => Promise<LuckyPayout | null>;
}

const today = () => new Date().toDateString();

export const useLucky = create<LuckyStore>((set, get) => ({
    lucky: new Set(),
    checked: new Set(),
    day: today(),

    check: async (cardIds) => {
        // A new day draws new lucky cards.
        if (get().day !== today()) set({ lucky: new Set(), checked: new Set(), day: today() });
        const todo = cardIds.filter((id) => !get().checked.has(id)).slice(0, 50);
        if (todo.length === 0 || !(await signedIn())) return;
        try {
            const found = await rpc<string[]>('lexica_lucky_cards', { p_card_ids: todo });
            set((s) => ({
                checked: new Set([...s.checked, ...todo]),
                lucky: new Set([...s.lucky, ...(found ?? [])]),
            }));
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
