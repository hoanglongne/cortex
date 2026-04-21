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
    description: "Could they speak smoothly and logically? Were ideas well-connected?",
    lowHint: "Long pauses, repetition, hard to follow",
    highHint: "Smooth, natural flow with clear logic",
  },
  {
    key: "vocabulary" as const,
    label: "Lexical Resource",
    icon: BookOpen,
    description: "Did they use a good range of vocabulary? Were words used accurately?",
    lowHint: "Very basic words, frequent errors",
    highHint: "Rich, precise vocabulary used naturally",
  },
  {
    key: "grammar" as const,
    label: "Grammatical Range & Accuracy",
    icon: Brain,
    description: "Did they use varied sentence structures? Were there many grammar errors?",
    lowHint: "Simple sentences, many errors",
    highHint: "Complex structures, rare errors",
  },
  {
    key: "pronunciation" as const,
    label: "Pronunciation",
    icon: Volume2,
    description: "Was their pronunciation clear and easy to understand?",
    lowHint: "Difficult to understand",
    highHint: "Clear, natural pronunciation",
  },
];

// Specific feedback tags per criterion
const CRITERION_TAGS: Record<string, string[]> = {
  fluency: [
    "Speaks naturally",
    "Good use of fillers",
    "Well-organized ideas",
    "Too many pauses",
    "Repetitive",
    "Hard to follow",
  ],
  vocabulary: [
    "Rich vocabulary",
    "Good collocations",
    "Uses idioms well",
    "Limited word range",
    "Word choice errors",
    "Over-reliance on basic words",
  ],
  grammar: [
    "Varied structures",
    "Good complex sentences",
    "Accurate tenses",
    "Frequent errors",
    "Only simple sentences",
    "Tense confusion",
  ],
  pronunciation: [
    "Clear speech",
    "Good intonation",
    "Natural stress patterns",
    "Hard to understand",
    "Monotone delivery",
    "Mispronounces common words",
  ],
};

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
    overallBand: number;
    wouldMatchAgain: boolean | null;
    tags: string[];
    comments: string;
  }) => void;
  onSkip: () => void;
}

// Band Selector Component
function BandSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (band: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-9 gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((band) => (
          <button
            key={band}
            onClick={() => onChange(band)}
            className={`py-2.5 rounded-lg text-sm font-bold transition-all ${band === value
                ? band >= 7
                  ? "bg-emerald-500 text-white ring-2 ring-emerald-400/50 scale-105"
                  : band >= 5
                    ? "bg-blue-500 text-white ring-2 ring-blue-400/50 scale-105"
                    : "bg-amber-500 text-white ring-2 ring-amber-400/50 scale-105"
                : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300"
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
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selected
          ? positive
            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
            : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
          : "bg-zinc-800/60 text-zinc-500 border border-transparent hover:bg-zinc-700 hover:text-zinc-300"
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

  const handleSubmit = () => {
    onSubmit({
      scores,
      overallBand,
      wouldMatchAgain,
      tags: selectedTags,
      comments: feedback,
    });
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
              Session Complete
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
            Evaluate {partner.name}&apos;s Speaking
          </h1>
          <p className="text-zinc-400">
            Band {partner.band} &bull; {formatDuration(callDuration)} session
          </p>
          <p className="text-zinc-500 text-sm mt-2">
            Use the 4 official IELTS Speaking criteria to give constructive feedback
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
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {criterion.description}
                    </p>
                  </div>
                </div>

                {/* Band hints */}
                <div className="flex justify-between text-[10px] text-zinc-600 mb-1 px-0.5">
                  <span>{criterion.lowHint}</span>
                  <span>{criterion.highHint}</span>
                </div>

                {/* Band Selector */}
                <BandSelector
                  value={score}
                  onChange={(band) =>
                    setScores((prev) => ({ ...prev, [criterion.key]: band }))
                  }
                />

                {/* Feedback Tags */}
                {score > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <p className="text-xs text-zinc-500 mb-2">
                      Specific observations (optional):
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
            <p className="text-sm text-zinc-400 mb-1">Estimated Overall Band</p>
            <p className={`text-4xl font-bold ${getOverallColor(overallBand)}`}>
              {overallBand.toFixed(1)}
            </p>
            <p className="text-xs text-zinc-600 mt-1">
              Average of all 4 criteria
            </p>
          </div>
        )}

        {/* Would Match Again */}
        <div className="mt-6 p-5 rounded-2xl bg-zinc-900/60 border border-white/5">
          <p className="text-sm text-zinc-300 mb-3 text-center">
            Would you like to practice with {partner.name} again?
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setWouldMatchAgain(true)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${wouldMatchAgain === true
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                  : "bg-zinc-800 border-transparent text-zinc-400 hover:bg-zinc-700"
                } border`}
            >
              <ThumbsUp className="w-5 h-5" />
              <span className="font-medium">Yes</span>
            </button>
            <button
              onClick={() => setWouldMatchAgain(false)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${wouldMatchAgain === false
                  ? "bg-red-500/20 border-red-500/50 text-red-400"
                  : "bg-zinc-800 border-transparent text-zinc-400 hover:bg-zinc-700"
                } border`}
            >
              <ThumbsDown className="w-5 h-5" />
              <span className="font-medium">No</span>
            </button>
          </div>
        </div>

        {/* Additional Comments */}
        <div className="mt-4 p-5 rounded-2xl bg-zinc-900/60 border border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-zinc-500" />
            <h3 className="text-sm font-semibold text-white">
              Additional Comments
            </h3>
          </div>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Any specific advice for your partner..."
            className="w-full h-24 p-3 rounded-xl bg-zinc-800/50 border border-white/10 text-white text-sm placeholder-zinc-600 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={onSkip}
            className="flex-1 px-6 py-4 rounded-2xl bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all font-medium text-sm"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={!allScored}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-semibold transition-all text-sm ${allScored
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25"
                : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
              }`}
          >
            <span>Submit Evaluation</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

