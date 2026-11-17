/**
 * Two sounds side by side (issue #153, docs/LEXICA_MOUTH_GUIDE_PLAN.md M1):
 * the pairs Vietnamese learners mix up, and which parts of the mouth differ
 * between two sounds so the pictures can mark them.
 */
import { bare, isVowel } from './phones';
import { poseOf } from './mouth';
import type { ErrorKind } from './pairs';
import type { MouthPart } from './steps';

export interface SoundPair {
    /** The sound to aim for and the one it is mixed up with (ARPAbet). */
    a: string;
    b: string;
    /** A minimal pair: a word with `a`, a word with `b`. */
    words: [string, string];
    /** The error group it belongs to, for ordering by the learner's weak sounds. */
    kind?: ErrorKind;
    /** One line naming the difference, in Vietnamese. */
    note: string;
}

export const SOUND_PAIRS: SoundPair[] = [
    { a: 'TH', b: 'S', words: ['think', 'sink'], kind: 'th', note: 'think: đầu lưỡi chạm răng trên. sink: đầu lưỡi sau răng, không chạm.' },
    { a: 'TH', b: 'T', words: ['three', 'tree'], kind: 'th', note: 'three: lưỡi giữa hai răng, hơi thổi đều. tree: lưỡi chạm lợi rồi bật.' },
    { a: 'DH', b: 'D', words: ['they', 'day'], kind: 'th', note: 'they: lưỡi giữa hai răng. day: lưỡi chạm lợi sau răng.' },
    { a: 'SH', b: 'S', words: ['she', 'see'], kind: 'ch_j', note: 'she: môi chu, lưỡi lùi vào. see: môi dẹt, lưỡi sát lợi.' },
    { a: 'CH', b: 'SH', words: ['chip', 'ship'], kind: 'ch_j', note: 'chip: lưỡi chạm rồi bật. ship: lưỡi không chạm, hơi xì liên tục.' },
    { a: 'JH', b: 'CH', words: ['jeep', 'cheap'], kind: 'ch_j', note: 'Cùng chỗ đặt lưỡi. jeep rung cổ, cheap không rung, có hơi.' },
    { a: 'Z', b: 'S', words: ['zoo', 'sue'], kind: 'initial_z', note: 'Cùng chỗ đặt lưỡi. zoo rung cổ, sue chỉ có hơi.' },
    { a: 'V', b: 'F', words: ['leave', 'leaf'], kind: 'final_voicing', note: 'Cùng răng trên môi dưới. leave rung cổ, leaf không rung.' },
    { a: 'D', b: 'T', words: ['bed', 'bet'], kind: 'final_voicing', note: 'Cùng chỗ đặt lưỡi. bed rung cổ và âm trước hơi dài hơn.' },
    { a: 'V', b: 'B', words: ['vest', 'best'], note: 'vest: răng trên chạm môi dưới. best: hai môi khép lại.' },
    { a: 'IY', b: 'IH', words: ['sheep', 'ship'], kind: 'long_short', note: 'sheep: môi dẹt, lưỡi cao, kéo dài. ship: lưỡi thả lỏng, ngắn.' },
    { a: 'AE', b: 'EH', words: ['bad', 'bed'], kind: 'ae_e', note: 'bad: hạ hàm thật thấp. bed: miệng mở vừa.' },
    { a: 'NG', b: 'N', words: ['sing', 'sin'], kind: 'final_ng', note: 'sing: cuống lưỡi chạm vòm mềm. sin: đầu lưỡi chạm lợi.' },
    { a: 'L', b: 'N', words: ['light', 'night'], kind: 'final_l', note: 'Cùng đầu lưỡi ở lợi. light: hơi ra hai bên lưỡi. night: hơi ra mũi.' },
];

/** Sounds that stop the air and then release it (the pose alone does not show this). */
const STOPS = new Set(['P', 'B', 'T', 'D', 'K', 'G', 'CH', 'JH']);

const far = (p: [number, number], q: [number, number], d = 6) => Math.hypot(p[0] - q[0], p[1] - q[1]) > d;

/** The parts of the mouth that differ between two sounds. Empty when either is unknown or they match. */
export function partsThatDiffer(a: string, b: string): MouthPart[] {
    const x = poseOf(a);
    const y = poseOf(b);
    if (!x || !y) return [];
    const out: MouthPart[] = [];
    const px = x.pose;
    const py = y.pose;
    if (px.tongue.some((p, i) => far(p, py.tongue[i])) || !!px.curl !== !!py.curl) out.push('tongue');
    if (px.lips !== py.lips) out.push('lips');
    if (Math.abs(px.jaw - py.jaw) >= 0.15) out.push('jaw');
    if ((px.contact && py.contact && far(px.contact, py.contact)) || !px.contact !== !py.contact) out.push('contact');
    const stopVsFlow = !isVowel(a) && !isVowel(b) && !x.nasal && !y.nasal && STOPS.has(bare(a)) !== STOPS.has(bare(b));
    if (stopVsFlow || !!px.sides !== !!py.sides || (!!px.air !== !!py.air && !isVowel(a) && !isVowel(b))) out.push('air');
    if (x.nasal !== y.nasal) out.push('nose');
    if (x.voiced !== y.voiced) out.push('voice');
    return out;
}

/** The written pair for two sounds, in either order. */
export function pairFor(a: string, b: string): SoundPair | null {
    const p = bare(a);
    const q = bare(b);
    return SOUND_PAIRS.find((x) => (x.a === p && x.b === q) || (x.a === q && x.b === p)) ?? null;
}

/** Pairs ordered so the learner's weakest groups come first (then the list's own order). */
export function pairsForLearner(weak: readonly ErrorKind[]): SoundPair[] {
    const rank = (x: SoundPair) => {
        const i = x.kind ? weak.indexOf(x.kind) : -1;
        return i < 0 ? weak.length : i;
    };
    return SOUND_PAIRS.map((x, i) => ({ x, i })).sort((u, v) => rank(u.x) - rank(v.x) || u.i - v.i).map(({ x }) => x);
}
