import * as React from "react";
import { cn } from "@/lib/utils";

export const CRITERION_LABELS = {
  fluency: { name: "Fluency & Coherence", short: "Fluency", hint: "Nói trôi, ít ngập ngừng" },
  vocabulary: { name: "Lexical Resource", short: "Vocabulary", hint: "Dùng từ đa dạng, đúng" },
  grammar: { name: "Grammatical Range & Accuracy", short: "Grammar", hint: "Đa dạng và chính xác" },
  pronunciation: { name: "Pronunciation", short: "Pronunciation", hint: "Dễ nghe, rõ ràng" },
} as const;

const fmt = (b: number) => b.toFixed(1);

/** A band shown honestly: a value or a range, with how many people rated it. */
export function BandRange({
  low,
  high,
  raters,
  size = "md",
  className,
}: {
  low: number | null;
  high?: number | null;
  raters?: number;
  size?: "md" | "lg";
  className?: string;
}) {
  if (low == null) return <span className={cn("font-extrabold text-subtle", className)}>–</span>;
  const range = high != null && high !== low ? `${fmt(low)}–${fmt(high)}` : fmt(low);
  return (
    <span className={cn("inline-flex flex-col", className)}>
      <span className={cn("font-extrabold tracking-[-0.03em] text-ink tabular", size === "lg" ? "text-[44px] leading-none md:text-5xl" : "text-xl")}>
        {range}
      </span>
      {raters != null && <span className="mt-1 text-[13px] text-subtle">{raters} lượt chấm</span>}
    </span>
  );
}

/** One IELTS criterion as a filled bar out of 9. */
export function CriterionRow({ criterion, value }: { criterion: keyof typeof CRITERION_LABELS; value: number | null }) {
  const c = CRITERION_LABELS[criterion];
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 text-sm font-bold text-ink">{c.short}</span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-3">
        <div className="h-full rounded-full bg-voice" style={{ width: `${value == null ? 0 : (value / 9) * 100}%` }} />
      </div>
      <span className="w-8 text-right text-sm font-extrabold tabular">{value == null ? "–" : fmt(value)}</span>
    </div>
  );
}
