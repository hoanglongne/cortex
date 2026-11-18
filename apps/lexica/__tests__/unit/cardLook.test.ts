import { describe, expect, it } from 'vitest';
import { TOPIC_COLOR } from '../../app/lib/engagement/cardLook';
import { TOPICS } from '../../app/lib/engagement/collection';

describe('cardLook (#146)', () => {
    it('has a colour for every topic', () => {
        expect(TOPICS.filter((t) => !TOPIC_COLOR[t.id])).toEqual([]);
    });
});
