"use client";

import * as React from "react";
import { BAND_DESCRIPTORS } from "@/lib/band-descriptors";
import { CRITERIA, type CriterionScores } from "@/lib/feedback";
import { cn } from "@/lib/utils";
import { CRITERION_LABELS } from "./band";

const BANDS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/**
 * The four IELTS criteria, each a row of bands 1-9; the chosen band's
 * descriptor shows underneath so the rater learns the criteria as they go.
 */
export function RubricSheet({
  value,
  onChange,
  disabled = false,
  className,
}: {
  value: Partial<CriterionScores>;
  onChange: (next: Partial<CriterionScores>) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-3 md:grid-cols-2", className)}>
      {CRITERIA.map((key) => {
        const c = CRITERION_LABELS[key];
        const selected = value[key];
        return (
          <section key={key} className="rounded-[var(--radius-card)] border border-line bg-surface p-4">
            <h3 className="text-base font-extrabold tracking-[-0.02em] text-ink">{c.short}</h3>
            <p className="mb-3 mt-0.5 text-[13px] text-subtle">{c.hint}</p>
            <div role="group" aria-label={`Band ${c.name}`} className="grid grid-cols-9 gap-1">
              {BANDS.map((band) => (
                <button
                  key={band}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange({ ...value, [key]: band })}
                  aria-pressed={band === selected}
                  className={cn(
                    "h-11 min-w-0 rounded-[10px] border text-[15px] font-extrabold tabular transition-colors disabled:opacity-50",
                    band === selected ? "border-voice bg-voice text-on-voice" : "border-line-strong text-ink-2 hover:border-muted"
                  )}
                >
                  {band}
                </button>
              ))}
            </div>
            <p className="mt-2.5 min-h-[3.25rem] text-[13px] leading-snug text-muted" aria-live="polite">
              {selected ? `Band ${selected}: ${BAND_DESCRIPTORS[key][selected]}` : "Chạm để chấm"}
            </p>
          </section>
        );
      })}
    </div>
  );
}
