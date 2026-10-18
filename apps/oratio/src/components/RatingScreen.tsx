"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label, Notice } from "@/components/ui/card";
import { BandRange, CRITERION_LABELS } from "@/components/ui/band";
import { FlowShell } from "@/components/ui/shell";
import { formatClock } from "@/components/ui/timer";
import { cn } from "@/lib/utils";

// One line per band, paraphrasing the public IELTS speaking band descriptors for peer rating
const BAND_DESCRIPTORS: Record<"fluency" | "vocabulary" | "grammar" | "pronunciation", Record<number, string>> = {
  fluency: {
    4: "Trả lời ngắt quãng, ngập ngừng nhiều; nối ý đơn giản, đôi lúc khó theo dõi.",
    5: "Giữ được nhịp nói nhưng hay lặp, tự sửa hoặc chậm lại; từ nối còn đơn điệu.",
    6: "Nói được dài, đôi khi mất mạch lạc vì lặp hoặc tự sửa; từ nối chưa luôn phù hợp.",
    7: "Nói dài không cần cố gắng, thỉnh thoảng ngập ngừng hay tự sửa; dùng từ nối linh hoạt.",
    8: "Nói trôi chảy, hiếm khi lặp; ngập ngừng thường là để tìm ý chứ không phải tìm từ.",
    9: "Nói trôi chảy tự nhiên, ý mạch lạc và được phát triển đầy đủ.",
  },
  vocabulary: {
    4: "Chỉ nói được chủ đề quen thuộc; hay dùng sai từ hoặc lặp từ.",
    5: "Nói được chủ đề quen thuộc, ít khi diễn đạt lại được; vốn từ còn hạn chế.",
    6: "Vốn từ đủ để bàn chủ đề dài; đôi khi dùng từ chưa chuẩn nhưng vẫn diễn đạt lại được.",
    7: "Dùng từ linh hoạt, có idiom và collocation, dù đôi lúc chưa chính xác.",
    8: "Vốn từ rộng, diễn đạt linh hoạt, dùng idiom ít gặp tốt; chỉ sai nhỏ thỉnh thoảng.",
    9: "Dùng từ chính xác và tự nhiên ở mọi chủ đề, kể cả idiom.",
  },
  grammar: {
    4: "Chủ yếu câu đơn; lỗi nhiều và có thể gây khó hiểu.",
    5: "Câu đơn khá chuẩn, câu phức còn hạn chế và thường có lỗi.",
    6: "Pha trộn câu đơn và câu phức; còn lỗi nhưng hiếm khi gây khó hiểu.",
    7: "Dùng khá linh hoạt nhiều cấu trúc phức; nhiều câu không lỗi, còn lỗi nhỏ.",
    8: "Cấu trúc đa dạng, phần lớn câu không lỗi; thỉnh thoảng sai nhỏ.",
    9: "Cấu trúc đa dạng, tự nhiên và chính xác; chỉ có lỗi nhỏ hiếm gặp.",
  },
  pronunciation: {
    4: "Nhiều lỗi phát âm, thường gây khó hiểu; người nghe phải cố gắng.",
    5: "Còn lỗi phát âm, đôi lúc khó hiểu; ảnh hưởng của tiếng mẹ đẻ khá rõ.",
    6: "Đủ rõ để hiểu, dù có lúc phát âm sai khiến người nghe phải đoán.",
    7: "Phát âm tốt nhưng chưa đều; dễ hiểu xuyên suốt, giọng ít ảnh hưởng.",
    8: "Dùng tốt ngữ điệu và trọng âm; ít lỗi, rất dễ hiểu.",
    9: "Phát âm, ngữ điệu và trọng âm tự nhiên, duy trì suốt buổi.",
  },
};

const BAND_CHOICES = [4, 5, 6, 7, 8, 9];

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

// Band Selector Component
function BandSelector({
  criterion,
  value,
  onChange,
  label,
}: {
  criterion: keyof typeof BAND_DESCRIPTORS;
  value: number;
  onChange: (band: number) => void;
  label: string;
}) {
  return (
    <div className="space-y-2.5">
      <div role="group" aria-label={`Band ${label}`} className="grid grid-cols-6 gap-1.5">
        {BAND_CHOICES.map((band) => (
          <button
            key={band}
            type="button"
            onClick={() => onChange(band)}
            aria-pressed={band === value}
            className={cn(
              "h-11 w-full min-w-0 rounded-[12px] border text-base font-extrabold tabular transition-colors",
              band === value ? "border-voice bg-voice text-on-voice" : "border-line-strong text-ink-2 hover:border-muted"
            )}
          >
            {band}
          </button>
        ))}
      </div>
      <p className="min-h-10 text-[13px] leading-snug text-muted" aria-live="polite">
        {value > 0 ? `Band ${value}: ${BAND_DESCRIPTORS[criterion][value]}` : "Chạm để chấm"}
      </p>
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

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {CRITERIA.map((criterion) => {
          const c = CRITERION_LABELS[criterion.key];
          const score = scores[criterion.key];
          const tags = CRITERION_TAGS[criterion.key] || [];

          return (
            <section key={criterion.key} className="rounded-[var(--radius-card)] border border-line bg-surface p-4 md:p-5">
              <h2 className="text-lg font-extrabold tracking-[-0.02em] text-ink">{c.short}</h2>
              <p className="mb-3 mt-0.5 text-[13px] text-subtle">
                {c.name} · {c.hint}
              </p>

              <BandSelector
                criterion={criterion.key}
                value={score}
                label={c.name}
                onChange={(band) => setScores((prev) => ({ ...prev, [criterion.key]: band }))}
              />

              {score > 0 && (
                <div className="mt-3 border-t border-line pt-3">
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
