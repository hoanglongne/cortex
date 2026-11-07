"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Minus, Plus, RotateCcw } from "lucide-react";
import { CRITERIA } from "@/lib/feedback";
import { CRITERION_LABEL, type Criterion } from "@cortex/classroom-oratio";
import { ANSWER_LABEL, FOCUS, REASONS, inRange, questionsOf, rangeFor, type Answer, type BandRange, type Preset } from "@/lib/evidence";
import { BAND_EXAMPLES } from "@/lib/band-examples";
import { plainLabel } from "@/lib/rating-marks";
import { cn } from "@/lib/utils";

export type Answers = Partial<Record<string, Answer>>;

/** The answers in effect: the rater's own, else what the machine measured. */
export const effectiveAnswers = (own: Answers, presets: Partial<Record<string, Preset>>): Answers => {
  const out: Answers = {};
  for (const [id, p] of Object.entries(presets)) if (p) out[id] = p.answer;
  for (const [id, a] of Object.entries(own)) if (a) out[id] = a;
  return out;
};

interface Props {
  value: Partial<Record<Criterion, number>>;
  /** Called with a band the rater set by hand (it then stays put when the answers change) or one the answers suggest */
  onBand: (c: Criterion, band: number, byHand: boolean) => void;
  answers: Answers;
  onAnswers: (next: Answers) => void;
  presets: Partial<Record<string, Preset>>;
  unsure: readonly Criterion[];
  onUnsure?: (next: Criterion[]) => void;
  reasons: Partial<Record<Criterion, string>>;
  onReason: (c: Criterion, reason: string) => void;
  /** What was counted for the criterion (the line under its name) */
  evidence: (c: Criterion) => string;
  /** Plays the recording from the start */
  onListenAgain: () => void;
  disabled?: boolean;
}

/**
 * One criterion at a time (issue #130): what to listen for, four questions about
 * what can be heard (the machine answers the ones it measured, and says so), a
 * suggested range of two bands, then the band. A band outside the range needs a
 * reason. The last step shows the four together.
 */
export function EvidenceRate({ value, onBand, answers, onAnswers, presets, unsure, onUnsure, reasons, onReason, evidence, onListenAgain, disabled }: Props) {
  const [step, setStep] = React.useState(0);
  // A band picked outside the range waits here until the rater says why
  const [pending, setPending] = React.useState<Partial<Record<Criterion, number>>>({});
  const effective = React.useMemo(() => effectiveAnswers(answers, presets), [answers, presets]);
  const ranges = React.useMemo(() => Object.fromEntries(CRITERIA.map((c) => [c, rangeFor(c, effective)])) as Record<Criterion, BandRange | null>, [effective]);

  const setAnswer = (c: Criterion, id: string, a: Answer) => {
    const next = { ...answers, [id]: a };
    onAnswers(next);
    const r = rangeFor(c, effectiveAnswers(next, presets));
    if (r && pending[c] == null) onBand(c, r.center, false);
  };

  const move = (c: Criterion, delta: number) => {
    const band = pending[c] ?? value[c] ?? 5;
    const next = Math.min(9, Math.max(1, band + delta));
    if (inRange(next, ranges[c]) || reasons[c]) {
      setPending((p) => ({ ...p, [c]: undefined }));
      onBand(c, next, true);
    } else setPending((p) => ({ ...p, [c]: next }));
  };

  if (step >= CRITERIA.length) {
    return (
      <div>
        <p className="text-[12px] leading-snug text-muted">Bốn điểm của bạn. Quay lại một tiêu chí nếu muốn đổi.</p>
        <ul className="mt-1 divide-y divide-line">
          {CRITERIA.map((c, i) => (
            <li key={c} className="flex items-center gap-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-ink">{CRITERION_LABEL[c]}</p>
                <p className="text-[12px] text-subtle">
                  {ranges[c] ? `Gợi ý ${ranges[c]!.low} đến ${ranges[c]!.high}` : "Chưa trả lời câu hỏi nào"}
                  {unsure.includes(c) ? " · Không chắc" : ""}
                  {reasons[c] ? ` · ${reasons[c]}` : ""}
                </p>
              </div>
              <span className="w-7 text-center text-xl font-extrabold tabular text-ink">{value[c] ?? "–"}</span>
              <button type="button" onClick={() => setStep(i)} className="h-8 rounded-full border border-line-strong px-3 text-[12px] font-bold text-ink-2 hover:border-muted">
                Sửa
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const c = CRITERIA[step];
  const range = ranges[c];
  const band = pending[c] ?? value[c] ?? range?.center ?? 5;
  const outside = !inRange(band, range);
  const needsReason = pending[c] != null && !reasons[c];
  const isUnsure = unsure.includes(c);
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-bold text-subtle">
          Tiêu chí {step + 1} / {CRITERIA.length}
        </p>
        <div className="flex gap-1" aria-hidden>
          {CRITERIA.map((x, i) => (
            <span key={x} className={cn("h-1.5 w-6 rounded-full", i === step ? "bg-voice" : i < step ? "bg-voice/40" : "bg-surface-3")} />
          ))}
        </div>
      </div>
      <h3 className="mt-1 text-[16px] font-extrabold tracking-[-0.02em] text-ink">{CRITERION_LABEL[c]}</h3>
      <p className="mt-0.5 flex items-start gap-2 text-[12px] leading-snug text-muted">
        <span className="flex-1">{FOCUS[c]}</span>
        <button type="button" onClick={onListenAgain} aria-label="Nghe lại từ đầu" className="flex h-7 shrink-0 items-center gap-1 rounded-full border border-line-strong px-2 text-[11px] font-bold text-ink-2 hover:border-muted">
          <RotateCcw className="size-3" aria-hidden /> Nghe lại
        </button>
      </p>

      <ul className="mt-2 space-y-2.5">
        {questionsOf(c).map((q) => {
          const own = answers[q.id];
          const preset = presets[q.id];
          const shown = own ?? preset?.answer;
          return (
            <li key={q.id}>
              <p className="text-[13px] font-semibold leading-snug text-ink">{q.text}</p>
              <div role="radiogroup" aria-label={q.text} className="mt-1 grid grid-cols-3 gap-1">
                {(["yes", "some", "no"] as const).map((a) => (
                  <button
                    key={a}
                    type="button"
                    role="radio"
                    aria-checked={shown === a}
                    disabled={disabled}
                    onClick={() => setAnswer(c, q.id, a)}
                    className={cn("h-9 rounded-[10px] border text-[12px] font-bold transition-colors", shown === a ? (own ? "border-voice bg-voice text-on-voice" : "border-voice bg-voice/15 text-ink") : "border-line-strong text-ink-2 hover:border-muted")}
                  >
                    {ANSWER_LABEL[a]}
                  </button>
                ))}
              </div>
              {preset && <p className="mt-0.5 text-[11px] text-subtle">{own ? `Bạn đổi lại. Máy thấy: ${preset.note}` : `Máy gợi ý (${preset.note}). Bấm để xác nhận hoặc đổi.`}</p>}
            </li>
          );
        })}
      </ul>

      <div className="mt-3 rounded-[12px] bg-surface-2 p-3">
        <p className="text-[12px] text-muted">{evidence(c)}</p>
        <p className="mt-1 text-[13px] font-bold text-ink">{range ? `Gợi ý: band ${range.low} đến ${range.high}${range.answered < 4 ? " (trả lời thêm để thu hẹp)" : ""}` : "Trả lời các câu trên để có gợi ý band"}</p>
        <div className="mt-1.5 flex items-center gap-3">
          <div className="flex items-center gap-1.5" role="group" aria-label={`Band ${CRITERION_LABEL[c]}`}>
            <button type="button" aria-label="Giảm 1 band" disabled={disabled || band <= 1} onClick={() => move(c, -1)} className="flex size-9 items-center justify-center rounded-full border border-line-strong text-ink-2 hover:border-muted disabled:opacity-40">
              <Minus className="size-4" aria-hidden />
            </button>
            <span className="w-8 text-center text-2xl font-extrabold tabular text-ink">{band}</span>
            <button type="button" aria-label="Tăng 1 band" disabled={disabled || band >= 9} onClick={() => move(c, 1)} className="flex size-9 items-center justify-center rounded-full border border-line-strong text-ink-2 hover:border-muted disabled:opacity-40">
              <Plus className="size-4" aria-hidden />
            </button>
          </div>
          <p className="text-base font-extrabold leading-tight tracking-[-0.02em] text-voice">{plainLabel(band)}</p>
        </div>
        {(needsReason || (outside && reasons[c])) && (
          <div className="mt-2" role="group" aria-label="Vì sao ngoài khoảng gợi ý">
            <p className="text-[12px] font-semibold text-ink">{needsReason ? `Band ${band} nằm ngoài khoảng gợi ý. Vì sao?` : "Lý do bạn chọn band ngoài khoảng gợi ý:"}</p>
            <div className="mt-1 flex flex-col gap-1">
              {REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  aria-pressed={reasons[c] === r}
                  onClick={() => {
                    onReason(c, r);
                    if (pending[c] != null) {
                      onBand(c, pending[c]!, true);
                      setPending((p) => ({ ...p, [c]: undefined }));
                    }
                  }}
                  className={cn("rounded-[10px] border px-2.5 py-1.5 text-left text-[12px] font-semibold", reasons[c] === r ? "border-voice bg-voice text-on-voice" : "border-line-strong text-ink-2 hover:border-muted")}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          {onUnsure && (
            <button
              type="button"
              aria-pressed={isUnsure}
              disabled={disabled || (!isUnsure && unsure.length >= 3)}
              onClick={() => onUnsure(isUnsure ? unsure.filter((x) => x !== c) : [...unsure, c])}
              className={cn("h-7 rounded-full border px-2.5 text-[11px] font-bold transition-colors disabled:opacity-40", isUnsure ? "border-voice bg-voice text-on-voice" : "border-line-strong text-ink-2 hover:border-muted")}
            >
              {isUnsure ? "Không chắc ✓" : "Không chắc"}
            </button>
          )}
          <details className="text-[11px] text-subtle">
            <summary className="cursor-pointer select-none font-semibold text-ink-2">Band 4, 6, 8 nghe thế nào</summary>
            <ul className="mt-1 space-y-1.5">
              {BAND_EXAMPLES[c].map((e) => (
                <li key={e.band}>
                  <b className="text-ink-2">Band {e.band}:</b> <span lang={c === "pronunciation" ? "vi" : "en"}>{e.sample}</span> <i>({e.why})</i>
                </li>
              ))}
              <li className="text-[10px]">Ví dụ minh hoạ do nhóm Cortex soạn, chưa giáo viên nào duyệt.</li>
            </ul>
          </details>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <button type="button" disabled={step === 0} onClick={() => setStep(step - 1)} className="flex h-10 items-center gap-1 rounded-full border border-line-strong px-3 text-[13px] font-bold text-ink-2 disabled:opacity-40">
          <ChevronLeft className="size-4" aria-hidden /> Trước
        </button>
        <button
          type="button"
          disabled={needsReason}
          onClick={() => {
            if (value[c] == null) onBand(c, band, false);
            setStep(step + 1);
          }}
          className="flex h-10 flex-1 items-center justify-center gap-1 rounded-full bg-voice px-4 text-[13px] font-bold text-on-voice disabled:opacity-50"
        >
          {step === CRITERIA.length - 1 ? "Xem bốn điểm" : "Tiêu chí tiếp"} <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
