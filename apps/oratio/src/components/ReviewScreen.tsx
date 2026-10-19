"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, Headphones } from "lucide-react";
import { listMyAnswers, type MyAnswer } from "@/actions/answers";
import { claimNextReview, getReviewStatus, skipReview, submitReview, type ReviewStatus, type ReviewTask } from "@/actions/reviews";
import { CRITERIA, MAX_COMMENT_LENGTH, type CriterionScores } from "@/lib/feedback";
import { useCharacterEnabled } from "@/lib/client/theme";
import type { Profile } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { BandRange, CriterionRow } from "@/components/ui/band";
import { Card, EmptyState, Label, Notice, Pill } from "@/components/ui/card";
import { CharacterSays } from "@/components/ui/character";
import { CueCard } from "@/components/ui/cue-card";
import { RubricSheet } from "@/components/ui/rubric";
import { FlowShell, TabShell, type Tab } from "@/components/ui/shell";
import { cn } from "@/lib/utils";

/** Reviewers may listen to the first two minutes only */
const LISTEN_LIMIT_S = 120;
const MAX_REVIEW_TAGS = 2;
const COMMENT_MAX = Math.min(500, MAX_COMMENT_LENGTH);

const REVIEW_TAGS = [
  "Trôi chảy",
  "Ngập ngừng nhiều",
  "Từ vựng đa dạng",
  "Lặp từ",
  "Ngữ pháp chắc",
  "Nhiều lỗi ngữ pháp",
  "Phát âm rõ",
  "Khó nghe",
  "Ý tưởng rõ ràng",
  "Trả lời hơi ngắn",
];

interface ReviewScreenProps {
  profile: Profile | null;
  onTab: (tab: Tab) => void;
}

const leftText = (n: number) => `Còn ${n} lượt gửi`;

/** The "Chấm" tab: score other people's answers, see how yours were scored. */
export default function ReviewScreen({ onTab }: ReviewScreenProps) {
  const { enabled: characterOn } = useCharacterEnabled();
  const [status, setStatus] = useState<ReviewStatus | null>(null);
  const [answers, setAnswers] = useState<MyAnswer[] | null>(null);
  const [task, setTask] = useState<ReviewTask | null>(null);
  const [busy, setBusy] = useState(false);
  const [queueEmpty, setQueueEmpty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<number | null>(null);

  const refreshStatus = useCallback(async () => {
    try {
      const r = await getReviewStatus();
      if (r.status) setStatus(r.status);
    } catch {
      /* the screen still works without the status line */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [s, a] = await Promise.all([getReviewStatus(), listMyAnswers({ submittedOnly: true, limit: 20 })]);
        if (cancelled) return;
        if (s.status) setStatus(s.status);
        setAnswers(a.answers ?? []);
      } catch {
        if (!cancelled) setAnswers([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const claim = async () => {
    setBusy(true);
    setError(null);
    setQueueEmpty(false);
    try {
      const r = await claimNextReview();
      if (r.error) setError(r.error);
      else if (r.task) setTask(r.task);
      else setQueueEmpty(true);
    } catch {
      setError("Không lấy được câu để chấm. Thử lại nhé.");
    }
    setBusy(false);
  };

  const skip = async () => {
    if (!task) return;
    const id = task.answerId;
    setTask(null);
    try {
      await skipReview(id);
    } catch {
      /* the claim simply expires */
    }
    await claim();
  };

  if (task) {
    return (
      <ReviewTaskView
        key={task.answerId}
        task={task}
        onExit={() => {
          // Leaving without scoring hands the answer back to the queue
          void skipReview(task.answerId).catch(() => {});
          setTask(null);
          void refreshStatus();
        }}
        onSkip={skip}
        onSubmitted={(left) => {
          setSent(left);
          setTask(null);
          void refreshStatus();
        }}
      />
    );
  }

  const waiting = status?.waiting ?? 0;
  const reliabilityPct = status?.reliability != null ? Math.round(status.reliability * 100) : null;

  return (
    <TabShell tab="review" onTab={onTab} title="Chấm chéo">
      {sent != null && (
        <Notice tone="good" className="mb-4">
          Đã gửi điểm, cảm ơn bạn. {leftText(sent)}.
        </Notice>
      )}

      <Card className="flex flex-col gap-4 md:p-6">
        <CharacterSays mood="listen" enabled={characterOn}>
          Chấm 2 câu của người khác, mình mở cho bạn 1 lượt gửi câu của bạn đi chấm. Câu đầu tiên miễn phí.
        </CharacterSays>

        {status ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-extrabold tracking-tight text-ink tabular">{leftText(status.submissionsLeft)}</p>
                <p className="mt-0.5 text-xs text-subtle">Chấm 2 câu được gửi 1 câu</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold tracking-tight text-ink tabular">{status.reviewsGiven}</p>
                <p className="mt-0.5 text-xs text-subtle">câu bạn đã chấm</p>
              </div>
            </div>

            <div className="border-t border-line pt-4">
              <div className="flex items-center justify-between gap-3">
                <Label>Độ chuẩn</Label>
                {status.trusted && <Pill tone="good">Tin cậy</Pill>}
              </div>
              {reliabilityPct == null ? (
                <p className="mt-2 text-sm text-muted">Chấm thêm vài câu để có độ chuẩn.</p>
              ) : (
                <div className="mt-2 flex items-center gap-3">
                  <div
                    role="progressbar"
                    aria-label="Độ chuẩn"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={reliabilityPct}
                    className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-3"
                  >
                    <div className="h-full rounded-full bg-good" style={{ width: `${reliabilityPct}%` }} />
                  </div>
                  <span className="w-12 text-right text-sm font-extrabold tabular">{reliabilityPct}%</span>
                </div>
              )}
              <p className="mt-2 text-[13px] text-subtle">
                Một số câu đã có band của giáo viên. Chấm khớp với band đó thì độ chuẩn của bạn tăng, và điểm bạn chấm có trọng số cao hơn.
              </p>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted">Chưa tải được trạng thái chấm chéo.</p>
        )}

        {error && <Notice tone="error">{error}</Notice>}

        {queueEmpty ? (
          <EmptyState title="Chưa có câu nào chờ chấm">Gửi câu của bạn ở Tập một mình.</EmptyState>
        ) : null}

        <div className="flex flex-col gap-2">
          <Button variant="primary" size="lg" block onClick={claim} disabled={busy}>
            <Headphones /> {busy ? "Đang tìm câu…" : sent != null ? "Chấm câu tiếp" : "Chấm một câu"}
          </Button>
          {status && (
            <p className="text-center text-[13px] text-subtle">
              {waiting > 0 ? `${waiting} câu đang chờ chấm` : "Hiện chưa có câu nào chờ"}
            </p>
          )}
        </div>
      </Card>

      <section className="mt-8">
        <Label className="mb-3">Câu của bạn đã gửi</Label>
        {answers == null ? (
          <div className="h-20 animate-pulse rounded-[var(--radius-card)] bg-surface-2" aria-busy />
        ) : answers.length === 0 ? (
          <EmptyState title="Bạn chưa gửi câu nào">Gửi một câu ở Tập một mình để người khác chấm cho bạn.</EmptyState>
        ) : (
          <ul className="flex flex-col gap-2">
            {answers.map((a) => (
              <SentAnswer key={a.id} answer={a} />
            ))}
          </ul>
        )}
      </section>
    </TabShell>
  );
}

function SentAnswer({ answer }: { answer: MyAnswer }) {
  const [open, setOpen] = useState(false);
  const band = answer.band;
  const panelId = `sent-${answer.id}`;
  return (
    <li className="rounded-[var(--radius-card)] border border-line bg-surface">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 block text-[15px] font-bold text-ink">{answer.questionText}</span>
          <span className="mt-0.5 block text-[13px] text-subtle">
            Part {answer.part} · {new Date(answer.submittedAt ?? answer.createdAt).toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" })}
          </span>
        </span>
        {band ? <BandRange low={band.low} high={band.high} /> : <Pill tone="pending">Đang chờ chấm</Pill>}
        <ChevronDown className={cn("size-4 shrink-0 text-subtle transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <div id={panelId} className="flex flex-col gap-4 border-t border-line p-4">
          {band ? (
            <>
              <div className="flex flex-col gap-2.5">
                {CRITERIA.map((c) => (
                  <CriterionRow key={c} criterion={c} value={band.criteria[c]} />
                ))}
              </div>
              <p className="text-[13px] text-subtle">{band.raters} lượt chấm</p>
            </>
          ) : (
            <p className="text-sm text-muted">Câu này chưa có ai chấm. Thường có điểm trong vài giờ.</p>
          )}
          {answer.reviews.some((r) => r.comment || r.tags.length > 0) && (
            <ul className="flex flex-col gap-2">
              {answer.reviews
                .filter((r) => r.comment || r.tags.length > 0)
                .map((r, i) => (
                  <li key={i} className="rounded-[12px] bg-surface-2 p-3">
                    {r.tags.length > 0 && (
                      <div className="mb-1.5 flex flex-wrap gap-1.5">
                        {r.tags.map((t) => (
                          <Pill key={t}>{t}</Pill>
                        ))}
                      </div>
                    )}
                    {r.comment && <p className="text-sm leading-relaxed text-ink-2">“{r.comment}”</p>}
                    <p className="mt-1 text-xs text-subtle">Người chấm ẩn danh</p>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}

function ReviewTaskView({
  task,
  onExit,
  onSkip,
  onSubmitted,
}: {
  task: ReviewTask;
  onExit: () => void;
  onSkip: () => void;
  onSubmitted: (submissionsLeft: number) => void;
}) {
  const [scores, setScores] = useState<Partial<CriterionScores>>({});
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitHit, setLimitHit] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const complete = CRITERIA.every((c) => scores[c] != null);

  const toggleTag = (t: string) =>
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : prev.length >= MAX_REVIEW_TAGS ? prev : [...prev, t]));

  const stopAtLimit = () => {
    const el = audioRef.current;
    if (el && el.currentTime >= LISTEN_LIMIT_S) {
      el.pause();
      el.currentTime = LISTEN_LIMIT_S;
      setLimitHit(true);
    }
  };

  const submit = async () => {
    if (!complete || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const r = await submitReview({
        answerId: task.answerId,
        scores: scores as CriterionScores,
        tags,
        comment: comment.trim() || null,
      });
      if (r.error) setError(r.error);
      else onSubmitted(r.submissionsLeft ?? 0);
    } catch {
      setError("Không gửi được điểm. Thử lại nhé.");
    }
    setSubmitting(false);
  };

  return (
    <FlowShell
      title="Chấm chéo"
      onBack={onExit}
      backLabel="Thoát, không chấm"
      wide
      footer={
        <div className="mx-auto flex max-w-md flex-col gap-2">
          {!complete && <p className="text-center text-xs text-subtle">Chấm đủ 4 tiêu chí để gửi điểm.</p>}
          <Button variant="primary" size="lg" block onClick={submit} disabled={!complete || submitting}>
            {submitting ? "Đang gửi…" : "Gửi điểm"}
          </Button>
          <Button variant="ghost" size="sm" block onClick={onSkip} disabled={submitting}>
            Bỏ qua
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-[1fr_1.4fr] md:items-start">
        <div className="flex flex-col gap-3 md:sticky md:top-6">
          <CueCard question={{ part: task.part, category: "Câu của người khác", question_text: task.questionText }} />
          <Card>
            <Label className="mb-2">Nghe câu trả lời</Label>
            <audio
              ref={audioRef}
              src={task.audioUrl}
              controls
              preload="metadata"
              onTimeUpdate={stopAtLimit}
              onSeeked={stopAtLimit}
              className="w-full"
            />
            <p className="mt-2 text-[13px] text-subtle" aria-live="polite">
              {limitHit ? "Đã nghe đủ 2 phút, đủ để chấm rồi." : "Bạn nghe tối đa 2 phút đầu của câu trả lời."}
            </p>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <RubricSheet value={scores} onChange={setScores} disabled={submitting} />

          <Card>
            <Label className="mb-2">Nhận xét nhanh (chọn tối đa {MAX_REVIEW_TAGS})</Label>
            <div className="flex flex-wrap gap-1.5">
              {REVIEW_TAGS.map((t) => {
                const on = tags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTag(t)}
                    aria-pressed={on}
                    disabled={!on && tags.length >= MAX_REVIEW_TAGS}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-40",
                      on ? "border-voice bg-voice-soft font-bold text-voice" : "border-line-strong text-muted hover:text-ink"
                    )}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            <label htmlFor="review-comment" className="mt-4 block text-sm font-bold text-ink">
              Một câu góp ý (không bắt buộc)
            </label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={COMMENT_MAX}
              placeholder="Ví dụ: Ý hay, thử nối ý bằng thêm từ nối nhé."
              className="mt-2 h-24 w-full resize-none rounded-[var(--radius-control)] border border-line-strong bg-surface-2 p-3 text-[15px] text-ink placeholder:text-subtle focus-visible:border-voice"
            />
            <p className="mt-1 text-right text-xs text-subtle tabular">
              {comment.length}/{COMMENT_MAX}
            </p>
          </Card>

          {error && <Notice tone="error">{error}</Notice>}
        </div>
      </div>
    </FlowShell>
  );
}
