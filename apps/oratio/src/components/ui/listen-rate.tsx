"use client";

import * as React from "react";
import { Minus, Play, Plus, Undo2 } from "lucide-react";
import { CRITERION_LABEL } from "@cortex/classroom-oratio";
import { CRITERIA, type CriterionScores } from "@/lib/feedback";
import { profileUrl, type SpeechProfile } from "@/lib/client/speech-metrics";
import { loadWhisper, MODEL_INFO, transcribeWords, useTranscribeChoice, useWhisperModel } from "@/lib/client/whisper";
import { analyzeWords, replaceWord, type Word } from "@/lib/speech-words";
import { clock, evidenceLine, MARK_KINDS, mapVerdict, plainLabel, suggestBands, type Machine, type Mark, type MarkKind } from "@/lib/rating-marks";
import { insightsFor } from "@/lib/speech-insights";
import { addSummary, compare, compareLine, previousOf, readHistory, summaryOf, type Delta } from "@/lib/speech-history";
import { AudioPlayer } from "./audio-player";
import { SpeechMap } from "./speech-map";
import { SpeechXray } from "./speech-xray";
import { XrayCoach } from "./xray-coach";
import { cn } from "@/lib/utils";
import { Button } from "./button";

const DOT: Record<MarkKind, string> = {
  pause: "bg-streak",
  repeat: "bg-subtle",
  good: "bg-good",
  grammar: "bg-danger",
  unclear: "bg-listen",
};

type Tab = "map" | "xray" | "mark" | "score";
const TABS: { id: Tab; label: string }[] = [
  { id: "map", label: "Bản đồ" },
  { id: "xray", label: "Lời nói" },
  { id: "mark", label: "Đánh dấu" },
  { id: "score", label: "Điểm" },
];

/**
 * Rate by listening (issue #130). One panel at a time so nothing needs a long
 * scroll: 1 the voice map and the long pauses to hear, 2 the words as text
 * (Soi lời nói), 3 buttons for what only a person hears, 4 the four bands,
 * which start from all of the above and only need confirming or a + / −.
 * Used for rating yourself and for rating a partner.
 */
export function ListenRate({
  src,
  seconds,
  limitSeconds,
  value,
  onChange,
  machine,
  historyKey,
  words: knownWords,
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
  /** The words with timing when the answer was already transcribed (your own take): no second pass */
  words?: Word[] | null;
  disabled?: boolean;
  className?: string;
}) {
  const audio = React.useRef<HTMLAudioElement>(null);
  const [marks, setMarks] = React.useState<Mark[]>([]);
  const [duration, setDuration] = React.useState(seconds ?? 0);
  const [tab, setTabState] = React.useState<Tab>(CRITERIA.every((c) => value[c] != null) ? "score" : "map");
  const picked = React.useRef(false);
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
  const [model, setModel] = useWhisperModel();
  const [rawWords, setRawWords] = React.useState<Word[] | null>(knownWords && knownWords.length >= 8 ? knownWords : null);
  const [xrayState, setXrayState] = React.useState<"idle" | "loading" | "ready" | "failed">(knownWords && knownWords.length >= 8 ? "ready" : "idle");
  const [loaded, setLoaded] = React.useState(0);
  const [run, setRun] = React.useState(0);
  const [editing, setEditing] = React.useState(false);

  // Only the part the rater may hear counts
  const xray = React.useMemo(() => {
    if (!rawWords) return null;
    const heard = rawWords.filter((w) => !limitSeconds || w.start < limitSeconds);
    return heard.length >= 8 ? analyzeWords(heard) : null;
  }, [rawWords, limitSeconds]);
  const insights = React.useMemo(() => (xray ? insightsFor(xray.tokens, xray.gaps, xray.stats) : []), [xray]);
  const [deltas, setDeltas] = React.useState<Delta[] | null>(null);
  const [trend, setTrend] = React.useState<number[]>([]);

  const setTab = (t: Tab) => {
    picked.current = true;
    setTabState(t);
  };

  // Transcribe here only when it was not done already
  React.useEffect(() => {
    if (choice !== "on" || (knownWords && knownWords.length >= 8 && run === 0)) return;
    let live = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setXrayState("loading");
    void (async () => {
      try {
        await loadWhisper((f) => live && setLoaded(f));
        const blob = await (await fetch(src)).blob();
        const heard = await transcribeWords(blob);
        if (!live) return;
        if (heard.words && heard.words.length >= 8) {
          setRawWords(heard.words);
          setXrayState("ready");
        } else setXrayState("failed");
      } catch {
        if (live) setXrayState("failed");
      }
    })();
    return () => {
      live = false;
    };
  }, [choice, src, run, knownWords]);

  // The words are ready: show them, unless the rater went somewhere else already
  React.useEffect(() => {
    if (xrayState === "ready" && !picked.current) setTabState("xray");
  }, [xrayState]);

  // Your numbers over time: compare with the take before this one, then keep this one
  React.useEffect(() => {
    if (!xray || !historyKey) return;
    const list = readHistory();
    const now = summaryOf(historyKey, xray.stats);
    const before = previousOf(historyKey, list);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDeltas(before ? compare(before, now) : null);
    setTrend(addSummary(now, list).slice(-8).map((s) => s.midPerMinute));
  }, [xray, historyKey]);

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
    const t = audio.current?.currentTime ?? 0;
    setMarks((m) => [...m, { kind, t }]);
    setFlash(`Đã đánh dấu: ${MARK_KINDS.find((k) => k.kind === kind)?.label ?? ""} lúc ${clock(t)}`);
  };

  const stopAtLimit = () => {
    const el = audio.current;
    if (limitSeconds && el && el.currentTime >= limitSeconds) {
      el.pause();
      el.currentTime = limitSeconds;
      setLimitHit(true);
    }
  };

  /** The four bands start from everything gathered so far, except the ones the rater changed by hand. */
  const toScore = () => {
    const start = suggestBands({ marks: allMarks, seconds: shownLength || duration || 60, machine: machineNow, speech: xray?.stats });
    const next: Partial<CriterionScores> = { ...value };
    for (const c of CRITERIA) if (!touched.current.has(c)) next[c] = start[c];
    onChange(next);
    setTab("score");
  };

  const go = (t: Tab) => (t === "score" ? toScore() : setTab(t));

  const nudge = (c: (typeof CRITERIA)[number], delta: number) => {
    touched.current.add(c);
    onChange({ ...value, [c]: Math.min(9, Math.max(1, (value[c] ?? 5) + delta)) });
  };

  const betterModel = model !== "small";

  return (
    <div className={cn("overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface", className)}>
      <div className="p-3">
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
          <p className="mt-1.5 text-[12px] text-subtle" aria-live="polite">
            {limitHit ? `Đã nghe đủ ${Math.round(limitSeconds / 60)} phút, đủ để chấm rồi.` : `Nghe tối đa ${Math.round(limitSeconds / 60)} phút đầu.`}
          </p>
        )}
      </div>

      <div role="tablist" aria-label="Các bước chấm" className="grid grid-cols-4 gap-1 border-y border-line bg-surface-2 p-1">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => go(t.id)}
            className={cn("h-8 rounded-full text-[12px] font-bold transition-colors", tab === t.id ? "bg-voice text-on-voice" : "text-muted hover:text-ink")}
          >
            <span className="mr-1 font-mono text-[11px] opacity-70">{i + 1}</span>
            {t.label}
          </button>
        ))}
      </div>

      <section className="p-3">
        {tab === "map" && (
          <div>
            {profile ? (
              <>
                <p className="mb-1.5 text-[12px] leading-snug text-muted">
                  {foundPauses === 0 ? "Không có chỗ dừng dài nào." : `${foundPauses} chỗ dừng lâu (vùng vàng).`} Chạm bản đồ để nghe từ chỗ đó.
                </p>
                <SpeechMap profile={profile} time={time} limitSeconds={limitSeconds} marks={allMarks} activePause={active} onSeek={(sec) => play(sec)} />
                {moments.length > 0 && (
                  <ul className="mt-2 divide-y divide-line">
                    {moments.map((m, n) => (
                      <li key={m.i} className="flex flex-wrap items-center gap-2 py-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActive(m.i);
                            play(m.startMs / 1000 - 2.5, m.endMs / 1000 + 1.5);
                          }}
                          aria-label={`Nghe chỗ ${n + 1}, lúc ${clock(m.startMs / 1000)}, dừng ${((m.endMs - m.startMs) / 1000).toFixed(1).replace(".", ",")} giây`}
                          className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-voice px-3 text-[12px] font-bold text-on-voice"
                        >
                          <Play className="size-3 fill-current" aria-hidden /> {clock(m.startMs / 1000)} · {((m.endMs - m.startMs) / 1000).toFixed(1).replace(".", ",")}s
                        </button>
                        <div role="group" aria-label={`Chỗ ${n + 1} là gì?`} className="ml-auto grid grid-cols-2 gap-1.5">
                          {(
                            [
                              ["search", "Đang tìm từ"],
                              ["think", "Đang nghĩ ý"],
                            ] as const
                          ).map(([v, label]) => (
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
                              className={cn("h-9 rounded-[10px] border px-2.5 text-[12px] font-bold transition-colors", judged[m.i] === v ? "border-voice bg-voice text-on-voice" : "border-line-strong text-ink-2 hover:border-muted")}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <p className="text-[12px] text-muted">Đang phân tích âm thanh… Bạn có thể sang bước Đánh dấu và nghe ngay.</p>
            )}
          </div>
        )}

        {tab === "xray" && (
          <div>
            {choice !== "on" && xrayState === "idle" && (
              <div className="rounded-[12px] border border-dashed border-line-strong p-3">
                <p className="text-[13px] leading-snug text-muted">Máy chép lại lời ngay trên máy bạn rồi chỉ ra chỗ dừng giữa chừng một ý, từ đệm và từ lặp. Chạm vào từ để nghe. Âm thanh không rời khỏi máy.</p>
                <ModelPicker model={model} onPick={setModel} />
                <Button variant="primary" className="mt-3" disabled={disabled} onClick={() => setChoice("on")}>
                  Bật soi lời nói ({MODEL_INFO[model].size})
                </Button>
              </div>
            )}
            {xrayState === "loading" && (
              <p className="mt-2 rounded-[12px] bg-surface-2 px-3 py-2 text-[13px] font-semibold text-ink-2" aria-live="polite">
                Đang soi lời nói{loaded > 0 && loaded < 1 ? ` (tải mô hình ${Math.round(loaded * 100)}%)` : "…"}
              </p>
            )}
            {xrayState === "failed" && <p className="mt-2 text-[13px] text-subtle">Chưa soi được lời nói lần này. Bạn vẫn chấm được bằng cách nghe và bấm ở bước Đánh dấu.</p>}
            {xray && (
              <div>
                <SpeechXray
                  tokens={xray.tokens}
                  gaps={xray.gaps}
                  stats={xray.stats}
                  time={time}
                  onPlay={(from, to) => play(from, to)}
                  editing={editing}
                  onEditing={setEditing}
                  onEdit={(src, text) => setRawWords((w) => (w ? replaceWord(w, src, text) : w))}
                />
                {betterModel && choice === "on" && (
                  <div className="mt-3 rounded-[12px] border border-line p-3">
                    <p className="text-[13px] leading-snug text-ink-2">Máy nghe sai nhiều từ? Mô hình đang dùng là loại <b>{MODEL_INFO[model].label.toLowerCase()}</b>. Mô hình chính xác hơn nghe đúng hơn rõ rệt.</p>
                    <Button
                      variant="secondary"
                      className="mt-2"
                      onClick={() => {
                        setModel("small");
                        setRawWords(null);
                        setXrayState("idle");
                        setRun((r) => r + 1);
                      }}
                    >
                      Dùng mô hình chính xác ({MODEL_INFO.small.size})
                    </Button>
                  </div>
                )}
                <div className="mt-3">
                  <XrayCoach insights={insights} deltas={deltas} line={deltas ? compareLine(deltas) : null} trend={trend} />
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "mark" && (
          <div>
            <p className="text-[12px] leading-snug text-muted">Vừa nghe vừa bấm khi thấy một trong các điều này. Không cần biết chấm điểm.</p>
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {MARK_KINDS.map((k) => (
                <button
                  key={k.kind}
                  type="button"
                  disabled={disabled}
                  onClick={() => mark(k.kind)}
                  className={cn(
                    "flex h-12 items-center justify-center gap-1.5 rounded-[10px] border border-line-strong px-1.5 text-[12px] font-bold leading-tight text-ink transition-colors active:scale-[0.98] hover:border-muted disabled:opacity-50"
                  )}
                >
                  <span className={cn("size-2.5 shrink-0 rounded-full", DOT[k.kind])} aria-hidden />
                  {k.label}
                </button>
              ))}
            </div>
            <p className="mt-1.5 min-h-4 text-[12px] font-semibold text-voice" aria-live="polite">
              {flash || (marks.length === 0 ? "Chưa đánh dấu gì." : "")}
            </p>
            {profile ? (
              <div className="mt-1">
                <SpeechMap profile={profile} time={time} limitSeconds={limitSeconds} marks={allMarks} activePause={active} onSeek={(sec) => play(sec)} />
              </div>
            ) : (
              shownLength > 0 &&
              marks.length > 0 && (
                <div className="relative mt-1 h-6">
                  <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-surface-3" />
                  {marks.map((m, i) => (
                    <button
                      key={`${m.t}-${i}`}
                      type="button"
                      aria-label={`${MARK_KINDS.find((k) => k.kind === m.kind)?.label} lúc ${clock(m.t)}. Nghe lại.`}
                      onClick={() => play(m.t - 2)}
                      style={{ left: `${Math.min(100, (m.t / shownLength) * 100)}%` }}
                      className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full p-1.5"
                    >
                      <span className={cn("block size-2.5 rounded-full", DOT[m.kind])} />
                    </button>
                  ))}
                </div>
              )
            )}
            <div className="mt-3 flex items-center gap-2">
              <Button variant="secondary" disabled={disabled || marks.length === 0} onClick={() => setMarks((m) => m.slice(0, -1))}>
                <Undo2 className="size-4" aria-hidden /> Bỏ dấu cuối
              </Button>
              <Button variant="primary" className="flex-1" onClick={() => go("score")}>
                Xem điểm
              </Button>
            </div>
          </div>
        )}

        {tab === "score" && (
          <div>
            <p className="text-[12px] leading-snug text-muted">
              {profile && !xray ? `${mapVerdict({ voicedShare: profile.voicedShare, pauses: foundPauses ?? 0, searching, thinking })} ` : ""}Điểm đã điền sẵn từ những gì bạn nghe. Đồng ý thì giữ nguyên, không thì bấm + hoặc −.
            </p>
            <ul className="mt-1 divide-y divide-line">
              {CRITERIA.map((c) => {
                const band = value[c] ?? 5;
                return (
                  <li key={c} className="flex items-center gap-3 py-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-ink">{CRITERION_LABEL[c]}</p>
                      <p className="text-base font-extrabold leading-tight tracking-[-0.02em] text-voice">{plainLabel(band)}</p>
                      <p className="mt-0.5 text-[12px] leading-snug text-subtle">{evidenceLine(c, allMarks, machineNow, xray?.stats)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5" role="group" aria-label={`Band ${CRITERION_LABEL[c]}`}>
                      <button type="button" aria-label="Giảm 1 band" disabled={disabled || band <= 1} onClick={() => nudge(c, -1)} className="flex size-9 items-center justify-center rounded-full border border-line-strong text-ink-2 hover:border-muted disabled:opacity-40">
                        <Minus className="size-4" aria-hidden />
                      </button>
                      <span className="w-7 text-center text-xl font-extrabold tabular text-ink">{band}</span>
                      <button type="button" aria-label="Tăng 1 band" disabled={disabled || band >= 9} onClick={() => nudge(c, 1)} className="flex size-9 items-center justify-center rounded-full border border-line-strong text-ink-2 hover:border-muted disabled:opacity-40">
                        <Plus className="size-4" aria-hidden />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

      </section>
    </div>
  );
}

/** How well the machine will hear, against how much it downloads. */
function ModelPicker({ model, onPick }: { model: "tiny" | "base" | "small"; onPick: (m: "tiny" | "base" | "small") => void }) {
  const options = ["base", "small"] as const;
  return (
    <div role="radiogroup" aria-label="Độ chính xác" className="mt-3 grid gap-1.5">
      {options.map((m) => (
        <button
          key={m}
          type="button"
          role="radio"
          aria-checked={model === m}
          onClick={() => onPick(m)}
          className={cn("flex items-center justify-between rounded-[10px] border px-3 py-2 text-left text-[13px] transition-colors", model === m ? "border-voice bg-voice/10" : "border-line-strong hover:border-muted")}
        >
          <span className="font-bold text-ink">{MODEL_INFO[m].label}</span>
          <span className="text-subtle">{MODEL_INFO[m].size}</span>
        </button>
      ))}
    </div>
  );
}
