"use client";

import { useState } from "react";
import {
  Clock,
  MessageCircle,
  Mic,
  Award,
  ChevronDown,
  ChevronUp,
  Target,
  BookOpen,
  Volume2,
  Brain,
  Home,
  RotateCcw,
  Tag,
  CheckCircle2,
  Inbox,
} from "lucide-react";

interface CallSummaryScreenProps {
  sessionData: SessionData;
  onGoHome: () => void;
  onPracticeAgain: () => void;
}

interface SessionData {
  duration: number;
  topicsDiscussed: string[];
  partnerName: string;
  partnerBand: string;
  myScores: {
    fluency: number;
    vocabulary: number;
    grammar: number;
    pronunciation: number;
  } | null;
  myOverallBand: number | null;
  myTags: string[];
  myComments: string;
}

// Score Bar Component
function ScoreBar({
  icon: Icon,
  label,
  score,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  score: number;
  delay?: number;
}) {
  const percentage = (score / 9) * 100;

  const getColor = (score: number) => {
    if (score >= 7) return "from-emerald-500 to-emerald-400";
    if (score >= 6) return "from-[#80c0f4] to-[#9dcce4]";
    if (score >= 5) return "from-amber-500 to-amber-400";
    return "from-red-500 to-red-400";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-zinc-500" />
          <span className="text-sm font-medium text-zinc-300">{label}</span>
        </div>
        <span className="text-sm font-semibold text-white">{score.toFixed(1)}</span>
      </div>
      <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getColor(score)} transition-all duration-1000 ease-out`}
          style={{
            width: `${percentage}%`,
            transitionDelay: `${delay}ms`,
          }}
        />
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subtext?: string;
}) {
  return (
    <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-zinc-800">
          <Icon className="w-4 h-4 text-[#80c0f4]" />
        </div>
        <span className="text-sm text-zinc-500">{label}</span>
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
      {subtext && <p className="text-xs text-zinc-600 mt-1">{subtext}</p>}
    </div>
  );
}

// Expandable Section Component
function ExpandableSection({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl bg-zinc-900/60 border border-white/5 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-[#80c0f4]" />
          <span className="font-semibold text-white">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-zinc-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-zinc-500" />
        )}
      </button>
      {isOpen && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

// Main Call Summary Screen Component
export default function CallSummaryScreen({
  sessionData,
  onGoHome,
  onPracticeAgain,
}: CallSummaryScreenProps) {
  const didEvaluate = sessionData.myScores !== null && sessionData.myOverallBand !== null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return `${hours}h ${remainingMins}m`;
    }
    return `${mins}m ${secs}s`;
  };

  // Separate tags into strengths (positive) and improvements (negative)
  const positiveTags = [
    "Speaks naturally", "Good use of fillers", "Well-organized ideas",
    "Rich vocabulary", "Good collocations", "Uses idioms well",
    "Varied structures", "Good complex sentences", "Accurate tenses",
    "Clear speech", "Good intonation", "Natural stress patterns",
  ];
  const strengths = sessionData.myTags.filter((t) => positiveTags.includes(t));
  const improvements = sessionData.myTags.filter((t) => !positiveTags.includes(t));

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-6 lg:py-10">
        {/* Header */}
        <header className="text-center mb-8 lg:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 mb-4">
            <Award className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">
              Session Summary
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
            Practice Session Complete
          </h1>
          <p className="text-zinc-400">
            You practiced with {sessionData.partnerName} for{" "}
            {formatDuration(sessionData.duration)}
          </p>
        </header>

        {/* Session Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Clock}
            label="Duration"
            value={formatDuration(sessionData.duration)}
          />
          <StatCard
            icon={MessageCircle}
            label="Topics"
            value={sessionData.topicsDiscussed.length.toString()}
          />
          <StatCard
            icon={Mic}
            label="Partner"
            value={sessionData.partnerName}
            subtext={`Band ${sessionData.partnerBand}`}
          />
          <StatCard
            icon={Award}
            label="You Gave"
            value={didEvaluate ? `Band ${sessionData.myOverallBand!.toFixed(1)}` : "Skipped"}
          />
        </div>

        {/* Partner's feedback for YOU - pending */}
        <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/5 mb-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10 shrink-0">
              <Inbox className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">
                Your Partner&apos;s Feedback
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {sessionData.partnerName}&apos;s evaluation of your speaking will appear in your{" "}
                <span className="text-blue-400 font-medium">Call History</span> once
                they submit it. Check back later!
              </p>
            </div>
          </div>
        </div>

        {/* Your evaluation of partner */}
        {didEvaluate ? (
          <ExpandableSection
            title={`Your Evaluation of ${sessionData.partnerName}`}
            icon={CheckCircle2}
            defaultOpen={false}
          >
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm text-zinc-500">
                  You rated {sessionData.partnerName}:
                </span>
                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-sm font-semibold text-blue-400 border border-blue-500/20">
                  Overall Band {sessionData.myOverallBand!.toFixed(1)}
                </span>
              </div>

              <ScoreBar
                icon={Mic}
                label="Fluency & Coherence"
                score={sessionData.myScores!.fluency}
                delay={0}
              />
              <ScoreBar
                icon={BookOpen}
                label="Lexical Resource"
                score={sessionData.myScores!.vocabulary}
                delay={100}
              />
              <ScoreBar
                icon={Brain}
                label="Grammatical Range & Accuracy"
                score={sessionData.myScores!.grammar}
                delay={200}
              />
              <ScoreBar
                icon={Volume2}
                label="Pronunciation"
                score={sessionData.myScores!.pronunciation}
                delay={300}
              />

              {/* Tags you gave */}
              {(strengths.length > 0 || improvements.length > 0) && (
                <div className="pt-4 border-t border-white/5 space-y-3">
                  {strengths.length > 0 && (
                    <div>
                      <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">Strengths you noted</p>
                      <div className="flex flex-wrap gap-2">
                        {strengths.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 rounded-full bg-emerald-500/10 text-xs text-emerald-400 border border-emerald-500/20"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {improvements.length > 0 && (
                    <div>
                      <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">Areas you flagged</p>
                      <div className="flex flex-wrap gap-2">
                        {improvements.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 rounded-full bg-amber-500/10 text-xs text-amber-400 border border-amber-500/20"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Your comments */}
              {sessionData.myComments && (
                <div className="pt-4 border-t border-white/5">
                  <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">Your comment</p>
                  <p className="text-sm text-zinc-300 italic">
                    &ldquo;{sessionData.myComments}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </ExpandableSection>
        ) : (
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/5 mb-6">
            <p className="text-sm text-zinc-500 text-center">
              You skipped the evaluation for this session.
            </p>
          </div>
        )}

        {/* Topics Discussed */}
        {sessionData.topicsDiscussed.length > 0 && (
          <div className="mt-6">
            <ExpandableSection title="Topics Discussed" icon={MessageCircle}>
              <div className="flex flex-wrap gap-2">
                {sessionData.topicsDiscussed.map((topic, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 rounded-full bg-zinc-800 text-sm text-zinc-300"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </ExpandableSection>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <button
            onClick={onGoHome}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-all font-medium"
          >
            <Home className="w-5 h-5" />
            <span>Go Home</span>
          </button>
          <button
            onClick={onPracticeAgain}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold transition-all shadow-lg shadow-blue-500/25"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Practice Again</span>
          </button>
        </div>
      </div>
    </div>
  );
}

