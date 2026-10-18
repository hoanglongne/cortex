"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label, Notice } from "@/components/ui/card";
import { BandRange, CRITERION_LABELS } from "@/components/ui/band";
import { FlowShell } from "@/components/ui/shell";
import { formatClock } from "@/components/ui/timer";
import { cn } from "@/lib/utils";

// IELTS Speaking Band Descriptors (simplified for peer assessment)
const BAND_LABELS: Record<number, string> = {
  1: "1 – Non user",
  2: "2 – Intermittent",
  3: "3 – Extremely limited",
  4: "4 – Limited",
  5: "5 – Modest",
  6: "6 – Competent",
  7: "7 – Good",
  8: "8 – Very good",
  9: "9 – Expert",
};

const CRITERIA = [
  { key: "fluency" as const },
  { key: "vocabulary" as const },
  { key: "grammar" as const },
  { key: "pronunciation" as const },
];

// Specific feedback tags per criterion (first 3 positive, last 3 to improve)
const CRITERION_TAGS: Record<string, string[]> = {
  fluency: [
    "Nói tự nhiên",
    "Ý tưởng rõ ràng",
    "Nối ý mạch lạc",
    "Ngập ngừng nhiều",
    "Lặp lại nhiều",
    "Khó theo dõi",
  ],
  vocabulary: [
    "Từ vựng phong phú",
    "Collocation tốt",
    "Dùng idiom tốt",
    "Vốn từ hạn chế",
    "Dùng sai từ",
    "Lạm dụng từ cơ bản",
  ],
  grammar: [
    "Cấu trúc đa dạng",
    "Câu phức tốt",
    "Chia thì đúng",
    "Nhiều lỗi sai",
    "Chỉ dùng câu đơn",
    "Nhầm thì",
  ],
  pronunciation: [
    "Phát âm rõ",
    "Ngữ điệu tốt",
    "Nhấn âm tự nhiên",
    "Khó nghe",
    "Giọng đều đều",
    "Phát âm sai từ quen thuộc",
  ],
};

// Tags that describe a strength (first 3 of each criterion), plus legacy English ones saved earlier
const LEGACY_POSITIVE_TAGS = [
  "Speaks naturally", "Good use of fillers", "Well-organized ideas",
  "Rich vocabulary", "Good collocations", "Uses idioms well",
  "Varied structures", "Good complex sentences", "Accurate tenses",
  "Clear speech", "Good intonation", "Natural stress patterns",
];
export function isPositiveTag(tag: string): boolean {
  return (
    LEGACY_POSITIVE_TAGS.includes(tag) ||
    Object.values(CRITERION_TAGS).some((tags) => tags.slice(0, 3).includes(tag))
  );
}

export interface IELTSScores {
  fluency: number;
  vocabulary: number;
  grammar: number;
  pronunciation: number;
}

interface RatingScreenProps {
  partner: { name: string; band: string };
  callDuration: number;
  onSubmit: (data: {
    scores: IELTSScores;
    wouldMatchAgain: boolean | null;
    tags: string[];
    comments: string;
  }) => Promise<{ error?: string }>;
  onSkip: () => void;
}

// Band Selector Component
function BandSelector({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (band: number) => void;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <div role="group" aria-label={`Band ${label}`} className="grid grid-cols-9 gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((band) => (
          <button
            key={band}
            type="button"
            onClick={() => onChange(band)}
            aria-pressed={band === value}
            className={cn(
              "aspect-square w-full min-w-0 rounded-[var(--radius-control)] border font-mono text-sm tabular transition-colors",
              band === value ? "border-ink bg-ink text-bg" : "border-line-strong text-ink-2 hover:border-muted"
            )}
          >
            {band}
          </button>
        ))}
      </div>
      {value > 0 && <p className="text-xs text-muted">{BAND_LABELS[value]}</p>}
    </div>
  );
}

// Tag Toggle
function TagButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs transition-colors",
        selected ? "border-onair text-onair" : "border-line-strong text-muted hover:text-ink"
      )}
    >
      {label}
    </button>
  );
}

export default function RatingScreen({ partner, callDuration, onSubmit, onSkip }: RatingScreenProps) {
  const [scores, setScores] = useState<IELTSScores>({
    fluency: 0,
    vocabulary: 0,
    grammar: 0,
    pronunciation: 0,
  });
  const [wouldMatchAgain, setWouldMatchAgain] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const allScored = scores.fluency > 0 && scores.vocabulary > 0 && scores.grammar > 0 && scores.pronunciation > 0;
  const overallBand = allScored
    ? Math.round(((scores.fluency + scores.vocabulary + scores.grammar + scores.pronunciation) / 4) * 2) / 2
    : 0;

  const handleSubmit = async () => {
    if (!allScored || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const result = await onSubmit({
        scores,
        wouldMatchAgain,
        tags: selectedTags,
        comments: feedback.trim(),
      });
      if (result?.error) {
        setSubmitError(result.error);
      }
    } catch {
      setSubmitError("Không gửi được đánh giá. Vui lòng thử lại.");
    }
    setIsSubmitting(false);
  };

  return (
    <FlowShell
      title={`Chấm điểm cho ${partner.name}`}
      footer={
        <div className="space-y-2">
          {!allScored && <p className="text-center text-xs text-muted">Chấm đủ 4 tiêu chí để gửi đánh giá.</p>}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onSkip} disabled={isSubmitting}>
              Bỏ qua
            </Button>
            <Button variant="primary" className="flex-1" onClick={handleSubmit} disabled={!allScored || isSubmitting}>
              {isSubmitting ? "Đang gửi…" : "Gửi đánh giá"}
            </Button>
          </div>
        </div>
      }
    >
      <header className="mt-2">
        <h1 className="break-words text-2xl font-semibold tracking-tight text-ink">Chấm điểm cho {partner.name}</h1>
        <p className="mt-2 text-sm text-muted">
          Band <span className="font-mono tabular text-ink-2">{partner.band}</span> ·{" "}
          <span className="font-mono tabular text-ink-2">{formatClock(callDuration)}</span>
        </p>
        <p className="mt-1 text-sm text-muted">
          Điểm của bạn giúp {partner.name} biết cần cải thiện gì. Hãy chấm công bằng.
        </p>
      </header>

      <div className="mt-6 space-y-3">
        {CRITERIA.map((criterion) => {
          const c = CRITERION_LABELS[criterion.key];
          const score = scores[criterion.key];
          const tags = CRITERION_TAGS[criterion.key] || [];

          return (
            <section key={criterion.key} className="rounded-[var(--radius-card)] border border-line bg-surface p-4">
              <h2 className="text-base font-medium text-ink">{c.name}</h2>
              <p className="mb-3 mt-0.5 text-xs text-muted">{c.hint}</p>

              <BandSelector
                value={score}
                label={c.name}
                onChange={(band) => setScores((prev) => ({ ...prev, [criterion.key]: band }))}
              />

              {score > 0 && (
                <div className="mt-4 border-t border-line pt-3">
                  <Label className="mb-2">Nhận xét cụ thể (không bắt buộc)</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <TagButton key={tag} label={tag} selected={selectedTags.includes(tag)} onClick={() => toggleTag(tag)} />
                    ))}
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>

      {allScored && (
        <div className="mt-6 flex items-baseline justify-between gap-3 border-y border-line py-4">
          <div>
            <p className="text-sm text-ink">Band tổng (ước tính)</p>
            <p className="mt-0.5 text-xs text-muted">Trung bình 4 tiêu chí, làm tròn 0,5</p>
          </div>
          <BandRange low={overallBand} size="lg" />
        </div>
      )}

      <fieldset className="mt-6">
        <legend className="mb-2 text-sm text-ink">Muốn luyện lại với bạn này?</legend>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: true, label: "Có" },
            { value: false, label: "Không" },
          ].map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => setWouldMatchAgain(opt.value)}
              aria-pressed={wouldMatchAgain === opt.value}
              className={cn(
                "h-11 rounded-[var(--radius-control)] border text-sm transition-colors",
                wouldMatchAgain === opt.value ? "border-ink bg-ink text-bg" : "border-line-strong text-ink-2 hover:border-muted"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-6">
        <label htmlFor="rating-comments" className="text-sm text-ink">
          Nhận xét thêm
        </label>
        <textarea
          id="rating-comments"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          maxLength={1000}
          placeholder="Lời khuyên cụ thể cho bạn học..."
          className="mt-2 h-28 w-full resize-none rounded-[var(--radius-control)] border border-line-strong bg-surface-2 p-3 font-serif text-base text-ink placeholder:text-subtle focus-visible:border-onair"
        />
        <p className="mt-1 text-right font-mono text-xs tabular text-subtle">{feedback.length}/1000</p>
      </div>

      {submitError && (
        <Notice tone="error" className="mt-4">
          {submitError}
        </Notice>
      )}
    </FlowShell>
  );
}
