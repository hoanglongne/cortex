"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { BAND_DESCRIPTORS } from "@/lib/band-descriptors";
import { CRITERIA, type CriterionScores } from "@/lib/feedback";
import { GUIDE, outsideNote, suggestBand, type Answer } from "@/lib/rating-guide";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { CRITERION_LABEL } from "@cortex/classroom-oratio";
import { CRITERION_LABELS } from "./band";

const BANDS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const CHOICES: { value: Answer; label: string }[] = [
  { value: "yes", label: "Có" },
  { value: "some", label: "Thỉnh thoảng" },
  { value: "no", label: "Không" },
];

/**
 * Rating one criterion at a time (issue #130). For each criterion the rater
 * answers a few questions about what they heard; a range of two bands is
 * suggested from the answers and the rater picks the band. Used for rating
 * yourself and for rating a partner, so both feel the same.
 *
 * `hints` are numbers the machine measured (pauses, words a minute), shown next
 * to the criterion they relate to as something to check against, never as a score.
 */
export function GuidedRating({
  value,
  onChange,
  disabled = false,
  hints,
  className,
}: {
  value: Partial<CriterionScores>;
  onChange: (next: Partial<CriterionScores>) => void;
  disabled?: boolean;
  hints?: Partial<Record<(typeof CRITERIA)[number], string>>;
  className?: string;
}) {
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, Answer | undefined>>({});
  const done = CRITERIA.filter((c) => value[c] != null).length;
  const last = step >= CRITERIA.length;

  return (
    <div className={cn("space-y-3", className)}>
      <ol className="flex gap-1.5" aria-label="Tiến độ chấm">
        {CRITERIA.map((c, i) => (
          <li key={c} className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setStep(i)}
              aria-current={i === step ? "step" : undefined}
              className={cn("w-full rounded-full px-1 py-1.5 text-[12px] font-bold transition-colors", i === step ? "bg-voice text-on-voice" : value[c] != null ? "bg-surface-3 text-ink" : "border border-line-strong text-subtle")}
            >
              {value[c] != null ? `${CRITERION_LABEL[c]} ${value[c]}` : CRITERION_LABEL[c]}
            </button>
          </li>
        ))}
      </ol>

      {!last ? (
        <CriterionStep
          key={CRITERIA[step]}
          criterion={CRITERIA[step]}
          index={step}
          band={value[CRITERIA[step]]}
          answers={answers}
          hint={hints?.[CRITERIA[step]]}
          disabled={disabled}
          onAnswer={(id, a) => setAnswers((prev) => ({ ...prev, [id]: prev[id] === a ? undefined : a }))}
          onBand={(b) => onChange({ ...value, [CRITERIA[step]]: b })}
          onNext={() => setStep(step + 1)}
          onBack={step > 0 ? () => setStep(step - 1) : undefined}
        />
      ) : (
        <section className="rounded-[var(--radius-card)] border border-line bg-surface p-4">
          <h3 className="text-base font-extrabold tracking-[-0.02em] text-ink">Tóm tắt</h3>
          <ul className="mt-2 divide-y divide-line">
            {CRITERIA.map((c, i) => (
              <li key={c} className="flex items-center gap-3 py-2 text-sm">
                <span className="flex-1 font-semibold text-ink">{CRITERION_LABEL[c]}</span>
                <span className="tabular text-lg font-extrabold text-ink">{value[c] ?? "—"}</span>
                <button type="button" onClick={() => setStep(i)} className="text-xs font-semibold text-voice">
                  Sửa
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[13px] text-subtle">{done === CRITERIA.length ? "Đã chấm đủ 4 tiêu chí." : "Còn tiêu chí chưa chấm, bấm Sửa để chấm."}</p>
        </section>
      )}
    </div>
  );
}

function CriterionStep({
  criterion,
  index,
  band,
  answers,
  hint,
  disabled,
  onAnswer,
  onBand,
  onNext,
  onBack,
}: {
  criterion: (typeof CRITERIA)[number];
  index: number;
  band: number | undefined;
  answers: Record<string, Answer | undefined>;
  hint?: string;
  disabled: boolean;
  onAnswer: (id: string, a: Answer) => void;
  onBand: (b: number) => void;
  onNext: () => void;
  onBack?: () => void;
}) {
  const label = CRITERION_LABELS[criterion];
  const guide = GUIDE[criterion];
  const suggestion = suggestBand(criterion, answers);
  const note = band != null ? outsideNote(band, suggestion) : null;

  return (
    <section className="rounded-[var(--radius-card)] border border-line bg-surface p-4">
      <p className="text-[12px] font-bold uppercase tracking-wide text-subtle">
        Tiêu chí {index + 1}/{CRITERIA.length}
      </p>
      <h3 className="text-lg font-extrabold tracking-[-0.02em] text-ink">
        {CRITERION_LABEL[criterion]} <span className="text-sm font-semibold text-subtle">({label.name})</span>
      </h3>
      <p className="mt-1 rounded-lg bg-surface-2 px-3 py-2 text-[13px] leading-snug text-ink-2">{guide.listenFor}</p>
      {hint && (
        <p className="mt-2 text-[13px] leading-snug text-muted">
          <span className="font-bold text-ink-2">Máy đo: </span>
          {hint} <span className="text-subtle">(tham khảo, không phải điểm)</span>
        </p>
      )}

      <ul className="mt-3 space-y-3">
        {guide.questions.map((q) => (
          <li key={q.id}>
            <p className="text-sm font-semibold leading-snug text-ink">{q.text}</p>
            <div role="group" aria-label={q.text} className="mt-1.5 grid grid-cols-3 gap-1.5">
              {CHOICES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  disabled={disabled}
                  aria-pressed={answers[q.id] === c.value}
                  onClick={() => onAnswer(q.id, c.value)}
                  className={cn(
                    "h-10 rounded-[10px] border px-1 text-[13px] font-bold transition-colors disabled:opacity-50",
                    answers[q.id] === c.value ? "border-voice bg-voice text-on-voice" : "border-line-strong text-ink-2 hover:border-muted"
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[12px] text-subtle">Không chắc thì bỏ qua câu đó.</p>

      <div className="mt-4 border-t border-line pt-3">
        <p className="text-sm font-bold text-ink" aria-live="polite">
          {suggestion ? (
            <>
              Gợi ý: band <span className="text-voice">{suggestion.low}</span> đến <span className="text-voice">{suggestion.high}</span>
            </>
          ) : (
            "Trả lời ít nhất 3 câu để có gợi ý band"
          )}
        </p>
        <div role="group" aria-label={`Band ${label.name}`} className="mt-2 grid grid-cols-9 gap-1">
          {BANDS.map((b) => {
            const inRange = suggestion != null && b >= suggestion.low && b <= suggestion.high;
            return (
              <button
                key={b}
                type="button"
                disabled={disabled}
                aria-pressed={b === band}
                onClick={() => onBand(b)}
                className={cn(
                  "h-11 min-w-0 rounded-[10px] border text-[15px] font-extrabold tabular transition-colors disabled:opacity-50",
                  b === band ? "border-voice bg-voice text-on-voice" : inRange ? "border-voice/60 bg-voice/10 text-ink" : "border-line-strong text-ink-2 hover:border-muted"
                )}
              >
                {b}
              </button>
            );
          })}
        </div>
        <p className="mt-2 min-h-[2.5rem] text-[13px] leading-snug text-muted" aria-live="polite">
          {band ? `Band ${band}: ${BAND_DESCRIPTORS[criterion][band]}` : "Chọn band bạn thấy gần nhất."}
        </p>
        {note && <p className="text-[13px] font-semibold text-warning">{note}</p>}
      </div>

      <details className="group mt-2 rounded-lg border border-line">
        <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-[13px] font-bold text-ink-2">
          So với người nói ở band 4, 6, 8
          <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden />
        </summary>
        <dl className="space-y-2 px-3 pb-3 text-[13px] leading-snug">
          {([4, 6, 8] as const).map((b) => (
            <div key={b} className="flex gap-3">
              <dt className="w-14 shrink-0 font-extrabold text-ink">Band {b}</dt>
              <dd className="text-muted">{guide.anchors[b]}</dd>
            </div>
          ))}
        </dl>
      </details>

      <div className="mt-4 flex gap-2">
        {onBack && (
          <Button variant="secondary" onClick={onBack} disabled={disabled}>
            Trước
          </Button>
        )}
        <Button variant="primary" className="flex-1" onClick={onNext} disabled={disabled || band == null}>
          {index === CRITERIA.length - 1 ? "Xem tóm tắt" : "Tiêu chí tiếp"}
        </Button>
      </div>
    </section>
  );
}
