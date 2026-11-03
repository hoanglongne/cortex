"use client";

import * as React from "react";
import { Minus, Play, Plus, Undo2 } from "lucide-react";
import { CRITERION_LABEL } from "@cortex/classroom-oratio";
import { CRITERIA, type CriterionScores } from "@/lib/feedback";
import { profileUrl, type SpeechProfile } from "@/lib/client/speech-metrics";
import { loadWhisper, transcribeWords, useTranscribeChoice } from "@/lib/client/whisper";
import { analyzeWords } from "@/lib/speech-words";
import { clock, evidenceLine, MARK_KINDS, mapVerdict, plainLabel, suggestBands, type Machine, type Mark, type MarkKind } from "@/lib/rating-marks";
import { AudioPlayer } from "./audio-player";
import { SpeechMap } from "./speech-map";
import { SpeechXray } from "./speech-xray";
import { XrayCoach } from "./xray-coach";
import { insightsFor } from "@/lib/speech-insights";
import { addSummary, compare, compareLine, previousOf, readHistory, summaryOf, type Delta } from "@/lib/speech-history";
import { cn } from "@/lib/utils";
import { Button } from "./button";

const DOT: Record<MarkKind, string> = {
  pause: "bg-streak",
  repeat: "bg-subtle",
  good: "bg-good",
  grammar: "bg-danger",
  unclear: "bg-listen",
};

/**
 * Rate by listening and tapping (issue #130). Step 1: play the answer and tap
 * a button whenever you hear a pause, a good word, a mistake or something you
 * could not catch; no knowledge of the bands needed. Step 2: four bands start
 * from those taps (and from the machine's numbers) and the rater only confirms
 * or nudges them with + and −. Used for rating yourself and for rating a partner.
 */
export function ListenRate({
  src,
  seconds,
  limitSeconds,
  value,
  onChange,
  machine,
  historyKey,
  disabled = false,
  className,
}: {
  src: string;
  /** Length of the recording, when known before it loads */
  seconds?: number;
  /** The rater may listen to this much only (peer rating) */
  limitSeconds?: number;
  value: Partial<CriterionScores>;
  onChange: (next: Partial<CriterionScores>) => void;
  machine?: Machine;
  /** Which recording this is, to keep your numbers and compare with the take before (your own takes only) */
  historyKey?: string;
  disabled?: boolean;
  className?: string;
}) {
  const audio = React.useRef<HTMLAudioElement>(null);
  const [marks, setMarks] = React.useState<Mark[]>([]);
  const [duration, setDuration] = React.useState(seconds ?? 0);
  const [phase, setPhase] = React.useState<"listen" | "confirm">(CRITERIA.every((c) => value[c] != null) ? "confirm" : "listen");
  const [flash, setFlash] = React.useState("");
  const [limitHit, setLimitHit] = React.useState(false);
  // Bands the rater changed by hand: going back to listen more does not overwrite them
  const touched = React.useRef<Set<string>>(new Set());
  const [profile, setProfile] = React.useState<SpeechProfile | null>(null);
  const [time, setTime] = React.useState(0);
  // The long pauses the machine found, judged one by one: looking for a word, or just thinking
  const [judged, setJudged] = React.useState<Record<number, "search" | "think">>({});
  const [active, setActive] = React.useState<number | null>(null);

  // "Soi lời nói": the words with their timing, made on this device
  const { choice, setChoice } = useTranscribeChoice();
  const [xray, setXray] = React.useState<ReturnType<typeof analyzeWords> | null>(null);
  const [xrayState, setXrayState] = React.useState<"idle" | "loading" | "ready" | "failed">("idle");
  const [loaded, setLoaded] = React.useState(0);
  const started = React.useRef(false);
  const [deltas, setDeltas] = React.useState<Delta[] | null>(null);
  const [trend, setTrend] = React.useState<number[]>([]);
  const insights = React.useMemo(() => (xray ? insightsFor(xray.tokens, xray.gaps, xray.stats) : []), [xray]);

  // Your numbers over time: compare with the take before this one, then keep this one
  React.useEffect(() => {
    if (!xray || !historyKey) return;
    const list = readHistory();
    const now = summaryOf(historyKey, xray.stats);
    const before = previousOf(historyKey, list);
     
    setDeltas(before ? compare(before, now) : null);
    const next = addSummary(now, list);
    setTrend(next.slice(-8).map((s) => s.midPerMinute));
  }, [xray, historyKey]);

  React.useEffect(() => {
    if (choice !== "on" || started.current) return;
    started.current = true;
    let live = true;
     
    setXrayState("loading");
    void (async () => {
      try {
        await loadWhisper((f) => live && setLoaded(f));
        const blob = await (await fetch(src)).blob();
        const { words } = await transcribeWords(blob);
        if (!live) return;
        const heard = words ? words.filter((w) => !limitSeconds || w.start < limitSeconds) : null;
        if (heard && heard.length >= 8) {
          setXray(analyzeWords(heard));
          setXrayState("ready");
        } else setXrayState("failed");
      } catch {
        if (live) setXrayState("failed");
      }
    })();
    return () => {
      live = false;
      started.current = false;
    };
  }, [choice, src, limitSeconds]);

  React.useEffect(() => {
    let live = true;
    void profileUrl(src).then((p) => live && setProfile(p));
    return () => {
      live = false;
    };
  }, [src]);

  // Pauses inside the part the rater may hear; the three longest, in the order they happen
  const moments = React.useMemo(() => {
    if (!profile) return [];
    return profile.pauses
      .map((p, i) => ({ ...p, i }))
      .filter((p) => !limitSeconds || p.startMs / 1000 < limitSeconds)
      .sort((a, b) => b.endMs - b.startMs - (a.endMs - a.startMs))
      .slice(0, 3)
      .sort((a, b) => a.startMs - b.startMs);
  }, [profile, limitSeconds]);
  const foundPauses = profile ? profile.pauses.filter((p) => !limitSeconds || p.startMs / 1000 < limitSeconds).length : null;
  const searching = Object.entries(judged).filter(([, v]) => v === "search").length;
  const thinking = Object.entries(judged).filter(([, v]) => v === "think").length;
  // Judged pauses become taps, so the band counts them once
  const allMarks = React.useMemo<Mark[]>(
    () => [...marks, ...moments.filter((m) => judged[m.i] === "search").map((m) => ({ kind: "pause" as const, t: m.startMs / 1000 }))],
    [marks, moments, judged]
  );
  const machineNow: Machine | undefined = foundPauses != null ? { longPauses: foundPauses, reviewed: Object.keys(judged).length } : machine;

  const play = (from: number, to?: number) => {
    const el = audio.current;
    if (!el) return;
    el.currentTime = Math.max(0, from);
    void el.play().catch(() => undefined);
    if (to != null) {
      const stop = () => {
        if (el.currentTime >= to) {
          el.pause();
          el.removeEventListener("timeupdate", stop);
        }
      };
      el.addEventListener("timeupdate", stop);
    }
  };

  const shownLength = limitSeconds ? Math.min(duration || limitSeconds, limitSeconds) : duration;

  const mark = (kind: MarkKind) => {
    const el = audio.current;
    const t = el?.currentTime ?? 0;
    setMarks((m) => [...m, { kind, t }]);
    const label = MARK_KINDS.find((k) => k.kind === kind)?.label ?? "";
    setFlash(`Đã đánh dấu: ${label} lúc ${clock(t)}`);
  };

  const stopAtLimit = () => {
    const el = audio.current;
    if (limitSeconds && el && el.currentTime >= limitSeconds) {
      el.pause();
      el.currentTime = limitSeconds;
      setLimitHit(true);
    }
  };

  const toConfirm = () => {
    const start = suggestBands({ marks: allMarks, seconds: shownLength || duration || 60, machine: machineNow, speech: xray?.stats });
    const next: Partial<CriterionScores> = { ...value };
    for (const c of CRITERIA) if (!touched.current.has(c)) next[c] = start[c];
    onChange(next);
    setPhase("confirm");
  };

  const nudge = (c: (typeof CRITERIA)[number], delta: number) => {
    touched.current.add(c);
    onChange({ ...value, [c]: Math.min(9, Math.max(1, (value[c] ?? 5) + delta)) });
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="rounded-[var(--radius-card)] border border-line bg-surface p-4">
        <AudioPlayer
          src={src}
          seconds={seconds}
          audioRef={audio}
          limitSeconds={limitSeconds}
          onDuration={setDuration}
          onTimeUpdate={(t) => {
            setTime(t);
            stopAtLimit();
          }}
          onSeeked={stopAtLimit}
        />
        {limitSeconds && (
          <p className="mt-2 text-[13px] text-subtle" aria-live="polite">
            {limitHit ? `Đã nghe đủ ${Math.round(limitSeconds / 60)} phút, đủ để chấm rồi.` : `Bạn nghe tối đa ${Math.round(limitSeconds / 60)} phút đầu của câu trả lời.`}
          </p>
        )}
      </div>

      {phase === "listen" ? (
        <section className="rounded-[var(--radius-card)] border border-line bg-surface p-4">
          {profile && (
            <div className="mb-4">
              <h3 className="text-base font-extrabold tracking-[-0.02em] text-ink">Máy đã nghe trước giúp bạn</h3>
              <p className="mb-2 mt-0.5 text-[13px] leading-snug text-muted">
                {foundPauses === 0 ? "Không có chỗ dừng dài nào. Chạm vào bản đồ để nghe từ chỗ đó." : `Có ${foundPauses} chỗ người nói dừng lâu (vùng vàng). Chạm vào bản đồ để nghe từ chỗ đó.`}
              </p>
              <SpeechMap profile={profile} time={time} limitSeconds={limitSeconds} marks={allMarks} activePause={active} onSeek={(sec) => play(sec)} />

              {!xray && moments.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {moments.map((m, n) => (
                    <li key={m.i} className="rounded-[12px] border border-line p-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActive(m.i);
                            play(m.startMs / 1000 - 2.5, m.endMs / 1000 + 1.5);
                          }}
                          className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-voice px-3.5 text-[13px] font-bold text-on-voice"
                        >
                          <Play className="size-3.5 fill-current" aria-hidden /> Nghe chỗ {n + 1}
                        </button>
                        <p className="min-w-0 text-[13px] leading-snug text-ink-2">
                          <b className="text-ink">{clock(m.startMs / 1000)}</b> · dừng {((m.endMs - m.startMs) / 1000).toFixed(1).replace(".", ",")} giây
                        </p>
                      </div>
                      <div role="group" aria-label={`Chỗ ${n + 1} là gì?`} className="mt-2 grid grid-cols-2 gap-1.5">
                        {([
                          ["search", "Đang tìm từ"],
                          ["think", "Đang nghĩ ý"],
                        ] as const).map(([v, label]) => (
                          <button
                            key={v}
                            type="button"
                            aria-pressed={judged[m.i] === v}
                            onClick={() =>
                              setJudged((j) => {
                                const { [m.i]: current, ...rest } = j;
                                return current === v ? rest : { ...rest, [m.i]: v };
                              })
                            }
                            className={cn("h-10 rounded-[10px] border text-[13px] font-bold transition-colors", judged[m.i] === v ? "border-voice bg-voice text-on-voice" : "border-line-strong text-ink-2 hover:border-muted")}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {choice !== "on" && xrayState === "idle" && (
            <div className="mb-4 rounded-[12px] border border-dashed border-line-strong p-3">
              <p className="text-sm font-bold text-ink">Soi lời nói</p>
              <p className="mt-0.5 text-[13px] leading-snug text-muted">Máy chép lại lời ngay trên máy bạn rồi chỉ ra chỗ dừng giữa chừng một ý, từ đệm và từ lặp. Chạm vào từ để nghe. Cần tải mô hình khoảng 40 MB một lần; âm thanh không rời khỏi máy.</p>
              <Button variant="secondary" className="mt-2" disabled={disabled} onClick={() => setChoice("on")}>
                Bật soi lời nói
              </Button>
            </div>
          )}
          {xrayState === "loading" && (
            <p className="mb-4 rounded-[12px] bg-surface-2 px-3 py-2 text-[13px] font-semibold text-ink-2" aria-live="polite">
              Đang soi lời nói{loaded > 0 && loaded < 1 ? ` (tải mô hình ${Math.round(loaded * 100)}%)` : "…"}
            </p>
          )}
          {xrayState === "failed" && <p className="mb-4 text-[13px] text-subtle">Chưa soi được lời nói lần này, bạn vẫn chấm được bằng cách nghe và bấm.</p>}
          {xray && (
            <div className="mb-4">
              <h3 className="mb-2 text-base font-extrabold tracking-[-0.02em] text-ink">Soi lời nói</h3>
              <SpeechXray tokens={xray.tokens} gaps={xray.gaps} stats={xray.stats} time={time} onPlay={(from, to) => play(from, to)} />
              <div className="mt-3">
                <XrayCoach insights={insights} deltas={deltas} line={deltas ? compareLine(deltas) : null} trend={trend} />
              </div>
            </div>
          )}

          <h3 className="text-base font-extrabold tracking-[-0.02em] text-ink">{profile ? "Còn lại: bấm khi bạn nghe thấy" : "Nghe và bấm khi bạn nghe thấy"}</h3>
          <p className="mt-0.5 text-[13px] leading-snug text-muted">Không cần biết chấm điểm. Mỗi lần nghe thấy một trong các điều dưới đây, bấm nút tương ứng.</p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {MARK_KINDS.map((k) => (
              <button
                key={k.kind}
                type="button"
                disabled={disabled}
                onClick={() => mark(k.kind)}
                className={cn(
                  "flex h-14 items-center justify-center gap-2 rounded-[12px] border border-line-strong px-2 text-[14px] font-bold text-ink transition-colors active:scale-[0.98] hover:border-muted disabled:opacity-50",
                  k.kind === "unclear" && "col-span-2 sm:col-span-1"
                )}
              >
                <span className={cn("size-2.5 shrink-0 rounded-full", DOT[k.kind])} aria-hidden />
                {k.label}
              </button>
            ))}
          </div>

          <p className="mt-2 min-h-5 text-[13px] font-semibold text-voice" aria-live="polite">
            {flash || (marks.length === 0 ? "Chưa đánh dấu gì." : "")}
          </p>

          {shownLength > 0 && !profile && (
            <div className="relative mt-1 h-6" aria-hidden={marks.length === 0}>
              <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-surface-3" />
              {marks.map((m, i) => (
                <button
                  key={`${m.t}-${i}`}
                  type="button"
                  aria-label={`${MARK_KINDS.find((k) => k.kind === m.kind)?.label} lúc ${clock(m.t)}. Nghe lại.`}
                  onClick={() => {
                    if (audio.current) {
                      audio.current.currentTime = Math.max(0, m.t - 2);
                      void audio.current.play().catch(() => undefined);
                    }
                  }}
                  style={{ left: `${Math.min(100, (m.t / shownLength) * 100)}%` }}
                  className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full p-1.5"
                >
                  <span className={cn("block size-2.5 rounded-full", DOT[m.kind])} />
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center gap-2">
            <Button variant="secondary" disabled={disabled || marks.length === 0} onClick={() => setMarks((m) => m.slice(0, -1))}>
              <Undo2 className="size-4" aria-hidden /> Bỏ dấu cuối
            </Button>
            <Button variant="primary" className="flex-1" disabled={disabled} onClick={toConfirm}>
              Xong, xem điểm
            </Button>
          </div>
        </section>
      ) : (
        <section className="rounded-[var(--radius-card)] border border-line bg-surface p-4">
          <h3 className="text-base font-extrabold tracking-[-0.02em] text-ink">Điểm bắt đầu từ những gì bạn nghe</h3>
          {profile && !xray && <p className="mt-1 rounded-lg bg-surface-2 px-3 py-2 text-[13px] font-semibold leading-snug text-ink-2">{mapVerdict({ voicedShare: profile.voicedShare, pauses: foundPauses ?? 0, searching, thinking })}</p>}
          <p className="mt-0.5 text-[13px] leading-snug text-muted">Đồng ý thì giữ nguyên. Thấy cao hay thấp quá thì bấm + hoặc −.</p>
          <ul className="mt-2 divide-y divide-line">
            {CRITERIA.map((c) => {
              const band = value[c] ?? 5;
              return (
                <li key={c} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-ink">{CRITERION_LABEL[c]}</p>
                    <p className="text-lg font-extrabold leading-tight tracking-[-0.02em] text-voice">{plainLabel(band)}</p>
                    <p className="mt-0.5 text-[12px] leading-snug text-subtle">{evidenceLine(c, allMarks, machineNow, xray?.stats)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5" role="group" aria-label={`Band ${CRITERION_LABEL[c]}`}>
                    <button type="button" aria-label="Giảm 1 band" disabled={disabled || band <= 1} onClick={() => nudge(c, -1)} className="flex size-10 items-center justify-center rounded-full border border-line-strong text-ink-2 hover:border-muted disabled:opacity-40">
                      <Minus className="size-4" aria-hidden />
                    </button>
                    <span className="w-8 text-center text-2xl font-extrabold tabular text-ink">{band}</span>
                    <button type="button" aria-label="Tăng 1 band" disabled={disabled || band >= 9} onClick={() => nudge(c, 1)} className="flex size-10 items-center justify-center rounded-full border border-line-strong text-ink-2 hover:border-muted disabled:opacity-40">
                      <Plus className="size-4" aria-hidden />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          <button type="button" onClick={() => setPhase("listen")} disabled={disabled} className="mt-1 text-[13px] font-semibold text-voice">
            Nghe thêm và đánh dấu tiếp
          </button>
        </section>
      )}
    </div>
  );
}
