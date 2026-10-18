// Move to the learning app's tests (e.g. apps/<app>/__tests__/unit/classroom.test.ts).
import { describe, expect, it } from 'vitest';
import { myappModule } from '@cortex/classroom-myapp';

describe('MyApp module', () => {
    it('reads garbage as zeros, never throws', () => {
        expect(myappModule.parseMetrics('x')).toEqual({ sessions: 0, minutes: 0, done: {} });
        expect(myappModule.parseSettings({ level: 'nope' })).toEqual({ level: null });
        expect(myappModule.parsePayload('topic', null)).toEqual({ topic: '', minutes: 5 });
    });
});
