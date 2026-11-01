"use client";

import { useState } from "react";
import { CRITERIA, CRITERION_LABEL } from "@cortex/classroom-oratio";
import { Card } from "@/components/ui/card";
import { BAND_DESCRIPTORS } from "@/lib/band-descriptors";
import { clampBand, emptySelf, overall, readSelf, saveSelf, type SelfRating } from "@/lib/self-rating";

/**
 * "Tự chấm": rate yourself on the four criteria before partners do, with the
 * descriptor of the band you pick next to each slider. Kept on this device.
 */
export function SelfRatingCard({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<SelfRating>(() => readSelf()[id] ?? emptySelf());
  const [saved, setSaved] = useState(() => Boolean(readSelf()[id]));
  return (
    <Card className="p-3.5 sm:p-3.5">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between text-left text-[15px] font-bold text-ink">
        Tự chấm 4 tiêu chí
        <span className="text-xs font-semibold text-subtle">{saved ? `Đã chấm: band ${overall(rating).toFixed(1)}` : "Chưa chấm"}</span>
      </button>
      {open && (
        <div className="mt-3 space-y-4">
          {CRITERIA.map((c) => (
            <div key={c}>
              <label className="flex items-baseline justify-between text-sm font-semibold text-ink">
                {CRITERION_LABEL[c]}
                <span className="tabular">{rating[c]}</span>
              </label>
              <input
                type="range"
                min={1}
                max={9}
                step={1}
                value={rating[c]}
                aria-label={`${CRITERION_LABEL[c]}: band ${rating[c]}`}
                onChange={(e) => {
                  setSaved(false);
                  setRating({ ...rating, [c]: clampBand(Number(e.target.value)) });
                }}
                className="mt-1 w-full accent-[var(--color-accent)]"
              />
              <p className="text-xs leading-snug text-muted">{BAND_DESCRIPTORS[c][rating[c]]}</p>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              saveSelf(id, rating);
              setSaved(true);
            }}
            className="h-10 w-full rounded-xl bg-accent text-sm font-bold text-on-accent"
          >
            Lưu tự chấm (band {overall(rating).toFixed(1)})
          </button>
          <p className="text-[11px] text-subtle">Chỉ lưu trên máy bạn. Khi bạn luyện chấm cho bạn, so với điểm của họ để biết mình đánh giá cao hay thấp.</p>
        </div>
      )}
    </Card>
  );
}
