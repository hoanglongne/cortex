"use client";

import { useState } from "react";
import { CRITERIA } from "@cortex/classroom-oratio";
import { Card } from "@/components/ui/card";
import { GuidedRating } from "@/components/ui/guided-rating";
import type { CriterionScores } from "@/lib/feedback";
import { overall, readSelf, saveSelf, type SelfRating } from "@/lib/self-rating";

/**
 * "Tự chấm": rate yourself on the four criteria before partners do, one
 * criterion at a time with questions about what you heard (issue #130). Kept
 * on this device. `hints` are what the machine measured in this take.
 */
export function SelfRatingCard({ id, hints }: { id: string; hints?: Partial<Record<(typeof CRITERIA)[number], string>> }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<Partial<CriterionScores>>(() => readSelf()[id] ?? {});
  const [saved, setSaved] = useState(() => Boolean(readSelf()[id]));
  const complete = CRITERIA.every((c) => rating[c] != null);
  const full = (): SelfRating => rating as SelfRating;
  return (
    <Card className="p-3.5 sm:p-3.5">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between text-left text-[15px] font-bold text-ink">
        Tự chấm 4 tiêu chí
        <span className="text-xs font-semibold text-subtle">{saved && complete ? `Đã chấm: band ${overall(full()).toFixed(1)}` : "Chưa chấm"}</span>
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          <p className="text-[13px] leading-snug text-muted">Nghe lại bản ghi, trả lời vài câu hỏi cho từng tiêu chí rồi chọn band. Không cần chuyên môn.</p>
          <GuidedRating
            value={rating}
            hints={hints}
            onChange={(next) => {
              setSaved(false);
              setRating(next);
            }}
          />
          <button
            type="button"
            disabled={!complete}
            onClick={() => {
              saveSelf(id, full());
              setSaved(true);
            }}
            className="h-10 w-full rounded-xl bg-accent text-sm font-bold text-on-accent disabled:opacity-40"
          >
            {complete ? `Lưu tự chấm (band ${overall(full()).toFixed(1)})` : "Chấm đủ 4 tiêu chí để lưu"}
          </button>
          <p className="text-[11px] text-subtle">Chỉ lưu trên máy bạn. Khi bạn luyện chấm cho bạn, so với điểm của họ để biết mình đánh giá cao hay thấp.</p>
        </div>
      )}
    </Card>
  );
}
