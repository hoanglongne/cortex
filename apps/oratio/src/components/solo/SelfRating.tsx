"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { CRITERIA } from "@cortex/classroom-oratio";
import { Card } from "@/components/ui/card";
import { ListenRate } from "@/components/ui/listen-rate";
import type { CriterionScores } from "@/lib/feedback";
import type { Machine } from "@/lib/rating-marks";
import type { Word } from "@/lib/speech-words";
import { overall, readSelf, saveSelf, type SelfRating } from "@/lib/self-rating";

/**
 * "Tự chấm": listen to yourself again, tap when you hear a pause, a good word
 * or a mistake, and the four bands start from those taps (issue #130). Kept on
 * this device. `machine` is what the machine measured in this take.
 */
export function SelfRatingCard({ id, src, seconds, machine, words, open, onOpenChange }: { id: string; src: string; seconds: number; machine?: Machine; words?: Word[] | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [rating, setRating] = useState<Partial<CriterionScores>>(() => readSelf()[id] ?? {});
  const [failed, setFailed] = useState(false);
  const [saved, setSaved] = useState(() => Boolean(readSelf()[id]));
  const complete = CRITERIA.every((c) => rating[c] != null);
  const full = (): SelfRating => rating as SelfRating;
  return (
    <Card className="p-3.5 sm:p-3.5">
      <button type="button" onClick={() => onOpenChange(!open)} aria-expanded={open} className="flex w-full cursor-pointer items-center justify-between gap-2 text-left text-[15px] font-bold text-ink">
        Tự chấm
        <span className="flex items-center gap-1.5 text-xs font-semibold text-subtle">
          {saved && complete ? `Đã chấm: band ${overall(full()).toFixed(1)}` : open ? "Thu gọn" : "Bấm để chấm"}
          <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
        </span>
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          <ListenRate
            className="border-0"
            src={src}
            seconds={seconds}
            machine={machine}
            historyKey={id}
            words={words}
            value={rating}
            onChange={(next) => {
              setSaved(false);
              setRating(next);
            }}
          />
          {complete && (
            <button
              type="button"
              disabled={saved}
              onClick={() => {
                const ok = saveSelf(id, full());
                setSaved(ok);
                setFailed(!ok);
              }}
              className={`flex h-10 w-full items-center justify-center gap-1.5 rounded-xl text-sm font-bold ${saved ? "bg-good-soft text-ink" : "bg-accent text-on-accent"}`}
            >
              {saved ? (
                <>
                  <Check className="size-4" aria-hidden /> Đã lưu: band {overall(full()).toFixed(1)}
                </>
              ) : (
                `Lưu tự chấm (band ${overall(full()).toFixed(1)})`
              )}
            </button>
          )}
          {failed && <p className="text-[12px] font-semibold text-danger">Không lưu được trên trình duyệt này (có thể đang ở chế độ riêng tư).</p>}
          <p className="text-[11px] text-subtle">Chỉ lưu trên máy bạn. Khi bạn luyện chấm cho bạn, so với điểm của họ để biết mình đánh giá cao hay thấp.</p>
        </div>
      )}
    </Card>
  );
}
