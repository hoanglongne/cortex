import { authoredMissions, buildStaticArc, reviewArc } from './static-arc';
import { WORLD_BIBLES } from './world-bibles';

const seq = () => {
  let i = 0;
  return () => (i++ * 0.37) % 1;
};

describe('static arcs (no AI)', () => {
  it('lists the school world and the first urban mission as authored', () => {
    const ids = authoredMissions().map((m) => m.missionId);
    expect(ids).toEqual(
      expect.arrayContaining(['sc-m1', 'sc-m2', 'sc-m3', 'sc-m4', 'sc-m5', 'sc-m6', 'ur-m1']),
    );
  });

  it('every authored scene is playable: one right option, three wrong ones, a blank in the line, no repeats', () => {
    for (const lore of Object.values(WORLD_BIBLES)) {
      for (const m of lore.missions) {
        const arc = buildStaticArc(lore, m.id, seq());
        if (!arc) continue;
        expect(arc.stages).toHaveLength(5);
        arc.stages.forEach((s, i) => {
          expect(s.choices).toHaveLength(4);
          expect(s.choices.filter((c) => c.isCorrect)).toHaveLength(1);
          expect(
            new Set(s.choices.map((c) => c.particle.toLowerCase())).size,
          ).toBe(4);
          expect(s.choices.every((c) => c.outcome.length > 10)).toBe(true);
          // The meaning shows on every option at the first level; a missing one would give the answer away
          expect(s.choices.every((c) => c.meaning.length > 0)).toBe(true);
          expect(s.isFinalBoss).toBe(i === 4);
          // The classroom projector (Teach) cuts a scene at 460 characters and an outcome at 260: the blank must survive
          expect(s.narrative.length).toBeLessThanOrEqual(460);
          expect(s.choices.every((c) => c.outcome.length <= 260)).toBe(true);
          expect(
            s.choices.every((c) => `${c.particle} · ${c.meaning}`.length <= 80),
          ).toBe(true);
          expect(s.sceneId).toBe(`${m.id}:${i + 1}`);
          if (lore.id === 'school-01') {
            expect(s.narrative).toContain('___');
            // The school world is written in full: every phrase has an example that uses it
            for (const c of s.choices) {
              expect(c.example).toBeTruthy();
              expect(c.example!.toLowerCase()).toContain(
                c.particle.toLowerCase().split(' ').pop()!,
              );
            }
          }
        });
      }
    }
  });

  it('a mission without authored scenes is left to the AI path', () => {
    expect(buildStaticArc(WORLD_BIBLES['cyberpunk-01'], 'cp-m1')).toBeNull();
  });

  it('review: scenes for the weak phrases, a different scene first, never more than three', () => {
    const arc = reviewArc(
      ['___ speak up', 'turn down', 'step up', 'give in'],
      [],
      seq(),
    )!;
    expect(arc.stages.length).toBeLessThanOrEqual(3);
    expect(arc.stages.length).toBeGreaterThan(0);
    // "speak up" is the answer in sc-m1:1 and sc-m1:5; having played the first, the review takes the other
    const second = reviewArc(['speak up'], ['sc-m1:1'], seq())!;
    expect(second.stages[0].sceneId).not.toBe('sc-m1:1');
    expect(second.stages[0].choices.find((c) => c.isCorrect)!.particle).toBe(
      'speak up',
    );
    expect(reviewArc(['no such phrase'], [], seq())).toBeNull();
  });
});
