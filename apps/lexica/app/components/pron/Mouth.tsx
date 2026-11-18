'use client';

import { useReducedMotion } from 'framer-motion';
import { mouthFor } from '../../lib/pronunciation/mouth';
import { frameAt } from '../../lib/pronunciation/motion';
import type { MouthPart } from '../../lib/pronunciation/steps';

const HI = '#F5B942';

/**
 * Dots running along the air's path (issue #154): a short burst with a pause
 * for stops (p t k…), a steady stream for s, sh, f, th…, through the nose for
 * m n ng. Not drawn when the learner asked for less motion.
 */
function AirDots({ path, flow }: { path: string; flow: 'burst' | 'steady' | 'nasal' }) {
    const burst = flow === 'burst';
    const dur = burst ? '1.4s' : '1.2s';
    return (
        <g data-testid={`air-${flow}`}>
            {[0, 1, 2].map((i) => (
                <circle key={i} r={burst ? 2.6 : 2} fill="#7DD3FC" opacity="0">
                    {/* A burst moves fast in the first 30% of the cycle, then waits. */}
                    <animateMotion dur={dur} repeatCount="indefinite" begin={`${burst ? i * 0.05 : i * 0.4}s`} path={path} keyPoints={burst ? '0;1;1' : '0;1'} keyTimes={burst ? '0;0.3;1' : '0;1'} calcMode="linear" />
                    <animate attributeName="opacity" dur={dur} repeatCount="indefinite" begin={`${burst ? i * 0.05 : i * 0.4}s`} values={burst ? '1;1;0;0' : '0;1;1;0'} keyTimes={burst ? '0;0.3;0.31;1' : '0;0.15;0.85;1'} />
                </circle>
            ))}
        </g>
    );
}

/**
 * A side view of the mouth making `phone` (lib/pronunciation/mouth.ts): the
 * tongue, teeth, lips and soft palate in place, a ring where they touch, the
 * air's path, and a buzz mark at the throat for voiced sounds.
 */
export default function Mouth({ phone, className = '', focus, t = null }: { phone: string; className?: string; focus?: MouthPart | readonly MouthPart[] | null; t?: number | null }) {
    const on = (part: MouthPart) => (Array.isArray(focus) ? focus.includes(part) : focus === part);
    const still = useReducedMotion();
    // While playing (t set), the frame of the motion; otherwise the still pose.
    const m = t === null ? mouthFor(phone) : (frameAt(phone, t)?.drawing ?? null);
    if (!m) return null;
    const flowPath = m.flow === 'nasal' ? m.nasalAir : m.flow === 'none' ? null : m.air;
    return (
        <svg viewBox="0 0 200 150" className={`rounded-xl bg-surface-2 ${className}`} role="img" aria-label={m.hint}>
            <path d={m.head} className="fill-surface-3" />
            <path d={m.nasalPassage} className="fill-bg" />
            <path d={m.cavity} className="fill-bg" />
            <path d={m.velum} className="fill-surface-3" />
            <path d={m.profile} fill="none" className="stroke-muted" strokeWidth="1.5" />
            <path d={m.tongue} fill="#E8737A" stroke={on('tongue') ? HI : '#F09AA0'} strokeWidth={on('tongue') ? 3 : 1} />
            <path d={m.upperTooth} className="fill-ink" />
            <path d={m.lowerTooth} className="fill-ink" />
            {m.nasalAir && <path d={m.nasalAir} fill="none" className="stroke-accent" strokeWidth="2" strokeDasharray="4 4" />}
            {m.air && (
                <>
                    <path d={m.air} fill="none" className="stroke-accent" strokeWidth="2" strokeDasharray="4 4" />
                    {m.airEnd && <path d={`M${m.airEnd[0]},${m.airEnd[1]} l-7,-4 l0,8 z`} className="fill-accent" />}
                </>
            )}
            {m.sides && <path d="M150,58 C160,66 160,80 176,78" fill="none" className="stroke-accent" strokeWidth="2" strokeDasharray="3 4" />}
            {m.contact && <circle cx={m.contact[0]} cy={m.contact[1]} r="5" fill="none" className="stroke-accent" strokeWidth="2" />}
            {/* The voice: a buzzing zigzag ("rung") or a flat line ("nghỉ"). */}
            {m.voiced ? (
                <g data-testid="voice-on">
                    <path d="M47,128 l6,-4 l-6,-4 l6,-4 l-6,-4" fill="none" className="stroke-accent" strokeWidth="1.8">
                        {!still && <animateTransform attributeName="transform" type="translate" values="0,0;1.5,0;-1.5,0;0,0" dur="0.15s" repeatCount="indefinite" />}
                    </path>
                    <text x="40" y="145" fontSize="9" className="fill-accent">rung</text>
                </g>
            ) : (
                <g data-testid="voice-off">
                    <path d="M50,128 l0,-16" fill="none" className="stroke-muted" strokeWidth="1.8" />
                    <text x="40" y="145" fontSize="9" className="fill-muted">nghỉ</text>
                </g>
            )}
            {!still && t === null && flowPath && m.flow !== 'none' && <AirDots path={flowPath} flow={m.flow} />}
            {/* The part the current step is about (lib/pronunciation/steps.ts). */}
            {on('lips') && <ellipse cx="183" cy="66" rx="9" ry="12" fill="none" stroke={HI} strokeWidth="2.5" />}
            {on('jaw') && <path d={m.lowerTooth} fill="none" stroke={HI} strokeWidth="2.5" />}
            {on('contact') && m.contact && <circle cx={m.contact[0]} cy={m.contact[1]} r="8" fill="none" stroke={HI} strokeWidth="2.5" />}
            {on('air') && m.air && <path d={m.air} fill="none" stroke={HI} strokeWidth="3" />}
            {on('nose') && m.nasalAir && <path d={m.nasalAir} fill="none" stroke={HI} strokeWidth="3" />}
            {on('voice') && <circle cx="53" cy="122" r="10" fill="none" stroke={HI} strokeWidth="2.5" />}
        </svg>
    );
}
