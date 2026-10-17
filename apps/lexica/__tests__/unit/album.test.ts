import { beforeEach, describe, expect, it, vi } from 'vitest';
import { editionPerks, nextExplainer, nextGoal, secondExample, walletLines, walletVisible, type Concept } from '@/app/lib/engagement/albumGuide';
import { isOwned, setProgress, type CollectionSet } from '@/app/lib/engagement/collection';
import { pendingClaims } from '@/app/lib/engagement/claims';
import { setHint } from '@/app/lib/engagement/session';
import type { UserCardProgress } from '@/app/lib/eloAlgorithm';
import type { Wallet } from '@/app/lib/engagement/economy';

vi.mock('@/app/lib/engagement/economy', async (orig) => ({
    ...(await orig<typeof import('@/app/lib/engagement/economy')>()),
    signedIn: vi.fn(async () => true),
    rpc: vi.fn(),
}));
import { rpc } from '@/app/lib/engagement/economy';
import { useLucky, withRemaining } from '@/app/lib/engagement/lucky';

const seen = (reviewCount: number): UserCardProgress => ({ cardId: 'x', state: 'seed', lastReviewedAt: 0, nextReviewAt: 0, reviewCount, wrongCount: 0 });
const food: CollectionSet = { id: 'topic:food:1', label: 'Ăn uống I', kind: 'topic', cardIds: ['a', 'b', 'c', 'd', 'e'] };
const work: CollectionSet = { id: 'topic:work:1', label: 'Công việc I', kind: 'topic', cardIds: ['f', 'g'] };
const config = { boxes: { set_complete: 2 }, prices: { upgrade_silver: 300, ticket: 120 } } as never;
const wallet = { boxes: 0, pending_boxes: 0, dust: 0, reroll_tickets: 0, streak_freezes: 0 } as unknown as Wallet;
const word = (id: string) => ({ a: 'abundant', b: 'cognitive' } as Record<string, string>)[id] ?? id;

describe('ownership', () => {
    it('counts a card only once it was remembered, not just seen', () => {
        expect(isOwned(undefined)).toBe(false);
        expect(isOwned(seen(0))).toBe(false);
        expect(isOwned(seen(1))).toBe(true);
        expect(setProgress(food, { a: seen(1), b: seen(0) }).owned).toBe(1);
        // the hint on a merely-seen card still counts it as missing
        expect(setHint('b', [food], { a: seen(1), b: seen(0), c: seen(1), d: seen(1) })).toBe('Còn 2 từ là đủ bộ Ăn uống I');
    });
});

describe('nextGoal', () => {
    it('names the nearest set and what it pays', () => {
        const progress = { a: seen(1), b: seen(1) };
        expect(nextGoal({ sets: [food, work], progress, economy: { ready: [], waiting: {}, wallet, config }, word })).toEqual([
            { text: 'Còn 2 từ đủ bộ Công việc I', reward: '2 Hộp' },
        ]);
    });

    it('puts minting and boxes first, then the set, at most two lines', () => {
        const economy = { ready: ['a'], waiting: {}, wallet: { ...wallet, boxes: 2 }, config };
        expect(nextGoal({ sets: [food], progress: {}, economy, word }).map((g) => g.text)).toEqual(['ABUNDANT đúc được ngay', 'Mở 2 Hộp']);
    });

    it('says when a card can be minted', () => {
        const now = Date.parse('2026-10-17T00:00:00Z');
        const economy = { ready: [], waiting: { b: '2026-10-19T00:00:00Z' }, wallet, config };
        const lines = nextGoal({ sets: [], progress: {}, economy, word, now });
        expect(lines).toEqual([{ text: 'COGNITIVE đúc được sau 2 ngày' }]);
    });

    it('signed out: the set only, without a reward', () => {
        expect(nextGoal({ sets: [work], progress: {}, economy: null, word })).toEqual([{ text: 'Còn 2 từ đủ bộ Công việc I' }]);
    });
});

describe('explaining one idea at a time', () => {
    const facts = (w: Partial<{ dust: number; boxes: number; reroll_tickets: number; streak_freezes: number }>, readyToMint = 0) => ({
        wallet: { ...wallet, ...w },
        readyToMint,
        minted: 0,
    });

    it('starts with sets, then each idea the first time it is met, in order', () => {
        const seenSet = new Set<Concept>();
        expect(nextExplainer(seenSet, facts({}))?.id).toBe('set');
        seenSet.add('set');
        expect(nextExplainer(seenSet, facts({}))).toBeNull();
        // dust and a box arrive together: dust first, box next visit
        expect(nextExplainer(seenSet, facts({ dust: 15, boxes: 1 }))?.id).toBe('dust');
        seenSet.add('dust');
        expect(nextExplainer(seenSet, facts({ dust: 15, boxes: 1 }))?.id).toBe('box');
        seenSet.add('box');
        expect(nextExplainer(seenSet, facts({ dust: 15 }, 1))?.id).toBe('mint');
        seenSet.add('mint');
        expect(nextExplainer(seenSet, facts({ reroll_tickets: 1, streak_freezes: 1 }))?.id).toBe('ticket');
        seenSet.add('ticket');
        expect(nextExplainer(seenSet, facts({ streak_freezes: 1 }))?.id).toBe('freeze');
        seenSet.add('freeze');
        expect(nextExplainer(seenSet, facts({ dust: 999, boxes: 9 }))).toBeNull();
    });

    it('signed out: only sets', () => {
        expect(nextExplainer(new Set(['set']), { wallet: null, readyToMint: 0, minted: 0 })).toBeNull();
    });
});

describe('wallet', () => {
    it('says what each amount is good for now', () => {
        const lines = walletLines({ wallet: { ...wallet, dust: 120, boxes: 1 }, config, editions: {} });
        expect(lines.find((l) => l.key === 'dust')).toMatchObject({ amount: 120, use: 'cần 300 để nâng 1 thẻ' });
        expect(lines.find((l) => l.key === 'boxes')?.use).toBe('mở ngay');
    });

    it('stays hidden for a new learner', () => {
        expect(walletVisible({ wallet, ready: [], editions: {} })).toBe(false);
        expect(walletVisible(null)).toBe(false);
    });
});

describe('editions', () => {
    it('add learning value, higher ones keeping the lower perks', () => {
        expect(editionPerks('common')).toEqual([]);
        expect(editionPerks('silver')).toEqual(['second_example']);
        expect(editionPerks('holo')).toEqual(['second_example', 'origin', 'shield']);
        expect(editionPerks('legendary')).toContain('in_the_wild');
    });

    it('the second example differs from the sentence on the card', () => {
        expect(secondExample({ scenario: 'one', scenarios: { tech: 'two' } }, 'one')).toBe('two');
        expect(secondExample({ scenario: 'one' }, 'one')).toBeNull();
    });
});

describe('set rewards anywhere', () => {
    it('claims a completed set once, from any page', () => {
        const base = { today: '2026-10-17', dailyProgress: 0, dailyGoal: 10, progressDate: null, currentStreak: 0 };
        expect(pendingClaims({ ...base, claimed: new Set(), completedSets: [{ id: food.id, label: food.label }] })).toEqual([
            { kind: 'set_complete', ref: food.id, label: 'Đủ bộ Ăn uống I' },
        ]);
        expect(pendingClaims({ ...base, claimed: new Set([`set_complete:${food.id}`]), completedSets: [{ id: food.id, label: food.label }] })).toEqual([]);
    });
});

describe('lucky badge', () => {
    beforeEach(() => useLucky.setState({ lucky: new Set(), checked: new Set(), remaining: null, day: new Date().toDateString() }));

    it('shows no lucky card once today\'s rewards are used up', async () => {
        vi.mocked(rpc).mockResolvedValueOnce({ cards: ['a', 'b'], remaining: 0 });
        await useLucky.getState().check(['a', 'b', 'c']);
        expect(useLucky.getState().lucky.size).toBe(0);
        expect(useLucky.getState().remaining).toBe(0);
    });

    it('drops the badges when the last reward is paid', async () => {
        vi.mocked(rpc).mockResolvedValueOnce({ cards: ['a', 'b'], remaining: 1 });
        await useLucky.getState().check(['a', 'b']);
        expect([...useLucky.getState().lucky]).toEqual(['a', 'b']);
        vi.mocked(rpc).mockResolvedValueOnce({ paid: true, item: 'dust', amount: 15 });
        await useLucky.getState().claim('a');
        expect(useLucky.getState().lucky.has('b')).toBe(false);
    });

    it('withRemaining keeps the cards while rewards are left', () => {
        const s = withRemaining({ lucky: new Set(['a']), remaining: null }, 2);
        expect(s).toEqual({ lucky: new Set(['a']), remaining: 2 });
    });
});
