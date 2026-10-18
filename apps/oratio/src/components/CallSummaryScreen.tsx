"use client";

import { isPositiveTag } from "./RatingScreen";
import { Button } from "@/components/ui/button";
import { Card, Label, Stat } from "@/components/ui/card";
import { CharacterSays } from "@/components/ui/character";
import { useCharacterEnabled } from "@/lib/client/theme";
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
          <span key={tag} className="rounded-full border border-line-strong px-3 py-1 text-xs font-semibold text-ink-2">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function CallSummaryScreen({ sessionData, onGoHome, onPracticeAgain }: CallSummaryScreenProps) {
  const { enabled: characterOn } = useCharacterEnabled();
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
      title="Xong buổi thi"
      wide
      footer={
        <div className="mx-auto flex max-w-md flex-col gap-2 md:flex-row-reverse">
          <Button variant="primary" size="lg" block onClick={onGoHome}>
            Về trang chủ
          </Button>
          <Button variant="secondary" size="lg" block onClick={onPracticeAgain}>
            Thi tiếp với bạn khác
          </Button>
        </div>
      }
    >
      <div className="animate-enter">
        <CharacterSays mood="happy" size={96} enabled={characterOn}>
          Xong một buổi thi với người thật rồi. Làm tốt lắm.
        </CharacterSays>
        <h1 className="mt-5 text-[28px] font-extrabold leading-tight tracking-[-0.035em] text-ink md:text-[34px]">Buổi thi đã xong</h1>
        <p className="mt-1 text-[15px] text-muted">
          Bạn thi với <span className="font-bold text-ink-2">{sessionData.partnerName}</span>, band{" "}
          <span className="font-bold text-ink-2 tabular">{sessionData.partnerBand}</span>.
        </p>

        <Card className="mt-5 grid grid-cols-2 gap-4 md:max-w-md">
          <Stat value={formatClock(sessionData.duration)} label="thời lượng" />
          <Stat value={sessionData.questions.length} unit="câu" label="đã luyện" />
        </Card>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 md:items-start">
        <section>
          <Label className="mb-3">Câu hỏi đã luyện</Label>
          {questionsByPart.length === 0 ? (
            <p className="text-sm text-muted">Không có câu hỏi nào được hỏi.</p>
          ) : (
            <Card className="space-y-5">
              {questionsByPart.map((group) => (
                <div key={group.part}>
                  <p className="mb-1 text-xs font-extrabold uppercase tracking-[0.06em] text-voice">Part {group.part}</p>
                  <ol className="divide-y divide-line">
                    {group.items.map((q, index) => (
                      <li key={index} className="break-words py-2.5 text-[15px] leading-snug text-ink">
                        {q.text}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </Card>
          )}
        </section>

        <section>
          <Label className="mb-3">Bạn đã chấm {sessionData.partnerName}</Label>
          {didEvaluate ? (
            <Card>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm text-muted">Band tổng</span>
                <BandRange low={sessionData.myOverallBand} size="lg" />
              </div>
              <div className="mt-4 space-y-3 border-t border-line pt-4">
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
                  <p className="break-words text-[15px] leading-relaxed text-ink-2">{sessionData.myComments}</p>
                </div>
              )}
            </Card>
          ) : (
            <p className="text-sm text-muted">Bạn đã bỏ qua phần chấm điểm cho buổi này.</p>
          )}

          <Card className="mt-4">
            <Label className="mb-1">Tiếp theo</Label>
            <p className="text-sm text-muted">
              Điểm {sessionData.partnerName} chấm bạn sẽ hiện trong <span className="font-bold text-ink-2">Lịch sử</span> khi họ gửi. Có thể họ chưa gửi ngay.
            </p>
          </Card>
        </section>
      </div>
    </FlowShell>
  );
}
