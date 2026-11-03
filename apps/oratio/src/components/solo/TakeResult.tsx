"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card, Notice, Pill } from "@/components/ui/card";
import { AudioPlayer } from "@/components/ui/audio-player";
import { Character } from "@/components/ui/character";
import { formatClock } from "@/components/ui/timer";
import { cn } from "@/lib/utils";
import { TranscribingHint } from "@/components/ui/transcribing-hint";
import { SelfRatingCard } from "./SelfRating";
import { SendToClass } from "./SendToClass";
import { SendForReview } from "./SendForReview";
import { checkGoal, fmtMs, goalText, okMetrics, txMetrics, type Take } from "./take";

type Row = {
  key: string;
  label: string;
  value: string;
  help: string;
  /** current and previous raw numbers, for the arrow */
  now?: number;
  before?: number;
  /** which direction is better; "none" when it is only a style, not a quality */
  better: "up" | "down" | "none";
  unit?: string;
  extra?: React.ReactNode;
};

function Delta({ row }: { row: Row }) {
  if (row.now === undefined || row.before === undefined) return null;
  const diff = Math.round((row.now - row.before) * 100) / 100;
  if (diff === 0) return <span className="text-xs font-bold text-subtle">như lần trước</span>;
  const good = row.better === "none" ? null : row.better === "up" ? diff > 0 : diff < 0;
  return (
    <span className={cn("text-xs font-bold tabular", good === null ? "text-subtle" : good ? "text-good-edge dark:text-good" : "text-pending-ink")}>
      {diff > 0 ? "↑" : "↓"} {Math.abs(diff)}{row.unit ?? ""}
      <span className="sr-only">{good === null ? "" : good ? ", tốt hơn" : ", chưa tốt bằng"}</span>
    </span>
  );
}

function buildRows(take: Take, prev?: Take): Row[] {
  const m = okMetrics(take);
  const pm = okMetrics(prev);
  const rows: Row[] = [];
  if (m) {
    rows.push(
      {
        key: "speak",
        label: "Thời gian nói",
        value: fmtMs(m.speakingMs),
        help: "Thời gian có tiếng nói, không tính chỗ im lặng.",
        now: Math.round(m.speakingMs / 1000),
        before: pm ? Math.round(pm.speakingMs / 1000) : undefined,
        better: "up",
        unit: "s",
      },
      {
        key: "pauses",
        label: "Quãng ngừng dài",
        value: String(m.longPauses),
        help: "Số lần im lặng từ 1,5 giây trở lên giữa hai đoạn nói.",
        now: m.longPauses,
        before: pm?.longPauses,
        better: "down",
      }
    );
  }
  const t = txMetrics(take);
  if (t) {
    const pt = txMetrics(prev);
    rows.push(
      {
        key: "wpm",
        label: "Từ/phút",
        value: String(Math.round(t.wpm)),
        help: "Tốc độ nói trung bình cả câu, tính cả lúc ngừng. Nhanh hay chậm là phong cách, không phải đúng sai.",
        now: Math.round(t.wpm),
        before: pt ? Math.round(pt.wpm) : undefined,
        better: "none",
      },
      {
        key: "run",
        label: "Độ dài lượt nói",
        value: String(t.meanRunWords),
        help: "Số từ bạn thường nói được trước khi dừng. Người nói trôi chảy giữ được những lượt nói dài và ngắt ở ranh giới giữa các ý.",
        now: t.meanRunWords,
        before: pt?.meanRunWords,
        better: "up",
      },
      {
        key: "fillers",
        label: "Từ đệm",
        value: String(t.fillers),
        help: "um, uh, you know… Máy có thể bỏ sót vài từ nên đây là mức tối thiểu.",
        now: t.fillers,
        before: pt?.fillers,
        better: "down",
      },
      {
        key: "div",
        label: "Độ đa dạng từ",
        value: `${Math.round(t.lexicalDiversity * 100)}%`,
        help: "Tỉ lệ từ không bị lặp lại. Càng cao, bạn càng ít lặp từ.",
        now: Math.round(t.lexicalDiversity * 100),
        before: pt ? Math.round(pt.lexicalDiversity * 100) : undefined,
        better: "up",
        unit: "%",
      },
      {
        key: "lexica",
        label: "Từ Lexica đã dùng",
        value: String(take.lexica.length),
        help: "Từ bạn đã lưu trong Lexica mà bạn vừa nói ra.",
        now: take.lexica.length,
        before: pt ? (prev?.lexica.length ?? 0) : undefined,
        better: "up",
      }
    );
  }
  return rows;
}

function Transcript({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-[12px] border border-line">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left text-sm font-bold text-ink"
      >
        Chép lời bài nói
        <ChevronDown className={cn("size-4 text-subtle transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && <p className="border-t border-line px-3.5 py-3 text-[15px] leading-relaxed text-ink-2">{text}</p>}
    </div>
  );
}

export function TakeResult({
  take,
  prev,
  lo,
  characterOn,
  demo,
  onSent,
  drillLabel,
  selfPlace = "inline",
  selfOpen = false,
  onSelfOpen,
}: {
  take: Take;
  prev?: Take;
  lo: number;
  characterOn: boolean;
  demo: boolean;
  onSent: () => void;
  drillLabel?: string;
  /** Where the self-rating card is drawn: here, or beside the question on a wide screen */
  selfPlace?: "inline" | "side";
  selfOpen?: boolean;
  onSelfOpen?: (open: boolean) => void;
}) {
  if (take.metrics === undefined) {
    return (
      <div className="animate-enter space-y-3">
        <p className="text-sm font-semibold text-muted" aria-live="polite">
          Đang đo thời gian nói…
        </p>
        <audio controls src={take.url} className="h-10 w-full" />
      </div>
    );
  }

  const m = okMetrics(take);
  const rows = buildRows(take, prev);
  const outcome = take.goal ? checkGoal(take.goal, take, prev) : null;
  const short = !!m && m.speakingMs / 1000 < lo;
  const happy = outcome ? outcome.state === "met" : !!m && !short;

  return (
    <div className="animate-enter space-y-3">
      <div className="flex items-center gap-3">
        {characterOn && <Character mood={happy ? "happy" : "idle"} size={52} decorative />}
        <div className="min-w-0">
          {drillLabel && <Pill tone="voice">{drillLabel}</Pill>}
          <h2 className="mt-0.5 text-xl font-extrabold tracking-[-0.03em] text-ink">{m ? `Bạn nói ${fmtMs(m.speakingMs)}` : `Bạn ghi được ${formatClock(take.seconds)}`}</h2>
          <p className="mt-0.5 text-[13px] leading-snug text-muted">
            {!m
              ? "Mình chưa đo được chỗ ngừng trong bản ghi này, nhưng bạn vẫn nghe lại được."
              : prev
                ? "So với lần trước, mũi tên chỉ hướng thay đổi."
                : short
                  ? "Hơi ngắn, thử thêm một lý do hoặc ví dụ rồi nói lại."
                  : "Đây là lần đầu, các số bên dưới là mốc để so với lần nói lại."}
          </p>
        </div>
      </div>

      {take.goal && outcome && (
        <Notice tone={outcome.state === "met" ? "good" : "info"}>
          <span className="font-extrabold">Mục tiêu: {goalText(take.goal)}.</span>{" "}
          {outcome.state === "met" ? "Đạt. " : outcome.state === "missed" ? "Chưa đạt. " : ""}
          {outcome.detail}
        </Notice>
      )}

      {rows.length > 0 && (
        <>
          <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {rows.map((r) => (
              <li key={r.key} className="rounded-[12px] border border-line px-3 py-2" title={r.help}>
                <p className="truncate text-[12px] font-bold text-muted">{r.label}</p>
                <p className="flex items-baseline gap-1.5">
                  <span className="text-xl font-extrabold tracking-tight text-ink tabular">{r.value}</span>
                  <Delta row={r} />
                </p>
              </li>
            ))}
          </ul>
          {take.lexica.length > 0 && (
            <p className="flex flex-wrap items-center gap-1.5 text-[12px] text-muted">
              Từ Lexica bạn vừa nói:
              {take.lexica.slice(0, 8).map((w) => (
                <Pill key={w} tone="listen">
                  {w}
                </Pill>
              ))}
            </p>
          )}
          <details className="group text-[12px] text-subtle">
            <summary className="cursor-pointer list-none font-bold text-ink-2 hover:text-ink">Mỗi chỉ số nghĩa là gì?</summary>
            <dl className="mt-1.5 space-y-1">
              {rows.map((r) => (
                <div key={r.key}>
                  <dt className="inline font-bold text-ink-2">{r.label}: </dt>
                  <dd className="inline">{r.help}</dd>
                </div>
              ))}
            </dl>
          </details>
        </>
      )}

      {take.tx.status === "pending" && (
        <TranscribingHint loaded={1} />
      )}
      {take.tx.status === "failed" && <p className="text-sm text-muted">Không chép lời được lần này. Các chỉ số về thời gian ở trên vẫn đúng.</p>}
      {take.tx.status === "off" && <p className="text-sm text-subtle">Chưa bật chép lời nên chưa có các chỉ số về từ ngữ. Bật ở tab Tôi, mục Giao diện.</p>}
      {take.tx.status === "done" && take.tx.text && <Transcript text={take.tx.text} />}

      {/* While rating, its own player is on screen: not two of them */}
      {!selfOpen && (
        <Card className="p-3 sm:p-3">
          <AudioPlayer src={take.url} seconds={take.seconds} />
        </Card>
      )}

      {take.save === "failed" && <p className="text-sm text-subtle">Chưa lưu được lần nói này vào lịch sử. Bạn cứ tiếp tục tập nhé.</p>}
      {!demo && selfPlace === "inline" && take.save === "saved" && take.answerId && (
        <SelfRatingCard id={take.answerId} src={take.url} seconds={take.seconds} machine={okMetrics(take) ? { longPauses: okMetrics(take)!.longPauses } : undefined} words={take.tx.words} open={selfOpen} onOpenChange={(o) => onSelfOpen?.(o)} />
      )}
      {!demo && take.save === "saved" && take.answerId && <SendToClass answerId={take.answerId} blob={take.blob} submitted={take.submitted} onSent={onSent} />}
      {!demo && take.save === "saved" && take.answerId && (
        <SendForReview answerId={take.answerId} blob={take.blob} submitted={take.submitted} onSent={onSent} />
      )}
    </div>
  );
}

/** 4/3/2: the same answer three times, side by side. */
export function DrillSummary({ takes }: { takes: Take[] }) {
  return (
    <Card className="space-y-3">
      <p className="text-sm font-bold text-ink">Ba lần nói cùng một bài</p>
      <div className="grid grid-cols-3 gap-2 text-center">
        {takes.map((t, i) => {
          const m = okMetrics(t);
          const tm = txMetrics(t);
          return (
            <div key={t.id} className="rounded-[12px] bg-surface-2 p-2.5">
              <p className="text-xs font-extrabold uppercase tracking-[0.06em] text-subtle">
                Lần {i + 1} · {formatClock(t.drillTarget ?? 0)}
              </p>
              <p className="mt-1.5 text-xl font-extrabold text-ink tabular">{tm ? Math.round(tm.wpm) : "–"}</p>
              <p className="text-xs text-subtle">từ/phút</p>
              <p className="mt-1.5 text-xl font-extrabold text-ink tabular">{m ? m.longPauses : "–"}</p>
              <p className="text-xs text-subtle">quãng ngừng dài</p>
            </div>
          );
        })}
      </div>
      <p className="text-[13px] text-muted">Nói cùng nội dung trong thời gian ngắn dần thường làm bài trôi hơn. Nếu thấy từ/phút tăng mà quãng ngừng giảm, đó là dấu hiệu tốt.</p>
    </Card>
  );
}
