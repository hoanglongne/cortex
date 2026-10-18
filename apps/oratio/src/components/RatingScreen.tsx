"use client";

import { useState } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  ChevronRight,
  Sparkles,
  Mic,
  BookOpen,
  Brain,
  Volume2,
} from "lucide-react";

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
  {
    key: "fluency" as const,
    label: "Fluency & Coherence",
    icon: Mic,
    description: "Nói trôi chảy, ít ngập ngừng",
    lowHint: "Ngắt quãng nhiều, khó theo dõi",
    highHint: "Trôi chảy, ý tưởng mạch lạc",
  },
  {
    key: "vocabulary" as const,
    label: "Lexical Resource (Vocabulary)",
    icon: BookOpen,
    description: "Dùng từ đa dạng, đúng ngữ cảnh",
    lowHint: "Từ vựng đơn giản, hay sai",
    highHint: "Từ vựng phong phú, chính xác",
  },
  {
    key: "grammar" as const,
    label: "Grammatical Range & Accuracy",
    icon: Brain,
    description: "Câu đúng ngữ pháp, có câu phức",
    lowHint: "Chỉ câu đơn, nhiều lỗi",
    highHint: "Cấu trúc đa dạng, ít lỗi",
  },
  {
    key: "pronunciation" as const,
    label: "Pronunciation",
    icon: Volume2,
    description: "Phát âm rõ, dễ nghe",
    lowHint: "Khó hiểu",
    highHint: "Rõ ràng, tự nhiên",
  },
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
      <div
        role="group"
        aria-label={`Band ${label}`}
        className="grid grid-cols-5 min-[400px]:grid-cols-9 gap-1.5"
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((band) => (
          <button
            key={band}
            type="button"
            onClick={() => onChange(band)}
            aria-pressed={band === value}
            className={`py-2.5 rounded-lg text-sm font-bold transition-all ${band === value
                ? band >= 7
                  ? "bg-emerald-500 text-white ring-2 ring-emerald-400/50"
                  : band >= 5
                    ? "bg-blue-500 text-white ring-2 ring-blue-400/50"
                    : "bg-amber-500 text-white ring-2 ring-amber-400/50"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300"
              }`}
          >
            {band}
          </button>
        ))}
      </div>
      {value > 0 && (
        <p className="text-xs text-center text-zinc-400">{BAND_LABELS[value]}</p>
      )}
    </div>
  );
}

// Tag Toggle
function TagButton({
  label,
  selected,
  positive,
  onClick,
}: {
  label: string;
  selected: boolean;
  positive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selected
          ? positive
            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
            : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
          : "bg-zinc-800/60 text-zinc-400 border border-transparent hover:bg-zinc-700 hover:text-zinc-300"
        }`}
    >
      {label}
    </button>
  );
}

export default function RatingScreen({
  partner,
  callDuration,
  onSubmit,
  onSkip,
}: RatingScreenProps) {
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
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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

  const getOverallColor = (band: number) => {
    if (band >= 7) return "text-emerald-400";
    if (band >= 5) return "text-blue-400";
    return "text-amber-400";
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="max-w-2xl mx-auto px-4 lg:px-8 py-6 lg:py-10">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-4">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">
              Buổi luyện đã kết thúc
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2 break-words">
            Chấm điểm cho {partner.name}
          </h1>
          <p className="text-zinc-400">
            Band {partner.band} &bull; {formatDuration(callDuration)}
          </p>
          <p className="text-zinc-500 text-sm mt-2">
            Điểm của bạn giúp {partner.name} biết cần cải thiện gì. Hãy chấm công bằng.
          </p>
        </header>

        {/* IELTS Criteria Cards */}
        <div className="space-y-4">
          {CRITERIA.map((criterion) => {
            const Icon = criterion.icon;
            const score = scores[criterion.key];
            const tags = CRITERION_TAGS[criterion.key] || [];

            return (
              <div
                key={criterion.key}
                className="p-5 rounded-2xl bg-zinc-900/60 border border-white/5"
              >
                {/* Criterion Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-zinc-800 shrink-0">
                    <Icon className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white">
                      {criterion.label}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {criterion.description}
                    </p>
                  </div>
                </div>

                {/* Band Selector */}
                <BandSelector
                  value={score}
                  label={criterion.label}
                  onChange={(band) =>
                    setScores((prev) => ({ ...prev, [criterion.key]: band }))
                  }
                />

                {/* Band hints */}
                <div className="flex justify-between gap-3 text-[11px] text-zinc-500 mt-2">
                  <span>1: {criterion.lowHint}</span>
                  <span className="text-right">9: {criterion.highHint}</span>
                </div>

                {/* Feedback Tags */}
                {score > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <p className="text-xs text-zinc-500 mb-2">
                      Nhận xét cụ thể (không bắt buộc):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag, i) => (
                        <TagButton
                          key={tag}
                          label={tag}
                          selected={selectedTags.includes(tag)}
                          positive={i < 3}
                          onClick={() => toggleTag(tag)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Overall Band Preview */}
        {allScored && (
          <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border border-white/10 text-center">
            <p className="text-sm text-zinc-400 mb-1">Band tổng (ước tính)</p>
            <p className={`text-4xl font-bold ${getOverallColor(overallBand)}`}>
              {overallBand.toLocaleString("vi-VN", { minimumFractionDigits: 1 })}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Trung bình 4 tiêu chí, làm tròn 0,5
            </p>
          </div>
        )}

        {/* Would Match Again */}
        <div className="mt-6 p-5 rounded-2xl bg-zinc-900/60 border border-white/5">
          <p className="text-sm text-zinc-300 mb-3 text-center">
            Bạn có muốn luyện tập với {partner.name} lần nữa không?
          </p>
          <div className="flex justify-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setWouldMatchAgain(true)}
              aria-pressed={wouldMatchAgain === true}
              className={`flex items-center gap-2 px-5 sm:px-6 py-3 rounded-xl transition-all ${wouldMatchAgain === true
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                  : "bg-zinc-800 border-transparent text-zinc-400 hover:bg-zinc-700"
                } border`}
            >
              <ThumbsUp className="w-5 h-5" />
              <span className="font-medium">Có</span>
            </button>
            <button
              type="button"
              onClick={() => setWouldMatchAgain(false)}
              aria-pressed={wouldMatchAgain === false}
              className={`flex items-center gap-2 px-5 sm:px-6 py-3 rounded-xl transition-all ${wouldMatchAgain === false
                  ? "bg-red-500/20 border-red-500/50 text-red-400"
                  : "bg-zinc-800 border-transparent text-zinc-400 hover:bg-zinc-700"
                } border`}
            >
              <ThumbsDown className="w-5 h-5" />
              <span className="font-medium">Không</span>
            </button>
          </div>
        </div>

        {/* Additional Comments */}
        <div className="mt-4 p-5 rounded-2xl bg-zinc-900/60 border border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-zinc-500" />
            <label htmlFor="rating-comments" className="text-sm font-semibold text-white">
              Nhận xét thêm
            </label>
          </div>
          <textarea
            id="rating-comments"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            maxLength={1000}
            placeholder="Lời khuyên cụ thể cho bạn học..."
            className="w-full h-24 p-3 rounded-xl bg-zinc-800/50 border border-white/10 text-white text-sm placeholder-zinc-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          />
          <p className="mt-1 text-right text-xs text-zinc-500">{feedback.length}/1000</p>
        </div>

        {/* Submit error */}
        {submitError && (
          <p
            role="alert"
            className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-400"
          >
            {submitError}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            type="button"
            onClick={onSkip}
            disabled={isSubmitting}
            className="flex-1 px-6 py-4 rounded-2xl bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Bỏ qua
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!allScored || isSubmitting}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-semibold transition-all text-sm ${allScored && !isSubmitting
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              }`}
          >
            <span>{isSubmitting ? "Đang gửi…" : "Gửi đánh giá"}</span>
            {!isSubmitting && <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
        {!allScored && (
          <p className="mt-3 text-center text-xs text-zinc-500">
            Chấm đủ 4 tiêu chí để gửi đánh giá.
          </p>
        )}
      </div>
    </div>
  );
}
