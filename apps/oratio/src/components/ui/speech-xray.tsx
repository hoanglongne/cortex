"use client";

import * as React from "react";
import type { Gap, SpeechStats, Token } from "@/lib/speech-words";
import { xrayHeadline } from "@/lib/speech-words";
import { cn } from "@/lib/utils";

const sec = (n: number) => n.toFixed(1).replace(".", ",");

/**
 * "Soi lời nói": the words Whisper heard, as text you can tap, with what a
 * rater would otherwise have to listen for marked inline: pauses in the middle
 * of an idea (amber, the ones that sound hesitant), pauses between ideas
 * (grey, normal), filler sounds, and words said twice. Tap a word or a pause to
 * hear it.
 */
export function SpeechXray({
  tokens,
  gaps,
  stats,
  time,
  onPlay,
}: {
  tokens: readonly Token[];
  gaps: readonly Gap[];
  stats: SpeechStats;
  time: number;
  onPlay: (from: number, to: number) => void;
}) {
  const gapAfter = React.useMemo(() => new Map(gaps.map((g) => [g.after, g])), [gaps]);

  return (
    <div>
      <p className="rounded-lg bg-surface-2 px-3 py-2 text-[13px] font-semibold leading-snug text-ink-2">{xrayHeadline(stats)}</p>

      <dl className="mt-2 grid grid-cols-3 gap-1.5 text-center">
        <Stat tone="warn" value={stats.midPauses} label="dừng giữa ý" />
        <Stat value={stats.boundaryPauses} label="dừng giữa các ý" />
        <Stat tone={stats.fillers > 0 ? "warn" : undefined} value={stats.fillers} label="từ đệm" />
        <Stat tone={stats.repeats > 0 ? "warn" : undefined} value={stats.repeats} label="từ lặp" />
        <Stat value={stats.articulationRate} label="từ/phút khi nói" />
        <Stat value={String(stats.meanRun).replace(".", ",")} label="từ nói liền" />
      </dl>

      <p className="mt-3 text-[15px] leading-[2.1] text-ink" lang="en">
        {tokens.map((t) => {
          const gap = gapAfter.get(t.i);
          const playing = time >= t.start - 0.05 && time < t.end + 0.05;
          return (
            <React.Fragment key={t.i}>
              <button
                type="button"
                onClick={() => onPlay(t.start - 0.3, t.end + 0.6)}
                className={cn(
                  "rounded px-0.5 transition-colors hover:bg-surface-3",
                  playing && "bg-voice/25 font-bold",
                  t.filler && "bg-streak/40 font-bold",
                  t.repeat && "underline decoration-danger decoration-wavy underline-offset-4",
                  t.marker && !t.filler && "underline decoration-subtle decoration-dotted underline-offset-4"
                )}
                aria-label={`${t.text}${t.filler ? ", từ đệm" : t.repeat ? ", từ lặp" : ""}. Nghe từ này.`}
              >
                {t.text}
              </button>{" "}
              {gap && (
                <>
                  <button
                    type="button"
                    onClick={() => onPlay(gap.start - 1.5, gap.end + 1)}
                    className={cn(
                      "mx-0.5 inline-flex h-6 items-center rounded-full px-2 align-middle text-[11px] font-extrabold tabular transition-colors",
                      gap.kind === "mid" ? "bg-streak text-ink hover:brightness-95" : "bg-surface-3 text-muted hover:text-ink"
                    )}
                    aria-label={`${gap.kind === "mid" ? "Dừng giữa chừng một ý" : "Dừng giữa hai ý"}, ${sec(gap.seconds)} giây. Nghe chỗ này.`}
                  >
                    {sec(gap.seconds)}s
                  </button>{" "}
                </>
              )}
            </React.Fragment>
          );
        })}
      </p>

      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-subtle" aria-label="Chú thích">
        <li className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-6 rounded-full bg-streak" /> dừng giữa một ý
        </li>
        <li className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-6 rounded-full bg-surface-3" /> dừng giữa hai ý (bình thường)
        </li>
        <li className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-6 rounded bg-streak/40" /> từ đệm
        </li>
        <li className="flex items-center gap-1.5">
          <span className="inline-block w-6 border-b-2 border-dotted border-danger" /> lặp từ
        </li>
      </ul>
    </div>
  );
}

function Stat({ value, label, tone }: { value: number | string; label: string; tone?: "warn" }) {
  return (
    <div className={cn("rounded-[10px] px-1 py-2", tone === "warn" ? "bg-streak/25" : "bg-surface-2")}>
      <dd className="text-xl font-extrabold leading-none tabular text-ink">{value}</dd>
      <dt className="mt-1 text-[11px] leading-tight text-muted">{label}</dt>
    </div>
  );
}
