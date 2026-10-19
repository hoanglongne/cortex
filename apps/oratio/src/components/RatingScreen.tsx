"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label, Notice } from "@/components/ui/card";
import { BandRange, CRITERION_LABELS } from "@/components/ui/band";
import { RubricSheet } from "@/components/ui/rubric";
import { CRITERIA } from "@/lib/feedback";
import { FlowShell } from "@/components/ui/shell";
import { formatClock } from "@/components/ui/timer";
import { cn } from "@/lib/utils";

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
  /** The examiner's private notes from the call, shown read-only */
  notes?: string;
  onSubmit: (data: {
    scores: IELTSScores;
    wouldMatchAgain: boolean | null;
    tags: string[];
    comments: string;
  }) => Promise<{ error?: string }>;
  onSkip: () => void;
}

// Tag Toggle
function TagButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
        selected ? "border-voice bg-voice-soft font-bold text-voice" : "border-line-strong text-muted hover:text-ink"
      )}
    >
      {label}
    </button>
  );
}

export default function RatingScreen({ partner, callDuration, notes, onSubmit, onSkip }: RatingScreenProps) {
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
      onBack={onSkip}
      backLabel="Bỏ qua chấm điểm"
      wide
      footer={
        <div className="mx-auto flex max-w-md flex-col gap-2">
          {!allScored && <p className="text-center text-xs text-subtle">Chấm đủ 4 tiêu chí để gửi đánh giá.</p>}
          <Button variant="primary" size="lg" block onClick={handleSubmit} disabled={!allScored || isSubmitting}>
            {isSubmitting ? "Đang gửi…" : "Gửi đánh giá"}
          </Button>
          <Button variant="ghost" size="sm" block onClick={onSkip} disabled={isSubmitting}>
            Bỏ qua
          </Button>
        </div>
      }
    >
      <header className="animate-enter">
        <h1 className="break-words text-[28px] font-extrabold leading-tight tracking-[-0.035em] text-ink md:text-[34px]">
          Chấm cho {partner.name}
        </h1>
        <p className="mt-1 text-[15px] text-muted">
          Band <span className="font-bold text-ink-2 tabular">{partner.band}</span> · buổi thi{" "}
          <span className="font-bold text-ink-2 tabular">{formatClock(callDuration)}</span>. Điểm của bạn giúp {partner.name} biết cần cải
          thiện gì, hãy chấm công bằng.
        </p>
      </header>

      {notes && notes.trim() && (
        <section className="mt-6 rounded-[var(--radius-card)] border border-line bg-surface p-4 md:p-5">
          <Label>Ghi chú của bạn</Label>
          <p className="mt-2 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-ink-2">{notes}</p>
        </section>
      )}

      <RubricSheet
        className="mt-6"
        value={scores}
        onChange={(next) => setScores((prev) => ({ ...prev, ...next }))}
        disabled={isSubmitting}
      />

      {CRITERIA.some((k) => scores[k] > 0) && (
        <section className="mt-3 rounded-[var(--radius-card)] border border-line bg-surface p-4 md:p-5">
          <Label className="mb-3">Nhận xét cụ thể (không bắt buộc)</Label>
          <div className="grid gap-4 md:grid-cols-2">
            {CRITERIA.filter((k) => scores[k] > 0).map((k) => (
              <div key={k}>
                <p className="mb-1.5 text-[13px] font-bold text-ink-2">{CRITERION_LABELS[k].short}</p>
                <div className="flex flex-wrap gap-1.5">
                  {CRITERION_TAGS[k].map((tag) => (
                    <TagButton key={tag} label={tag} selected={selectedTags.includes(tag)} onClick={() => toggleTag(tag)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {allScored && (
        <div className="mt-6 flex items-baseline justify-between gap-3 rounded-[var(--radius-card)] border border-line bg-surface p-4 md:p-5">
          <div>
            <p className="text-sm font-bold text-ink">Band tổng (ước tính)</p>
            <p className="mt-0.5 text-xs text-subtle">Trung bình 4 tiêu chí, làm tròn 0,5</p>
          </div>
          <BandRange low={overallBand} size="lg" />
        </div>
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <fieldset>
          <legend className="mb-2 text-sm font-bold text-ink">Muốn luyện lại với bạn này?</legend>
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
                  "h-12 rounded-[var(--radius-control)] border text-[15px] font-bold transition-colors",
                  wouldMatchAgain === opt.value ? "border-ink bg-ink text-bg" : "border-line-strong text-ink-2 hover:border-muted"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="rating-comments" className="text-sm font-bold text-ink">
            Một lời khuyên cho {partner.name}
          </label>
          <textarea
            id="rating-comments"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            maxLength={1000}
            placeholder="Lời khuyên cụ thể cho bạn học..."
            className="mt-2 h-28 w-full resize-none rounded-[var(--radius-control)] border border-line-strong bg-surface-2 p-3 text-[15px] text-ink placeholder:text-subtle focus-visible:border-voice"
          />
          <p className="mt-1 text-right text-xs text-subtle tabular">{feedback.length}/1000</p>
        </div>
      </div>

      {submitError && (
        <Notice tone="error" className="mt-4">
          {submitError}
        </Notice>
      )}
    </FlowShell>
  );
}
