'use client';

import { mouthFor } from '../../lib/pronunciation/mouth';

/**
 * A side view of the mouth making `phone` (lib/pronunciation/mouth.ts): the
 * tongue, teeth, lips and soft palate in place, a ring where they touch, the
 * air's path, and a buzz mark at the throat for voiced sounds.
 */
export default function Mouth({ phone, className = '' }: { phone: string; className?: string }) {
    const m = mouthFor(phone);
    if (!m) return null;
    return (
        <svg viewBox="0 0 200 150" className={`rounded-xl bg-surface-2 ${className}`} role="img" aria-label={m.hint}>
            <path d={m.head} className="fill-surface-3" />
            <path d={m.nasalPassage} className="fill-bg" />
            <path d={m.cavity} className="fill-bg" />
            <path d={m.velum} className="fill-surface-3" />
            <path d={m.profile} fill="none" className="stroke-muted" strokeWidth="1.5" />
            <path d={m.tongue} fill="#E8737A" stroke="#F09AA0" strokeWidth="1" />
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
            {m.voiced && <path d="M50,128 l6,-4 l-6,-4 l6,-4" fill="none" className="stroke-accent" strokeWidth="1.5" />}
        </svg>
    );
}
