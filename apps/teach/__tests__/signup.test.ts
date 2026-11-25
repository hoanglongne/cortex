import { describe, expect, it } from 'vitest';
import { classMessage } from '@cortex/classroom';

describe('self sign-up messages', () => {
    it('says what is wrong with a center name, not the student nickname rule', () => {
        expect(classMessage('bad center name')).toMatch(/2 đến 80/);
        expect(classMessage('bad name')).toMatch(/20 ký tự/);
    });
    it('says when the daily brake is on', () => {
        expect(classMessage('try later')).toMatch(/Thử lại sau/);
    });
});
