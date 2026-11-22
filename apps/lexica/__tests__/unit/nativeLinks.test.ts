import { describe, expect, it } from 'vitest';
import { deepLinkTarget } from '../../app/lib/native';

describe('deepLinkTarget (packaged app)', () => {
    it('turns the old path forms into the query forms the app uses', () => {
        expect(deepLinkTarget('https://lexica.cortexlearn.app/join/ABC234')).toBe('/join?code=ABC234');
        expect(deepLinkTarget('lexica://join/ABC234')).toBe('/join?code=ABC234');
        expect(deepLinkTarget('https://lexica.cortexlearn.app/score/XY7')).toBe('/score/view?code=XY7');
        expect(deepLinkTarget('https://lexica.cortexlearn.app/read/p12')).toBe('/read/view?id=p12');
        expect(deepLinkTarget('https://lexica.cortexlearn.app/play/chain')).toBe('/play/game?g=chain');
        expect(deepLinkTarget('https://lexica.cortexlearn.app/class/test/5')).toBe('/class/test?id=5');
        expect(deepLinkTarget('https://lexica.cortexlearn.app/buddy/duel/9')).toBe('/buddy/duel?id=9');
    });
    it('keeps plain pages and their query, and the new forms as they are', () => {
        expect(deepLinkTarget('https://lexica.cortexlearn.app/today')).toBe('/today');
        expect(deepLinkTarget('https://lexica.cortexlearn.app/')).toBe('/');
        expect(deepLinkTarget('lexica://num-van?url=https%3A%2F%2Fa.b%2Fc')).toBe('/num-van?url=https%3A%2F%2Fa.b%2Fc');
        expect(deepLinkTarget('https://lexica.cortexlearn.app/read/view?id=p12')).toBe('/read/view?id=p12');
    });
    it('ignores addresses that are not ours', () => {
        expect(deepLinkTarget('https://evil.example/join/ABC234')).toBeNull();
        expect(deepLinkTarget('not a url')).toBeNull();
    });
});
