"use client";

import { isPositiveTag } from "./RatingScreen";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/card";
import { BandRange, CriterionRow } from "@/components/ui/band";
import { FlowShell } from "@/components/ui/shell";
import { formatClock } from "@/components/ui/timer";

interface CallSummaryScreenProps {
  sessionData: SessionData;
  onGoHome: () => void;
  onPracticeAgain: () => void;
}

interface SessionData {
  duration: number;
  questions: { part: number; text: string }[];
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

function TagList({ title, tags }: { title: string; tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <div>
      <Label className="mb-2">{title}</Label>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span key={tag} className="rounded-full border border-line-strong px-3 py-1 text-xs text-ink-2">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function CallSummaryScreen({ sessionData, onGoHome, onPracticeAgain }: CallSummaryScreenProps) {
  const didEvaluate = sessionData.myScores !== null && sessionData.myOverallBand !== null;

  // Separate tags into strengths (positive) and improvements (negative)
  const strengths = sessionData.myTags.filter((t) => isPositiveTag(t));
  const improvements = sessionData.myTags.filter((t) => !isPositiveTag(t));

  // Group questions by Part, keeping the order they were asked
  const questionsByPart = [1, 2, 3]
    .map((part) => ({
      part,
      items: sessionData.questions.filter((q) => q.part === part),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <FlowShell
      title="Tổng kết buổi thi"
      footer={
        <div className="space-y-2">
          <Button variant="primary" size="lg" block onClick={onPracticeAgain}>
            Thi tiếp
          </Button>
          <Button variant="ghost" block onClick={onGoHome}>
            Về trang chủ
          </Button>
        </div>
      }
    >
      <header className="mt-2">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Buổi thi đã xong</h1>
        <p className="mt-2 text-sm text-muted">
          Bạn thi với <span className="text-ink-2">{sessionData.partnerName}</span> (band{" "}
          <span className="font-mono tabular">{sessionData.partnerBand}</span>) trong{" "}
          <span className="font-mono tabular text-ink-2">{formatClock(sessionData.duration)}</span>.
        </p>
      </header>

      <section className="mt-8">
        <Label className="mb-3">Câu hỏi đã luyện</Label>
        {questionsByPart.length === 0 ? (
          <p className="text-sm text-muted">Không có câu hỏi nào được hỏi.</p>
        ) : (
          <div className="space-y-5">
            {questionsByPart.map((group) => (
              <div key={group.part}>
                <p className="mb-1 font-mono text-xs text-muted">Part {group.part}</p>
                <ol className="divide-y divide-line border-y border-line">
                  {group.items.map((q, index) => (
                    <li key={index} className="break-words py-3 font-serif text-base leading-snug text-ink">
                      {q.text}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <Label className="mb-3">Bạn đã chấm {sessionData.partnerName}</Label>
        {didEvaluate ? (
          <div className="rounded-[var(--radius-card)] border border-line bg-surface p-4">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm text-muted">Band tổng</span>
              <BandRange low={sessionData.myOverallBand} size="lg" />
            </div>
            <div className="mt-3 divide-y divide-line border-t border-line">
              <CriterionRow criterion="fluency" value={sessionData.myScores!.fluency} />
              <CriterionRow criterion="vocabulary" value={sessionData.myScores!.vocabulary} />
              <CriterionRow criterion="grammar" value={sessionData.myScores!.grammar} />
              <CriterionRow criterion="pronunciation" value={sessionData.myScores!.pronunciation} />
            </div>

            {(strengths.length > 0 || improvements.length > 0) && (
              <div className="mt-4 space-y-3 border-t border-line pt-4">
                <TagList title="Điểm mạnh bạn ghi nhận" tags={strengths} />
                <TagList title="Cần cải thiện bạn ghi nhận" tags={improvements} />
              </div>
            )}

            {sessionData.myComments && (
              <div className="mt-4 border-t border-line pt-4">
                <Label className="mb-2">Nhận xét của bạn</Label>
                <p className="break-words font-serif text-base leading-relaxed text-ink-2">{sessionData.myComments}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted">Bạn đã bỏ qua phần chấm điểm cho buổi này.</p>
        )}
      </section>

      <p className="mt-8 text-sm text-muted">
        Điểm {sessionData.partnerName} chấm bạn sẽ hiện trong <span className="text-ink-2">Lịch sử</span> khi họ gửi. Có thể
        họ chưa gửi ngay.
      </p>
    </FlowShell>
  );
}
