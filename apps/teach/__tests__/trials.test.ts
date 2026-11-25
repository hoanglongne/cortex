import { describe, expect, it } from 'vitest';
import { classJoinLink, trialInviteMessage, trialLevelLabel, trialLink, waitingGuests, type Trial } from '@cortex/classroom';

const trial = (guests: Trial['guests']): Trial => ({ id: 't', title: 'Học thử', code: 'ABC234', closed: false, closes_at: '', created_at: '', class_id: null, class_name: null, class_code: null, guests });
const g = (status: 'new' | 'invited' | 'enrolled') => ({ id: status, name: 'Lan', phone: null, status, joined_at: '', score: null, level: null, score_code: null });

describe('trial sessions', () => {
    it('builds the links, with or without a trailing slash', () => {
        expect(trialLink('https://lexica.cortexlearn.app/', 'ABC234')).toBe('https://lexica.cortexlearn.app/thu?code=ABC234');
        expect(classJoinLink('https://lexica.cortexlearn.app', 'XY12')).toBe('https://lexica.cortexlearn.app/join?code=XY12');
    });
    it('names a level, or says the test is not done', () => {
        expect(trialLevelLabel('intermediate')).toBe('Trung cấp');
        expect(trialLevelLabel(null)).toBe('Chưa làm bài');
    });
    it('counts guests nobody has answered yet', () => {
        expect(waitingGuests([trial([g('new'), g('invited'), g('new')]), trial([g('enrolled')])])).toBe(2);
    });
    it('writes the invitation, with the level and the class link when there is one', () => {
        const m = trialInviteMessage({ name: 'Lan', level: 'beginner' }, 'Trung tâm Sao Mai', 'https://x/join?code=A');
        expect(m).toContain('Chào Lan');
        expect(m).toContain('Cơ bản');
        expect(m).toContain('https://x/join?code=A');
        expect(trialInviteMessage({ name: 'Lan', level: null }, 'TT', null)).toContain('Mình sẽ gửi link');
    });
});
