/**
 * Mouth pictures for the sound detail sheet (docs/LEXICA_PRONUNCIATION_UI_PLAN.md):
 * a side view of the mouth, facing right, with the tongue, jaw, lips and
 * soft palate placed for the sound the learner should make. One pose per
 * place of articulation covers every phone; each pose names where the
 * contact is and where the air goes. Pure geometry (SVG path strings) so
 * it is testable; components/pron/Mouth.tsx draws it.
 */
import { bare, isVowel } from './phones';

type Pt = [number, number];
type Lips = 'neutral' | 'spread' | 'round' | 'closed' | 'teeth';

interface Pose {
    /** Tongue points from back to tip: back, dorsum, blade, tip. */
    tongue: [Pt, Pt, Pt, Pt];
    /** 0 closed teeth … 1 wide open. */
    jaw: number;
    lips: Lips;
    /** Soft palate lowered: air through the nose (m, n, ng). */
    nasal?: boolean;
    /** Where the articulators touch or nearly touch. */
    contact?: Pt;
    /** The air's path out. */
    air?: Pt[];
    /** A curled tongue tip (r). */
    curl?: boolean;
    /** Air goes round the sides of the tongue (l). */
    sides?: boolean;
    /** Vietnamese, one short line: where the tongue or lips go. */
    hint: string;
}

const POSES: Record<string, Pose> = {
    dental: { tongue: [[76, 98], [106, 70], [150, 66], [174, 74]], jaw: 0.35, lips: 'neutral', contact: [170, 72], air: [[120, 62], [150, 61], [168, 68], [194, 68]], hint: 'Đầu lưỡi đặt giữa hai hàm răng, thổi hơi qua khe đó.' },
    alveolarStop: { tongue: [[76, 96], [104, 70], [136, 60], [152, 52]], jaw: 0.15, lips: 'neutral', contact: [152, 51], air: [[155, 60], [172, 66], [190, 66]], hint: 'Đầu lưỡi chạm lợi ngay sau răng trên, chặn hơi rồi bật ra.' },
    alveolarFric: { tongue: [[76, 96], [104, 70], [138, 62], [152, 57]], jaw: 0.12, lips: 'spread', contact: [152, 54], air: [[132, 58], [152, 55], [164, 66], [190, 66]], hint: 'Đầu lưỡi gần sát lợi trên nhưng không chạm, hơi xì qua khe hẹp.' },
    postalveolar: { tongue: [[76, 94], [106, 66], [134, 54], [148, 62]], jaw: 0.15, lips: 'round', contact: [134, 50], air: [[118, 56], [136, 52], [160, 64], [194, 66]], hint: 'Mặt lưỡi nâng lên sát phía sau lợi, môi hơi chu ra.' },
    velar: { tongue: [[78, 80], [90, 52], [126, 72], [154, 82]], jaw: 0.2, lips: 'neutral', contact: [88, 49], air: [[86, 60], [120, 66], [190, 68]], hint: 'Cuống lưỡi nâng lên chạm vòm mềm phía trong, chặn hơi rồi bật ra.' },
    bilabial: { tongue: [[76, 98], [102, 78], [134, 76], [154, 82]], jaw: 0.05, lips: 'closed', contact: [180, 64], air: [[150, 66], [178, 64], [194, 64]], hint: 'Hai môi khép lại, chặn hơi rồi mở ra.' },
    labiodental: { tongue: [[76, 98], [102, 78], [134, 76], [154, 82]], jaw: 0.1, lips: 'teeth', contact: [167, 70], air: [[150, 66], [168, 70], [192, 72]], hint: 'Răng trên chạm nhẹ môi dưới, thổi hơi qua khe đó.' },
    lateral: { tongue: [[76, 96], [104, 72], [136, 62], [152, 52]], jaw: 0.25, lips: 'neutral', contact: [152, 51], sides: true, hint: 'Đầu lưỡi chạm lợi trên và giữ lại; hơi đi ra hai bên lưỡi.' },
    r: { tongue: [[76, 94], [106, 70], [132, 64], [142, 58]], jaw: 0.25, lips: 'round', curl: true, air: [[120, 60], [150, 60], [170, 66], [192, 66]], hint: 'Cong đầu lưỡi lên và hơi lùi vào trong, không chạm vòm miệng.' },
    glottal: { tongue: [[76, 100], [102, 82], [134, 80], [154, 86]], jaw: 0.5, lips: 'neutral', air: [[66, 140], [70, 96], [100, 70], [192, 70]], hint: 'Miệng mở tự nhiên, đẩy hơi nhẹ từ cổ họng.' },
    iy: { tongue: [[78, 88], [114, 54], [140, 55], [156, 72]], jaw: 0.08, lips: 'spread', hint: 'Lưỡi nâng cao về phía trước, môi kéo dẹt như cười, giữ lâu.' },
    ih: { tongue: [[78, 92], [110, 63], [138, 64], [156, 76]], jaw: 0.3, lips: 'neutral', hint: 'Lưỡi cao nhưng thả lỏng hơn /iː/, ngắn và gọn.' },
    eh: { tongue: [[78, 96], [108, 72], [138, 72], [156, 82]], jaw: 0.55, lips: 'neutral', hint: 'Miệng mở vừa, lưỡi ở giữa.' },
    ae: { tongue: [[80, 98], [108, 80], [140, 80], [158, 88]], jaw: 0.95, lips: 'spread', hint: 'Hạ hàm, mở miệng rộng, lưỡi thấp và đẩy ra trước.' },
    ah: { tongue: [[76, 100], [98, 84], [132, 84], [154, 90]], jaw: 0.8, lips: 'neutral', hint: 'Mở miệng thoải mái, lưỡi nằm thấp.' },
    ao: { tongue: [[76, 94], [94, 74], [128, 82], [152, 88]], jaw: 0.6, lips: 'round', hint: 'Môi tròn, lưỡi hơi lùi về sau.' },
    uh: { tongue: [[78, 90], [94, 62], [128, 76], [152, 84]], jaw: 0.3, lips: 'round', hint: 'Môi tròn nhẹ, lưỡi cao ở phía sau, thả lỏng.' },
    uw: { tongue: [[80, 86], [92, 56], [126, 74], [152, 84]], jaw: 0.15, lips: 'round', hint: 'Chu môi tròn, cuống lưỡi nâng cao, giữ lâu.' },
};

const CLASS_OF: Record<string, string> = {
    TH: 'dental', DH: 'dental',
    T: 'alveolarStop', D: 'alveolarStop', N: 'alveolarStop',
    S: 'alveolarFric', Z: 'alveolarFric',
    SH: 'postalveolar', ZH: 'postalveolar', CH: 'postalveolar', JH: 'postalveolar',
    K: 'velar', G: 'velar', NG: 'velar',
    P: 'bilabial', B: 'bilabial', M: 'bilabial',
    F: 'labiodental', V: 'labiodental',
    L: 'lateral', R: 'r', ER: 'r', HH: 'glottal',
    IY: 'iy', Y: 'iy', IH: 'ih', EH: 'eh', EY: 'eh', AE: 'ae', AY: 'ae', AW: 'ah', AH: 'ah', AA: 'ah', AO: 'ao', OW: 'ao', OY: 'ao', UH: 'uh', UW: 'uw', W: 'uw',
};

const VOICELESS = new Set(['P', 'T', 'K', 'F', 'TH', 'S', 'SH', 'CH', 'HH']);
const NASAL = new Set(['M', 'N', 'NG']);

/** A smooth path through points (Catmull–Rom as cubic Béziers). */
function through(pts: readonly Pt[], move = true): string {
    let d = move ? `M${pts[0][0]},${pts[0][1]}` : `L${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i - 1] ?? pts[i];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[i + 2] ?? p2;
        const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
        const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
        d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0]},${p2[1]}`;
    }
    return d;
}

export interface MouthDrawing {
    /** viewBox is 0 0 200 150. The head in profile, filled (no outline). */
    head: string;
    /** The face's outline: forehead to upper lip, then lower lip to neck (open between the lips). */
    profile: string;
    /** The inside of the mouth and throat, drawn dark over the head. */
    cavity: string;
    /** The passage behind the nose. */
    nasalPassage: string;
    /** The soft palate: raised (closes the nose) or lowered (nasal sounds). */
    velum: string;
    upperTooth: string;
    lowerTooth: string;
    tongue: string;
    /** Dashed path of the air through the nose, when the sound is nasal. */
    nasalAir: string | null;
    air: string | null;
    airEnd: Pt | null;
    contact: Pt | null;
    /** Little marks at the throat when the voice buzzes. */
    voiced: boolean;
    sides: boolean;
    hint: string;
    /** "Rung cổ họng" or "Không rung": said under the picture. */
    voiceHint: string;
}

/** The picture for the sound `phone` (ARPAbet, stress ignored); null for an unknown phone. */
export function mouthFor(phone: string): MouthDrawing | null {
    const p = bare(phone);
    const pose = POSES[CLASS_OF[p]];
    if (!pose) return null;
    const d = pose.jaw * 22;
    const nasal = NASAL.has(p) || pose.nasal === true;
    const voiced = !VOICELESS.has(p);
    const f = pose.lips === 'round' ? 6 : pose.lips === 'spread' ? -3 : 0;
    // Lower lip: met with the upper lip, tucked under the upper teeth, or following the jaw.
    const lipTop = pose.lips === 'closed' ? 65 : pose.lips === 'teeth' ? 71 : 67 + d;
    const lipX = pose.lips === 'teeth' ? 172 : 181 + f;
    const head =
        `M-10,0 L150,0 C160,8 168,18 175,27 L193,42 Q197,47 190,50 L180,51 C182,53 183,55 ${184 + f},57 ` +
        `C${188 + f},60 ${188 + f},64 ${181 + f},65 ` +
        `L${lipX},${lipTop} C${lipX + 6},${lipTop + 1} ${lipX + 8},${lipTop + 7} ${lipX + 2},${lipTop + 12} ` +
        `C178,${81 + d} 178,${84 + d} 180,${89 + d} C185,${97 + d} 183,${107 + d} 172,${113 + d} ` +
        `C150,${119 + d} 120,${119 + d} 100,${122 + d / 2} C92,125 88,136 86,150 L-10,150 Z`;
    const profile =
        `M150,0 C160,8 168,18 175,27 L193,42 Q197,47 190,50 L180,51 C182,53 183,55 ${184 + f},57 C${188 + f},60 ${188 + f},64 ${181 + f},65 ` +
        `M${lipX},${lipTop} C${lipX + 6},${lipTop + 1} ${lipX + 8},${lipTop + 7} ${lipX + 2},${lipTop + 12} ` +
        `C178,${81 + d} 178,${84 + d} 180,${89 + d} C185,${97 + d} 183,${107 + d} 172,${113 + d} C150,${119 + d} 120,${119 + d} 100,${122 + d / 2} C92,125 88,136 86,150`;
    const open = pose.lips === 'closed' ? 0 : 1;
    const cavity =
        `M${178 + f},65 L170,64 L161,58 Q154,50 146,49 C126,42 102,41 86,46 C80,48 74,52 70,60 ` +
        `C64,80 63,118 65,150 L84,150 C88,136 94,${124 + d / 2} 108,${121 + d} C130,${117 + d} 150,${110 + d} 159,${97 + d} ` +
        `L163,${82 + d} L170,${69 + d * open} L${178 + f},${66 + d * open} Z`;
    const nasalPassage = 'M84,44 C100,34 140,31 178,45 L177,49 C140,38 104,40 88,48 Z';
    const velum = nasal ? 'M88,45 C80,48 74,56 72,67 Q74,70 77,66 C80,57 84,51 89,49 Z' : 'M88,45 C80,45 72,48 65,52 L67,57 C75,54 82,51 89,49 Z';
    const upperTooth = 'M159,56 L166,57 L168,70 Q165,73 162,71 L159,64 Z';
    const lowerTooth = `M158,${93 + d} L161,${77 + d} Q164,${74 + d} 167,${76 + d} L166,${91 + d} Z`;

    const [k, dor, b, t] = pose.tongue;
    // Low tongue points ride down with the jaw; the tip follows the lower teeth when the mouth is open.
    const sink = (pt: Pt, share: number): Pt => [pt[0], pt[1] + d * share];
    const tip = sink(t, t[1] > 70 ? 0.9 : 0.2);
    const top: Pt[] = [[70, 150], sink(k, 0.5), sink(dor, dor[1] > 66 ? 0.6 : 0.15), sink(b, b[1] > 66 ? 0.7 : 0.2), tip];
    const underside: Pt[] = [tip, [tip[0] - 9, tip[1] + 10], [150, 104 + d], [112, 118 + d], [84, 134], [70, 150]];
    let tongue = `${through(top)} ${through(underside, false)} Z`;
    if (pose.curl) tongue += ` M${tip[0] - 2},${tip[1] + 2} q8,-6 2,-13`;

    const airPts = pose.air?.map(([x, y]): Pt => [x, x > 150 ? y + d * 0.35 : y]) ?? null;
    return {
        head,
        profile,
        cavity,
        nasalPassage,
        velum,
        upperTooth,
        lowerTooth,
        tongue,
        nasalAir: nasal ? 'M80,64 C80,54 84,48 92,43 C116,36 150,36 186,46' : null,
        air: airPts ? through(airPts) : null,
        airEnd: airPts ? airPts[airPts.length - 1] : null,
        contact: pose.contact ? [pose.contact[0], pose.contact[1] + (pose.contact[0] > 160 && pose.lips !== 'teeth' ? d * 0.3 : 0)] : null,
        voiced,
        sides: pose.sides === true,
        hint: pose.hint + (nasal ? ' Hơi đi ra đằng mũi.' : ''),
        voiceHint: isVowel(phone) ? '' : voiced ? 'Rung cổ họng (đặt tay lên cổ sẽ thấy rung).' : 'Không rung cổ họng, chỉ có hơi.',
    };
}
