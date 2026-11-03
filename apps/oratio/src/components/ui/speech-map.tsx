"use client";

import * as React from "react";
import type { SpeechProfile } from "@/lib/client/speech-metrics";
import { clock, type Mark, type MarkKind } from "@/lib/rating-marks";

const DOT: Record<MarkKind, string> = {
  pause: "var(--color-streak)",
  repeat: "var(--color-subtle)",
  good: "var(--color-good)",
  grammar: "var(--color-danger)",
  unclear: "var(--color-listen)",
};

/**
 * "Bản đồ giọng nói": the recording drawn as bars (tall where the voice is,
 * flat in silence), each long pause shaded with how long it lasted, a playhead,
 * and the rater's own marks. Tap anywhere to play from there.
 */
export function SpeechMap({
  profile,
  time,
  limitSeconds,
  marks,
  activePause,
  onSeek,
}: {
  profile: SpeechProfile;
  time: number;
  limitSeconds?: number;
  marks: readonly Mark[];
  activePause?: number | null;
  onSeek: (seconds: number) => void;
}) {
  const W = 960;
  const H = 110;
  const total = profile.durationMs / 1000 || 1;
  const x = (sec: number) => Math.min(W, (sec / total) * W);
  const bar = W / profile.peaks.length;
  const limitX = limitSeconds && limitSeconds < total ? x(limitSeconds) : null;
  const ref = React.useRef<SVGSVGElement>(null);

  return (
    <div>
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Bản đồ giọng nói: ${profile.pauses.length} chỗ dừng dài`}
        className="h-28 w-full touch-manipulation cursor-pointer rounded-[10px] bg-surface-2"
        onClick={(e) => {
          const box = ref.current?.getBoundingClientRect();
          if (box) onSeek(((e.clientX - box.left) / box.width) * total);
        }}
      >
        {profile.pauses.map((p, i) => (
          <g key={i}>
            <rect x={x(p.startMs / 1000)} y={0} width={Math.max(2, x((p.endMs - p.startMs) / 1000))} height={H} fill="var(--color-streak)" opacity={activePause === i ? 0.55 : 0.28} />
            <text x={x(p.startMs / 1000) + 5} y={30} fontSize={30} fontWeight={800} fill="var(--color-ink)">
              {((p.endMs - p.startMs) / 1000).toFixed(1).replace(".", ",")}s
            </text>
          </g>
        ))}
        {profile.peaks.map((v, i) => {
          const h = Math.max(4, v * (H - 44));
          return <rect key={i} x={i * bar + 1} y={H - 6 - h} width={Math.max(1, bar - 2)} height={h} rx={1.5} fill="var(--color-ink-2)" opacity={v < 0.08 ? 0.25 : 0.85} />;
        })}
        {limitX != null && <rect x={limitX} y={0} width={W - limitX} height={H} fill="var(--color-surface)" opacity={0.7} />}
        {marks.map((m, i) => (
          <circle key={i} cx={x(m.t)} cy={H - 4} r={9} fill={DOT[m.kind]} stroke="var(--color-surface)" strokeWidth={1.5} />
        ))}
        <line x1={x(time)} x2={x(time)} y1={0} y2={H} stroke="var(--color-voice)" strokeWidth={3} />
      </svg>
      <div className="mt-1 flex justify-between font-mono text-[11px] text-subtle" aria-hidden>
        <span>0:00</span>
        <span>{clock(total)}</span>
      </div>
    </div>
  );
}
