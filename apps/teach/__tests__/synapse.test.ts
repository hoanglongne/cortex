import { describe, expect, it } from 'vitest';
import type { Assignment, BoardStudent } from '@cortex/classroom';
import { applyRun, betterTier, classWeak, counts, phraseName, synapseModule, weekRuns } from '@cortex/classroom-synapse';

const student = (id: string, metrics: unknown): BoardStudent => ({ user_id: id, name: id, apps: { synapse: { metrics, last_active: null } } } as unknown as BoardStudent);

describe('Synapse classroom module', () => {
    it('payloads and metrics are read safely', () => {
        expect(synapseModule.parsePayload('review', null)).toEqual({ kind: 'review' });
        expect(synapseModule.parsePayload('mission', { lore_id: 'school-01', mission_id: 'sc-m1', name: 'X' })).toEqual({ kind: 'mission', lore_id: 'school-01', mission_id: 'sc-m1', name: 'X' });
        expect(synapseModule.parsePayload('mission', 5)).toMatchObject({ kind: 'mission', mission_id: '' });
        const m = synapseModule.parseMetrics({ runs: 3, cleared: 2, solid: 4, weak: ['___ speak up', 7, 'a', 'b', 'c', 'd', 'e'], progress: { a1: { done: true, best: 'gold', tries: 2 }, a2: { best: 'nope' } } });
        expect(m).toMatchObject({ runs: 3, cleared: 2, solid: 4 });
        expect(m.weak).toHaveLength(5);
        expect(m.progress.a1).toEqual({ done: true, best: 'gold', tries: 2 });
        expect(m.progress.a2).toEqual({ done: false, best: null, tries: 0 });
        expect(synapseModule.parseMetrics(undefined)).toEqual({ runs: 0, cleared: 0, solid: 0, weak: [], progress: {} });
    });

    it('a run updates an assignment: done once cleared, the best ending kept, tries counted', () => {
        let d = applyRun(undefined, 'fail');
        expect(d).toEqual({ done: false, best: 'fail', tries: 1 });
        d = applyRun(d, 'bronze');
        d = applyRun(d, 'silver');
        d = applyRun(d, 'bronze');
        expect(d).toEqual({ done: true, best: 'silver', tries: 4 });
        expect(betterTier(null, 'gold')).toBe('gold');
        expect(betterTier('fail', 'bronze')).toBe('bronze');
    });

    it('a run counts only for an assignment given before it, for that mission (or a review for a review one)', () => {
        const mission = { kind: 'mission', payload: { lore_id: 'school-01', mission_id: 'sc-m1', name: 'X' }, created_at: '2026-11-01T00:00:00Z' } as Assignment;
        const review = { kind: 'review', payload: {}, created_at: '2026-11-01T00:00:00Z' } as Assignment;
        const run = { mission_id: 'sc-m1', at: '2026-11-02T00:00:00Z', review: false };
        expect(counts(mission, run)).toBe(true);
        expect(counts(mission, { ...run, mission_id: 'sc-m2' })).toBe(false);
        expect(counts(mission, { ...run, at: '2026-10-31T00:00:00Z' })).toBe(false);
        expect(counts(mission, { ...run, review: true })).toBe(false);
        expect(counts(review, { mission_id: 'review', at: run.at, review: true })).toBe(true);
        expect(counts(review, run)).toBe(false);
    });

    it('assignment progress counts students who tried and who finished', () => {
        const a = { id: 'a1', app: 'synapse', kind: 'mission', payload: { kind: 'mission', lore_id: '', mission_id: '', name: '' } } as Assignment<import('@cortex/classroom-synapse').SynapsePayload>;
        const students = [student('1', { progress: { a1: { done: true, best: 'gold', tries: 1 } } }), student('2', { progress: { a1: { done: false, best: 'fail', tries: 2 } } }), student('3', {})];
        expect(synapseModule.assignmentProgress(a, students)).toEqual({ started: 2, done: 1, total: 3 });
    });

    it('the class sees which phrases most students miss, as numbers', () => {
        const students = [student('1', { weak: ['___ speak up', '___ give in'] }), student('2', { weak: ['___ speak up'] }), student('3', { weak: ['___ turn down'] })];
        expect(classWeak(students)[0]).toEqual({ phrase: 'speak up', students: 2 });
        expect(classWeak(students, 2)).toHaveLength(2);
        expect(phraseName('___ speak up')).toBe('speak up');
    });

    it('praise and the parent line come from this week', () => {
        const app = { metrics: synapseModule.parseMetrics({ runs: 9, solid: 5 }), last_active: null, week_ago: synapseModule.parseMetrics({ runs: 4 }), week_first: null };
        expect(weekRuns(app)).toBe(5);
        expect(synapseModule.praise(app)?.why).toContain('5');
        expect(synapseModule.parentLine(app)).toContain('5 nhiệm vụ');
        expect(synapseModule.praise({ ...app, week_ago: app.metrics })).toBeNull();
    });
});
