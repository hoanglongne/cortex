"use client";

import * as React from "react";
import { AlertTriangle, ArrowRight, Check } from "lucide-react";
import type { Insight } from "@/lib/speech-insights";
import type { Delta } from "@/lib/speech-history";
import { cn } from "@/lib/utils";

const num = (n: number) => String(Math.round(n * 10) / 10).replace(".", ",");

/**
 * What the X-ray means and what to do about it: how this take compares with
 * your last one, your trend, and for each pattern found a plain-words cause,
 * the words involved, and phrases to say instead of going quiet or saying "um".
 */
export function XrayCoach({ insights, deltas, line, trend }: { insights: readonly Insight[]; deltas: readonly Delta[] | null; line: string | null; trend: readonly number[] }) {
  return (
    <div className="space-y-3">
      {deltas && (
        <section className="rounded-[12px] border border-line p-3" aria-label="So với lần trước">
          <p className="text-sm font-bold text-ink">So với lần nói trước của bạn</p>
          <p className="text-[13px] text-muted">{line}</p>
          <ul className="mt-2 grid grid-cols-2 gap-1.5">
            {deltas.map((d) => (
              <li key={d.id} className={cn("rounded-[10px] px-2.5 py-2", d.direction === "better" ? "bg-good/15" : d.direction === "worse" ? "bg-danger/10" : "bg-surface-2")}>
                <p className="text-[11px] leading-tight text-muted">{d.label}</p>
                <p className="mt-0.5 flex items-center gap-1 text-base font-extrabold tabular text-ink">
                  {num(d.before)} <ArrowRight className="size-3.5 text-subtle" aria-hidden /> {num(d.after)}
                  <span className="sr-only">{d.direction === "better" ? "tốt hơn" : d.direction === "worse" ? "kém hơn" : "như cũ"}</span>
                </p>
              </li>
            ))}
          </ul>
          {trend.length >= 3 && <Trend values={trend} />}
        </section>
      )}

      {insights.length > 0 && (
        <ul className="space-y-2" aria-label="Máy thấy gì và nên làm gì">
          {insights.map((i) => (
            <li key={i.id} className={cn("rounded-[12px] border p-3", i.tone === "fix" ? "border-streak/60 bg-streak/10" : "border-good/40 bg-good/10")}>
              <p className="flex items-start gap-2 text-sm font-extrabold leading-snug text-ink">
                {i.tone === "fix" ? <AlertTriangle className="mt-0.5 size-4 shrink-0 text-ink" aria-hidden /> : <Check className="mt-0.5 size-4 shrink-0 text-good" aria-hidden />}
                {i.title}
              </p>
              <p className="mt-1 text-[13px] leading-snug text-ink-2">{i.detail}</p>
              {i.evidence.length > 0 && (
                <ul className="mt-1.5 flex flex-wrap gap-1.5" lang="en">
                  {i.evidence.map((e) => (
                    <li key={e} className="rounded-full bg-surface px-2.5 py-1 text-[12px] font-semibold text-ink-2">
                      {e}
                    </li>
                  ))}
                </ul>
              )}
              {i.fix && <p className="mt-2 text-[13px] font-semibold leading-snug text-ink">Thử: {i.fix}</p>}
              {i.phrases && (
                <ul className="mt-1.5 flex flex-wrap gap-1.5" lang="en" aria-label="Cụm nên nói thay vì im lặng">
                  {i.phrases.map((p) => (
                    <li key={p} className="rounded-full border border-line-strong bg-surface px-2.5 py-1 text-[12px] font-bold text-voice">
                      {p}
                    </li>
                  ))}
                </ul>
              )}
              {i.words && i.words.length > 0 && (
                <p className="mt-2 text-[12px] leading-snug text-muted">
                  Từ bạn bí trước khi nói: <b className="text-ink-2" lang="en">{i.words.join(", ")}</b>. Ôn các từ này sẽ giúp nói trơn hơn.
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Pauses in the middle of an idea per minute, oldest to latest: going down is good. */
function Trend({ values }: { values: readonly number[] }) {
  const max = Math.max(...values, 1);
  const W = 240;
  const H = 44;
  const x = (i: number) => 6 + (i * (W - 12)) / (values.length - 1);
  const y = (v: number) => 6 + (1 - v / max) * (H - 12);
  return (
    <div className="mt-3">
      <p className="text-[11px] text-subtle">Dừng giữa ý mỗi phút, {values.length} lần gần nhất (xuống là tốt)</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-1 h-12 w-full" role="img" aria-label={`Dừng giữa ý mỗi phút: ${values.map(num).join(", ")}`}>
        <polyline fill="none" stroke="var(--color-voice)" strokeWidth={2.5} strokeLinejoin="round" points={values.map((v, i) => `${x(i)},${y(v)}`).join(" ")} />
        {values.map((v, i) => (
          <circle key={i} cx={x(i)} cy={y(v)} r={i === values.length - 1 ? 4.5 : 3} fill="var(--color-voice)" />
        ))}
      </svg>
    </div>
  );
}
