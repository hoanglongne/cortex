import * as React from "react";
import { cn } from "@/lib/utils";

export const CRITERION_LABELS = {
  fluency: { name: "Fluency & Coherence", short: "Fluency", hint: "Trôi chảy, mạch lạc" },
  vocabulary: { name: "Lexical Resource", short: "Vocabulary", hint: "Vốn từ, dùng từ đúng" },
  grammar: { name: "Grammatical Range & Accuracy", short: "Grammar", hint: "Đa dạng và chính xác" },
  pronunciation: { name: "Pronunciation", short: "Pronunciation", hint: "Dễ nghe, rõ ràng" },
} as const;

const fmt = (b: number) => b.toFixed(1);

/**
 * A band shown honestly: a single value or a range, with how many people
 * rated it. Example: "6.0–6.5 · 4 người chấm".
 */
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
  if (low == null) {
    return <span className={cn("font-mono text-muted", className)}>–</span>;
  }
  const range = high != null && high !== low ? `${fmt(low)}–${fmt(high)}` : fmt(low);
  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <span className={cn("font-mono tabular text-ink", size === "lg" ? "text-4xl" : "text-xl")}>{range}</span>
      {raters != null && <span className="text-xs text-muted">{raters} người chấm</span>}
    </span>
  );
}

/** One IELTS criterion with its band as a 9-step bar. */
export function CriterionRow({ criterion, value }: { criterion: keyof typeof CRITERION_LABELS; value: number | null }) {
  const c = CRITERION_LABELS[criterion];
  return (
    <div className="py-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm text-ink">{c.short}</span>
        <span className="font-mono text-sm tabular text-ink">{value == null ? "–" : fmt(value)}</span>
      </div>
      <div className="mt-1.5 grid grid-cols-9 gap-0.5" aria-hidden>
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} className={cn("h-1 rounded-full", value != null && i < Math.round(value) ? "bg-ink-2" : "bg-surface-3")} />
        ))}
      </div>
    </div>
  );
}
