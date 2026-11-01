/**
 * Missions that play with no AI: the story arc is built straight from the
 * authored scene blueprints (docs/SYNAPSE_PLAN.md S3). The cost per play is
 * zero and the content is the same for everyone, so it can be reviewed once.
 */
import type { StoryArc, SynapseChoice, SynapseScenario } from '@cortex/types';
import { PHRASE_MEANINGS } from './phrase-meanings';
import { ScenarioBlueprint, WORLD_BIBLES, WorldLore } from './world-bibles';

type Rand = () => number;

function shuffle<T>(xs: readonly T[], rand: Rand): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** A mission can play with no AI when it has all five authored scenes. */
export const isAuthored = (
  scenarios: readonly ScenarioBlueprint[] | undefined,
): boolean => (scenarios?.length ?? 0) >= 5;

/** The scene as the player meets it. */
export function sceneToScenario(
  bp: ScenarioBlueprint,
  missionCode: string,
  last: boolean,
  rand: Rand,
  sceneId?: string,
): SynapseScenario {
  const right: SynapseChoice = {
    particle: bp.correctExpression,
    meaning: bp.correctMeaning,
    outcome: bp.correctRationale,
    example: bp.correctExample,
    isCorrect: true,
    // A little help in the middle of a mission, so a long run is not only loss
    effect:
      bp.stage === 3
        ? 'integrity_boost'
        : bp.stage === 4
          ? 'restore_life'
          : undefined,
  };
  const wrong: SynapseChoice[] = bp.wrongOptions.map((w) => ({
    particle: w.expression,
    meaning: PHRASE_MEANINGS[w.expression.toLowerCase()] ?? '',
    outcome: w.consequence,
    example: w.example,
    isCorrect: false,
  }));
  return {
    missionCode,
    baseVerb: '___',
    narrative:
      `${bp.scene} ${bp.situation} ${bp.prompt ?? 'Bạn quyết định ___.'}`
        .replace(/\s+/g, ' ')
        .trim(),
    choices: shuffle([right, ...wrong], rand),
    technicalHint: '',
    isFinalBoss: last,
    ...(sceneId ? { sceneId } : {}),
  };
}

/** The whole mission, from its authored scenes. */
export function buildStaticArc(
  lore: WorldLore,
  missionId: string,
  rand: Rand = Math.random,
): StoryArc | null {
  const mission = lore.missions.find((m) => m.id === missionId);
  if (!mission || !isAuthored(mission.scenarios)) return null;
  const scenes = mission.scenarios!.slice(0, 5);
  return {
    arcId: `${lore.codePrefix}-${mission.id}`,
    loreId: lore.id,
    missionId: mission.id,
    stages: scenes.map((bp, i) =>
      sceneToScenario(
        bp,
        `${lore.codePrefix}-${i + 1}`,
        i === scenes.length - 1,
        rand,
        `${mission.id}:${bp.stage}`,
      ),
    ),
  };
}

/** What can be played with no AI, for the mission list. */
export function authoredMissions(): {
  loreId: string;
  missionId: string;
  name: string;
  scenes: number;
  level?: string;
}[] {
  return Object.values(WORLD_BIBLES).flatMap((lore) =>
    lore.missions
      .filter((m) => isAuthored(m.scenarios))
      .map((m) => ({
        loreId: lore.id,
        missionId: m.id,
        name: m.name,
        level: m.level,
        scenes: m.scenarios!.length,
      })),
  );
}

const norm = (s: string) =>
  s
    .replace(/^_{3}\s*/, '')
    .trim()
    .toLowerCase();

interface Indexed {
  sceneId: string;
  bp: ScenarioBlueprint;
  code: string;
}

function allScenes(): Indexed[] {
  return Object.values(WORLD_BIBLES).flatMap((lore) =>
    lore.missions
      .filter((m) => isAuthored(m.scenarios))
      .flatMap((m) =>
        m.scenarios!.map((bp) => ({
          sceneId: `${m.id}:${bp.stage}`,
          bp,
          code: lore.codePrefix,
        })),
      ),
  );
}

/**
 * "Ôn bằng truyện": three scenes for the phrases the player keeps missing. A
 * scene they have not played comes first (a different scene teaches the use,
 * not the answer by heart); when only played ones remain, one that has the
 * phrase as a wrong option is a different contrast; last, the old scene.
 */
export function reviewArc(
  phrases: readonly string[],
  seen: readonly string[],
  rand: Rand = Math.random,
): StoryArc | null {
  const scenes = allScenes();
  const picked: Indexed[] = [];
  const take = (s: Indexed | undefined) => {
    if (s && !picked.some((p) => p.sceneId === s.sceneId)) picked.push(s);
  };
  for (const raw of phrases) {
    if (picked.length >= 3) break;
    const p = norm(raw);
    const asRight = scenes.filter(
      (s) => s.bp.correctExpression.toLowerCase() === p,
    );
    const asWrong = scenes.filter((s) =>
      s.bp.wrongOptions.some((w) => w.expression.toLowerCase() === p),
    );
    const fresh = asRight.filter((s) => !seen.includes(s.sceneId));
    take(
      shuffle(fresh, rand)[0] ??
        shuffle(
          asWrong.filter((s) => !seen.includes(s.sceneId)),
          rand,
        )[0] ??
        shuffle(asRight, rand)[0],
    );
  }
  if (picked.length === 0) return null;
  const stages = picked.map((s, i) =>
    sceneToScenario(
      { ...s.bp, stage: i + 1 },
      `${s.code}-R${i + 1}`,
      i === picked.length - 1,
      rand,
      s.sceneId,
    ),
  );
  return {
    arcId: `review-${Date.now()}`,
    loreId: 'review',
    missionId: 'review',
    stages,
  };
}
