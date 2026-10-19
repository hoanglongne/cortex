"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Mic, RotateCcw, Square } from "lucide-react";
import { getSoloQuestions } from "@/actions/questions";
import type { IeltsQuestion } from "@/lib/types/database";
import { useCharacterEnabled } from "@/lib/client/theme";
import { analyzeBlob } from "@/lib/client/speech-metrics";
import { transcribe, useTranscribeChoice } from "@/lib/client/whisper";
import { transcriptMetrics, lexicaWordsIn } from "@/lib/transcript-metrics";
import { getLexicaWords, saveAnswer } from "@/actions/answers";
import LoadingSpinner from "./LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, Label, Notice, Pill, Segments } from "@/components/ui/card";
import { Character, CharacterSays } from "@/components/ui/character";
import { CueCard } from "@/components/ui/cue-card";
import { LiveWaveform, SpeakingPill } from "@/components/ui/on-air";
import { FlowShell } from "@/components/ui/shell";
import { formatClock, Part2Timer } from "@/components/ui/timer";
import { TranscribeAsk, WhisperStatus, useWhisperLoader } from "./solo/TranscribeCard";
import { DrillSummary, TakeResult } from "./solo/TakeResult";
import { DRILL_TARGETS, UUID, deriveGoal, fmtMs, goalText, okMetrics, type Goal, type Take } from "./solo/take";

const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

interface SoloPracticeScreenProps {
  onBack: () => void;
  onFindPartner: () => void;
}

/** How long a good answer usually runs, per part (seconds). */
const TARGET_S: Record<number, [number, number]> = { 1: [20, 40], 2: [90, 120], 3: [40, 75] };

const TIPS: Record<number, string> = {
  1: "Trả lời 2–3 câu: ý chính, thêm một lý do hoặc ví dụ.",
  2: "Đi qua từng gạch đầu dòng, kể cụ thể (ai, ở đâu, khi nào), cố nói đủ 2 phút.",
  3: "Nêu quan điểm, giải thích vì sao, so sánh hoặc nói về xu hướng.",
};

/** Space should not start a recording while the key already does something else. */
function spaceBelongsToTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  return el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A", "AUDIO", "VIDEO"].includes(el.tagName);
}

/**
 * Practise alone when nobody is online: real IELTS questions, a Part 2 timer,
 * and recording yourself to listen back. Recordings stay in this tab and are
 * measured on this device; audio is uploaded only when the learner sends one
 * take for peer review. Each take is saved as numbers (and a transcript when
 * on-device transcription is on). No band is ever computed from them.
 */
export default function SoloPracticeScreen({ onBack, onFindPartner }: SoloPracticeScreenProps) {
  const { enabled: characterOn } = useCharacterEnabled();
  const [questions, setQuestions] = useState<IeltsQuestion[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [takes, setTakes] = useState<Record<string, Take[]>>({});
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const { choice, setChoice } = useTranscribeChoice();
  const whisper = useWhisperLoader(choice);
  const [lexica, setLexica] = useState<{ recent: string[]; all: string[] }>({ recent: [], all: [] });
  // Part 2 questions where the learner chose 4/3/2
  const [drills, setDrills] = useState<Record<string, boolean>>({});
  const [recGoal, setRecGoal] = useState<Goal | null>(null);
  const [recTarget, setRecTarget] = useState<number | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // Mirror of streamRef so the waveform re-renders once the mic stream exists
  const [stream, setStream] = useState<MediaStream | null>(null);
  const urlsRef = useRef<string[]>([]);
  const takeIdRef = useRef(0);
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Read inside the recorder callback, which outlives the render that made it
  const choiceRef = useRef(choice);
  const lexicaRef = useRef(lexica);
  // Per question: the saved id of the first take, which later takes point to
  const firstAnswerRef = useRef<Record<string, Promise<string | undefined>>>({});
  useEffect(() => {
    choiceRef.current = choice;
    lexicaRef.current = lexica;
  });

  useEffect(() => {
    if (DEMO) return;
    getLexicaWords().then(setLexica, () => {});
  }, []);

  const load = useCallback(async () => {
    setLoadError(null);
    setQuestions(null);
    const result = await getSoloQuestions();
    if (result.success && result.questions && result.questions.length > 0) {
      setQuestions(result.questions);
      setIndex(0);
      setFinished(false);
      setTakes({});
      setDrills({});
      firstAnswerRef.current = {};
    } else {
      setLoadError("Không tải được câu hỏi. Kiểm tra mạng rồi thử lại.");
    }
  }, []);

  useEffect(() => {
    // Loading data on mount; the setState calls happen after the await
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  // Recording clock
  useEffect(() => {
    if (!recording) return;
    const start = Date.now();
    const t = setInterval(() => setRecordSeconds((Date.now() - start) / 1000), 250);
    return () => clearInterval(t);
  }, [recording]);

  // Release the mic and the recordings when leaving
  useEffect(() => {
    const urls = urlsRef.current;
    return () => {
      if (autoStopRef.current) clearTimeout(autoStopRef.current);
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  const question = questions?.[index] ?? null;

  const patchTake = useCallback((questionId: string, id: number, patch: Partial<Take>) => {
    setTakes((prev) => ({ ...prev, [questionId]: (prev[questionId] ?? []).map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
  }, []);

  /** Measure, transcribe if allowed, then save. Each step fails on its own without stopping the rest. */
  const processTake = useCallback(
    async (questionId: string, id: number, blob: Blob, seconds: number) => {
      // Claimed before any await, so a quick retake still points at this take
      const first = firstAnswerRef.current[questionId];
      let settleFirst: (answerId?: string) => void = () => {};
      if (!first) firstAnswerRef.current[questionId] = new Promise((resolve) => (settleFirst = resolve));

      const metrics = await analyzeBlob(blob).catch(() => "failed" as const);
      patchTake(questionId, id, { metrics });

      let text = "";
      let tm: ReturnType<typeof transcriptMetrics> | undefined;
      let words: string[] = [];
      if (choiceRef.current === "on") {
        patchTake(questionId, id, { tx: { status: "pending" } });
        try {
          text = (await transcribe(blob)).trim();
          if (!text) throw new Error("empty");
          const ms = metrics === "failed" ? seconds * 1000 : metrics.totalMs;
          tm = transcriptMetrics(text, ms, metrics === "failed" ? 0 : metrics.longPauses);
          words = lexicaWordsIn(text, lexicaRef.current.all);
          patchTake(questionId, id, { tx: { status: "done", text, metrics: tm }, lexica: words });
        } catch {
          text = "";
          patchTake(questionId, id, { tx: { status: "failed" } });
        }
      }

      if (DEMO || !UUID.test(questionId) || metrics === "failed") {
        patchTake(questionId, id, { save: "skipped" });
        settleFirst();
        return;
      }
      const run = (async () => {
        const retakeOf = first ? await first : undefined;
        const res = await saveAnswer({
          questionId,
          mode: "solo",
          retakeOf: retakeOf ?? null,
          durationMs: metrics.totalMs,
          speakingMs: metrics.speakingMs,
          longPauses: metrics.longPauses,
          longestPauseMs: metrics.longestPauseMs,
          transcript: text || null,
          wordCount: tm?.wordCount ?? null,
          wpm: tm?.wpm ?? null,
          meanRunWords: tm?.meanRunWords ?? null,
          fillers: tm?.fillers ?? null,
          lexicalDiversity: tm?.lexicalDiversity ?? null,
        });
        if (res.id) patchTake(questionId, id, { save: "saved", answerId: res.id, ...(res.lexicaWords ? { lexica: res.lexicaWords } : {}) });
        else patchTake(questionId, id, { save: "failed" });
        return res.id;
      })().catch(() => {
        patchTake(questionId, id, { save: "failed" });
        return undefined;
      });
      settleFirst(await run);
    },
    [patchTake]
  );

  const startRecording = async () => {
    if (!question) return;
    setMicError(null);
    const qList = takes[question.id] ?? [];
    const drillTakes = qList.filter((t) => t.drillTarget);
    const inDrill = !!drills[question.id] && drillTakes.length < DRILL_TARGETS.length;
    const target = inDrill ? DRILL_TARGETS[drillTakes.length] : null;
    const goal = !inDrill && qList.length > 0 ? deriveGoal(qList[qList.length - 1], lexica.recent, TARGET_S[question.part]?.[0] ?? 20) : null;
    try {
      if (!streamRef.current) {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        setStream(streamRef.current);
      }
      const recorder = new MediaRecorder(streamRef.current);
      const chunks: Blob[] = [];
      const started = Date.now();
      const questionId = question.id;
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType });
        const url = URL.createObjectURL(blob);
        urlsRef.current.push(url);
        const id = ++takeIdRef.current;
        const seconds = (Date.now() - started) / 1000;
        const take: Take = {
          id,
          url,
          blob,
          seconds,
          tx: { status: "off" },
          lexica: [],
          save: "pending",
          ...(goal ? { goal } : {}),
          ...(target ? { drillTarget: target } : {}),
        };
        setTakes((prev) => ({ ...prev, [questionId]: [...(prev[questionId] ?? []), take] }));
        void processTake(questionId, id, blob, seconds);
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecordSeconds(0);
      setRecGoal(goal);
      setRecTarget(target);
      setRecording(true);
      // Exact stop at the 4/3/2 target, not on the next clock tick
      if (target) autoStopRef.current = setTimeout(stopRecording, target * 1000);
    } catch {
      setMicError("Không dùng được micro. Hãy cho phép trình duyệt dùng micro rồi thử lại.");
    }
  };

  const stopRecording = () => {
    if (autoStopRef.current) clearTimeout(autoStopRef.current);
    autoStopRef.current = null;
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    setRecording(false);
  };

  const go = (next: number) => {
    if (recording) stopRecording();
    if (!questions) return;
    if (next >= questions.length) setFinished(true);
    else setIndex(Math.max(0, next));
  };

  // Space toggles recording. The handler reads the latest closures through a ref.
  const toggleRef = useRef<() => void>(() => {});
  useEffect(() => {
    toggleRef.current = () => {
      if (recording) stopRecording();
      else void startRecording();
    };
  });
  const active = !!questions && !finished;
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      if (spaceBelongsToTarget(e.target)) return;
      e.preventDefault();
      toggleRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  if (loadError) {
    return (
      <FlowShell title="Tập một mình" onBack={onBack} backLabel="Về trang chủ">
        <div className="mt-6 space-y-4">
          <Notice tone="error">{loadError}</Notice>
          <Button variant="secondary" onClick={load}>
            Thử lại
          </Button>
        </div>
      </FlowShell>
    );
  }

  if (!questions) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg">
        <LoadingSpinner message="Đang tải câu hỏi..." />
      </div>
    );
  }

  if (finished) {
    const answered = questions.filter((q) => (takes[q.id]?.length ?? 0) > 0).length;
    return (
      <FlowShell
        title="Tập một mình · Xong"
        onBack={onBack}
        backLabel="Về trang chủ"
        footer={
          <div className="space-y-2">
            <Button variant="primary" size="lg" block onClick={onFindPartner}>
              Vào phòng thi
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" block onClick={load}>
                Tập bộ câu khác
              </Button>
              <Button variant="ghost" block onClick={onBack}>
                Về trang chủ
              </Button>
            </div>
          </div>
        }
      >
        <div className="mt-2 flex items-center gap-3">
          {characterOn && <Character mood="happy" size={88} decorative />}
          <div>
            <h1 className="text-[28px] font-extrabold tracking-[-0.035em] text-ink">Xong buổi tập</h1>
            <p className="mt-1 text-sm text-muted">
              {answered > 0 ? `Bạn đã trả lời ${answered}/${questions.length} câu.` : "Bạn chưa ghi âm câu nào."} Bản ghi chỉ nằm trong tab này; chỉ lần nói bạn bấm Gửi nhờ chấm mới được tải lên.
            </p>
          </div>
        </div>
        <ol className="mt-6 space-y-3">
          {questions.map((q, i) => {
            const list = takes[q.id] ?? [];
            const last = list[list.length - 1];
            const m = okMetrics(last);
            return (
              <li key={q.id} className="rounded-[var(--radius-card)] border border-line bg-surface p-4">
                <Label>
                  Câu {i + 1} · Part {q.part}
                </Label>
                <p className="mt-2 text-base font-bold leading-snug text-ink">{q.question_text}</p>
                {last ? (
                  <div className="mt-3 space-y-2">
                    <audio controls src={last.url} className="h-10 w-full" aria-label={`Nghe lại câu ${i + 1}`} />
                    <p className="text-xs text-muted">
                      <span className="font-extrabold text-ink-2 tabular">{m ? fmtMs(m.speakingMs) : formatClock(last.seconds)}</span>
                      {m ? ` nói · ${m.longPauses} lần ngừng dài` : ""}
                      {list.length > 1 ? ` · ${list.length} lần nói` : ""}
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-subtle">Không ghi âm câu này.</p>
                )}
              </li>
            );
          })}
        </ol>
      </FlowShell>
    );
  }

  const list = question ? (takes[question.id] ?? []) : [];
  const latest = list[list.length - 1];
  const prev = list.length > 1 ? list[list.length - 2] : undefined;
  const [lo, hi] = TARGET_S[question?.part ?? 1] ?? [20, 60];
  const isLast = index + 1 >= questions.length;
  const showResult = !!latest && !recording;

  const drillTakes = list.filter((t) => t.drillTarget);
  const drillOn = !!question && !!drills[question.id];
  const drillStep = drillTakes.length;
  const drillRunning = drillOn && drillStep < DRILL_TARGETS.length;
  const drillDone = drillOn && drillStep >= DRILL_TARGETS.length;
  const canOfferDrill = question?.part === 2 && !drillOn && list.length === 0 && !recording;
  const nextTarget = drillRunning ? DRILL_TARGETS[drillStep] : null;
  const nextGoal: Goal | null = showResult && !drillRunning ? deriveGoal(latest, lexica.recent, lo) : null;
  const shownGoal = recording ? recGoal : nextGoal;
  const hintWords = lexica.recent;
  const drillLabelOf = (t: Take) => (t.drillTarget ? `4/3/2 · lần ${drillTakes.indexOf(t) + 1} · ${formatClock(t.drillTarget)}` : undefined);
  const onSent = (t: Take) => question && patchTake(question.id, t.id, { submitted: true });

  return (
    <FlowShell
      title={`Câu ${index + 1}/${questions.length}`}
      onBack={onBack}
      backLabel="Về trang chủ"
      wide
      progress={<Segments total={questions.length} done={index} current={index} label={`Câu ${index + 1} trên ${questions.length}`} />}
      footer={
        <div className="mx-auto max-w-2xl space-y-2">
          {shownGoal ? (
            <p className="text-center text-sm font-bold text-ink-2">
              <span className="text-voice">Lần này:</span> {goalText(shownGoal)}
            </p>
          ) : (
            (recording ? recTarget : nextTarget) && (
              <p className="text-center text-sm font-bold text-ink-2">
                <span className="text-voice">4/3/2:</span> nói đủ <span className="tabular">{formatClock((recording ? recTarget : nextTarget) ?? 0)}</span>, máy tự dừng
              </p>
            )
          )}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Câu trước">
              <ArrowLeft />
            </Button>
            {recording ? (
              <Button variant="danger" size="lg" className="flex-1" onClick={stopRecording}>
                <Square /> Dừng <span className="tabular">{formatClock(recordSeconds)}</span>
              </Button>
            ) : drillRunning ? (
              <Button variant="primary" size="lg" className="flex-1" onClick={startRecording}>
                <Mic /> Lần {drillStep + 1}/3 · <span className="tabular">{formatClock(DRILL_TARGETS[drillStep])}</span>
              </Button>
            ) : showResult ? (
              <Button variant="secondary" size="lg" className="flex-1" onClick={startRecording}>
                <RotateCcw /> Nói lại
              </Button>
            ) : (
              <Button variant="primary" size="lg" className="flex-1" onClick={startRecording}>
                <Mic /> Ghi âm
              </Button>
            )}
            <Button variant={showResult && !drillRunning ? "primary" : "secondary"} size="lg" onClick={() => go(index + 1)}>
              {isLast ? "Xem lại" : "Câu tiếp"} <ArrowRight />
            </Button>
          </div>
        </div>
      }
    >
      <div className="grid gap-6 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:items-start">
        {question && (
          <div>
            <CueCard key={question.id} question={question}>
              {question.part === 2 && !showResult && !drillOn && <Part2Timer key={`${question.id}-${list.length}`} />}
            </CueCard>
            <p className="mt-4 text-sm text-muted">{TIPS[question.part]}</p>
            {hintWords.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-bold text-ink-2">Thử dùng từ Lexica của bạn:</p>
                <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Từ Lexica gợi ý">
                  {hintWords.map((w) => (
                    <li key={w}>
                      <Pill tone="listen">{w}</Pill>
                    </li>
                  ))}
                </ul>
                <p className="mt-1.5 text-xs text-subtle">Đây là những từ bạn học gần nhất, chưa ghép theo chủ đề câu hỏi.</p>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          {micError && <Notice tone="error">{micError}</Notice>}

          {choice === "unset" && !recording && <TranscribeAsk characterOn={characterOn} onChoose={setChoice} />}
          {choice === "on" && !recording && <WhisperStatus state={whisper} />}

          {recording ? (
            <Card className="space-y-4">
              <div className="flex items-center gap-3">
                {characterOn && <Character mood="listen" size={80} decorative />}
                <div className="min-w-0">
                  <SpeakingPill on label="Đang ghi" />
                  <p className="mt-2 text-3xl font-extrabold tracking-[-0.03em] text-ink tabular">
                    {recTarget ? formatClock(Math.max(0, recTarget - recordSeconds)) : formatClock(recordSeconds)}
                  </p>
                  {recTarget && <p className="text-xs text-subtle">Còn lại, mục tiêu {formatClock(recTarget)}</p>}
                </div>
              </div>
              <LiveWaveform stream={stream} className="max-w-full" />
              <p className="text-sm text-muted">{characterOn ? "Mình đang nghe. " : ""}Nói tự nhiên, ngừng để nghĩ cũng không sao.</p>
            </Card>
          ) : showResult && latest ? (
            <Card>
              <TakeResult
                key={latest.id}
                take={latest}
                prev={drillRunning || drillDone ? undefined : prev}
                lo={lo}
                characterOn={characterOn}
                demo={DEMO}
                onSent={() => onSent(latest)}
                drillLabel={drillLabelOf(latest)}
              />
            </Card>
          ) : drillRunning ? (
            <CharacterSays mood="idle" enabled={characterOn}>
              Luyện 4/3/2: nói cùng một bài ba lần, lần này <span className="tabular">{formatClock(DRILL_TARGETS[drillStep])}</span>. Hết giờ mình sẽ tự dừng.
            </CharacterSays>
          ) : (
            <div className="space-y-3">
              <CharacterSays mood="idle" enabled={characterOn}>
                Nên nói khoảng <span className="tabular">{formatClock(lo)}–{formatClock(hi)}</span>. Bấm Ghi âm khi bạn sẵn sàng.
              </CharacterSays>
              {canOfferDrill && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Button variant="secondary" size="sm" onClick={() => question && setDrills((d) => ({ ...d, [question.id]: true }))}>
                    Luyện 4/3/2
                  </Button>
                  <p className="text-xs text-subtle">Nói cùng bài 3 lần: 2:00, 1:30, 1:00.</p>
                </div>
              )}
            </div>
          )}

          {drillRunning && showResult && (
            <p className="text-sm text-muted">
              Xong lần {drillStep}/3. Lần tiếp theo ngắn hơn, giữ những ý chính thôi.
            </p>
          )}
          {drillDone && !recording && <DrillSummary takes={drillTakes} />}

          <p className="hidden text-center text-xs text-subtle md:block">
            Nhấn <kbd className="rounded-[6px] border border-line-strong bg-surface-2 px-1.5 py-0.5 font-sans font-bold text-muted">Space</kbd>{" "}
            để {recording ? "dừng" : "ghi âm"}
          </p>
        </div>
      </div>
    </FlowShell>
  );
}
