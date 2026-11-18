/**
 * Mouth motion for one sound (issue #156, docs/LEXICA_MOUTH_GUIDE_PLAN.md M2):
 * from a relaxed mouth into the sound's pose, hold, then back. Stops and
 * affricates (p t k b d g ch j) show the release: the contact opens and the
 * air bursts out, which is the part Vietnamese speakers swallow at the end
 * of a word. 2D only: the existing poses are interpolated.
 */
import { drawPose, poseOf, STOPS, type MouthDrawing, type Pose } from './mouth';
import { bare } from './phones';

type Pt = [number, number];

/** A relaxed, slightly open mouth to start and end on. */
export const REST: Pose = {
    tongue: [[78, 98], [106, 76], [138, 76], [156, 84]],
    jaw: 0.3,
    lips: 'neutral',
    hint: '',
};

export type Phase = 'rest' | 'hold' | 'release';

interface Key { at: number; pose: Pose; phase: Phase }

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpPt = (a: Pt, b: Pt, t: number): Pt => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
/** Ease in and out, so the mouth does not move at a constant robotic speed. */
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/** A pose part way from `a` to `b`. Lips and flags switch at the midpoint. */
export function blend(a: Pose, b: Pose, t: number): Pose {
    const near = t < 0.5 ? a : b;
    return {
        ...near,
        tongue: a.tongue.map((p, i) => lerpPt(p, b.tongue[i], t)) as Pose['tongue'],
        jaw: lerp(a.jaw, b.jaw, t),
    };
}

/** The key poses for `phone` over one play, `at` from 0 to 1. Null for an unknown phone. */
export function keyframes(phone: string): Key[] | null {
    const info = poseOf(phone);
    if (!info) return null;
    const pose = info.pose;
    if (STOPS.has(bare(phone))) {
        // Closing, holding the air back, then the release: contact opens toward the rest pose.
        const open = { ...blend(pose, REST, 0.45), air: pose.air, lips: pose.lips === 'closed' ? 'neutral' as const : pose.lips };
        return [
            { at: 0, pose: REST, phase: 'rest' },
            { at: 0.3, pose, phase: 'hold' },
            { at: 0.55, pose, phase: 'hold' },
            { at: 0.68, pose: open, phase: 'release' },
            { at: 1, pose: REST, phase: 'rest' },
        ];
    }
    return [
        { at: 0, pose: REST, phase: 'rest' },
        { at: 0.3, pose, phase: 'hold' },
        { at: 0.75, pose, phase: 'hold' },
        { at: 1, pose: REST, phase: 'rest' },
    ];
}

/** The pose and phase at time `t` (0–1). */
export function poseAt(keys: Key[], t: number): { pose: Pose; phase: Phase } {
    const x = Math.min(1, Math.max(0, t));
    for (let i = 0; i < keys.length - 1; i++) {
        const a = keys[i];
        const b = keys[i + 1];
        if (x <= b.at) {
            const u = b.at === a.at ? 1 : (x - a.at) / (b.at - a.at);
            // The phase follows the key being moved toward once more than half way there.
            return { pose: blend(a.pose, b.pose, ease(u)), phase: u < 0.5 ? a.phase : b.phase };
        }
    }
    const last = keys[keys.length - 1];
    return { pose: last.pose, phase: last.phase };
}

/** The picture of `phone` at time `t`: contact ring only while holding, air while holding (flowing sounds) or at release (stops). */
export function frameAt(phone: string, t: number): { drawing: MouthDrawing; phase: Phase } | null {
    const keys = keyframes(phone);
    if (!keys) return null;
    const { pose, phase } = poseAt(keys, t);
    const stop = STOPS.has(bare(phone));
    const drawing = drawPose(phone, pose, {
        marks: phase === 'hold',
        air: stop ? phase === 'release' : phase === 'hold',
    });
    return { drawing, phase };
}

/** The time of the hold, where the still picture is drawn. */
export const HOLD_T = 0.45;
