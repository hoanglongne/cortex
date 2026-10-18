"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Mic, RotateCcw, Square } from "lucide-react";
import { getSoloQuestions } from "@/actions/questions";
import type { IeltsQuestion } from "@/lib/types/database";
import { useCharacterEnabled } from "@/lib/client/theme";
import { analyzeBlob, type SpeechMetrics } from "@/lib/client/speech-metrics";
import LoadingSpinner from "./LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, Label, Notice, Segments } from "@/components/ui/card";
import { Character, CharacterSays } from "@/components/ui/character";
import { CueCard } from "@/components/ui/cue-card";
import { LiveWaveform, SpeakingPill } from "@/components/ui/on-air";
import { FlowShell } from "@/components/ui/shell";
import { formatClock, Part2Timer } from "@/components/ui/timer";
import { cn } from "@/lib/utils";

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

/** metrics: undefined while measuring, "failed" if the browser could not decode it */
type Take = { id: number; url: string; seconds: number; metrics?: SpeechMetrics | "failed" };

const fmtMs = (ms: number) => formatClock(Math.round(ms / 1000));

/** Space should not start a recording while the key already does something else. */
function spaceBelongsToTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  return el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A", "AUDIO", "VIDEO"].includes(el.tagName);
}

/** "+47s" / "-3s" for a difference in milliseconds */
function signedSeconds(ms: number) {
  const s = Math.round(ms / 1000);
  return `${s > 0 ? "+" : ""}${s}s`;
}

function StatBox({ value, label, tone }: { value: string; label: string; tone?: "good" | "neutral" }) {
  return (
    <div className="rounded-[16px] border border-line bg-surface p-3 text-center">
      <p className={cn("text-[22px] font-extrabold tracking-tight tabular", tone === "good" ? "text-good-edge dark:text-good" : "text-ink")}>{value}</p>
      <p className="mt-0.5 text-xs text-subtle">{label}</p>
    </div>
  );
}

/** What this take says, compared with the previous take of the same question. */
function describeTake(take: Take, prev: Take | undefined, lo: number) {
  const m = take.metrics;
  if (!m || m === "failed") {
    return { headline: `Bạn ghi được ${formatClock(take.seconds)}`, sub: "Mình chưa đo được chỗ ngừng trong bản ghi này, nhưng bạn vẫn nghe lại được.", good: false };
  }
  const prevM = prev?.metrics && prev.metrics !== "failed" ? prev.metrics : null;
  const headline = `Bạn nói ${fmtMs(m.speakingMs)}`;
  if (!prevM) {
    const short = m.speakingMs / 1000 < lo;
    return {
      headline,
      sub: short
        ? "Hơi ngắn, thử thêm một lý do hoặc ví dụ rồi nói lại."
        : m.longPauses === 0
          ? "Không có lần ngừng dài nào, nghe lại xem có đúng không nhé."
          : `Có ${m.longPauses} lần ngừng dài, nghe lại xem bạn đang nghĩ gì ở đó.`,
      good: !short,
    };
  }
  const diffS = Math.round((m.speakingMs - prevM.speakingMs) / 1000);
  const longer = diffS > 0;
  const fewer = m.longPauses < prevM.longPauses;
  const parts: string[] = [];
  if (diffS !== 0) parts.push(`${longer ? "Lâu hơn" : "Ngắn hơn"} lần trước ${Math.abs(diffS)} giây`);
  else parts.push("Dài bằng lần trước");
  if (fewer) parts.push(m.longPauses === 0 ? "hết ngừng dài" : `chỉ còn ${m.longPauses} lần ngừng dài`);
  else if (m.longPauses > prevM.longPauses) parts.push(`thêm ${m.longPauses - prevM.longPauses} lần ngừng dài`);
  return { headline, sub: `${parts.join(". ")}.`, good: longer || fewer };
}

function TakeResult({ take, prev, lo, characterOn }: { take: Take; prev?: Take; lo: number; characterOn: boolean }) {
  const { headline, sub, good } = describeTake(take, prev, lo);
  const m = take.metrics && take.metrics !== "failed" ? take.metrics : null;
  const prevM = prev?.metrics && prev.metrics !== "failed" ? prev.metrics : null;

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

  return (
    <div className="animate-enter space-y-4">
      <div className="flex items-center gap-3">
        {characterOn && <Character mood={good ? "happy" : "idle"} size={72} decorative />}
        <div className="min-w-0">
          <h2 className="text-2xl font-extrabold tracking-[-0.03em] text-ink">{headline}</h2>
          <p className="mt-1 text-sm text-muted">{sub}</p>
        </div>
      </div>

      {m && (
        <div className="grid grid-cols-2 gap-2.5">
          <StatBox
            value={fmtMs(m.speakingMs)}
            label="thời gian nói"
            tone={prevM && m.speakingMs > prevM.speakingMs ? "good" : "neutral"}
          />
          <StatBox value={String(m.longPauses)} label="lần ngừng dài (trên 1,5 giây)" tone={prevM && m.longPauses < prevM.longPauses ? "good" : "neutral"} />
        </div>
      )}

      {prevM && (
        <p className="text-sm text-muted">
          <span className="font-bold text-ink-2">Lần trước:</span> <span className="tabular">{fmtMs(prevM.speakingMs)}</span> nói,{" "}
          <span className="tabular">{prevM.longPauses}</span> lần ngừng dài
          {m && prevM.speakingMs !== m.speakingMs && <span className="text-subtle tabular"> ({signedSeconds(m.speakingMs - prevM.speakingMs)})</span>}
        </p>
      )}

      <Card className="p-3 sm:p-3">
        <audio controls src={take.url} className="h-10 w-full" aria-label="Nghe lại bản ghi" />
      </Card>
    </div>
  );
}

/**
 * Practise alone when nobody is online: real IELTS questions, a Part 2 timer,
 * and recording yourself to listen back. Nothing is uploaded or graded; the
 * recordings stay in this tab. Speaking time and long pauses are measured on
 * this device from the recording.
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

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // Mirror of streamRef so the waveform re-renders once the mic stream exists
  const [stream, setStream] = useState<MediaStream | null>(null);
  const urlsRef = useRef<string[]>([]);
  const takeIdRef = useRef(0);

  const load = useCallback(async () => {
    setLoadError(null);
    setQuestions(null);
    const result = await getSoloQuestions();
    if (result.success && result.questions && result.questions.length > 0) {
      setQuestions(result.questions);
      setIndex(0);
      setFinished(false);
      setTakes({});
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
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  const question = questions?.[index] ?? null;

  const startRecording = async () => {
    if (!question) return;
    setMicError(null);
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
        const take: Take = { id, url, seconds: (Date.now() - started) / 1000 };
        setTakes((prev) => ({ ...prev, [questionId]: [...(prev[questionId] ?? []), take] }));
        analyzeBlob(blob)
          .then((metrics) => ({ metrics }))
          .catch(() => ({ metrics: "failed" as const }))
          .then(({ metrics }) =>
            setTakes((prev) => ({
              ...prev,
              [questionId]: (prev[questionId] ?? []).map((t) => (t.id === id ? { ...t, metrics } : t)),
            }))
          );
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecordSeconds(0);
      setRecording(true);
    } catch {
      setMicError("Không dùng được micro. Hãy cho phép trình duyệt dùng micro rồi thử lại.");
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
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
              {answered > 0 ? `Bạn đã trả lời ${answered}/${questions.length} câu.` : "Bạn chưa ghi âm câu nào."} Bản ghi chỉ nằm trong tab này, không được tải lên.
            </p>
          </div>
        </div>
        <ol className="mt-6 space-y-3">
          {questions.map((q, i) => {
            const list = takes[q.id] ?? [];
            const last = list[list.length - 1];
            const m = last?.metrics && last.metrics !== "failed" ? last.metrics : null;
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

  return (
    <FlowShell
      title={`Câu ${index + 1}/${questions.length}`}
      onBack={onBack}
      backLabel="Về trang chủ"
      wide
      progress={<Segments total={questions.length} done={index} current={index} label={`Câu ${index + 1} trên ${questions.length}`} />}
      footer={
        <div className="mx-auto flex max-w-2xl items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Câu trước">
            <ArrowLeft />
          </Button>
          {recording ? (
            <Button variant="danger" size="lg" className="flex-1" onClick={stopRecording}>
              <Square /> Dừng <span className="tabular">{formatClock(recordSeconds)}</span>
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
          <Button variant={showResult ? "primary" : "secondary"} size="lg" onClick={() => go(index + 1)}>
            {isLast ? "Xem lại" : "Câu tiếp"} <ArrowRight />
          </Button>
        </div>
      }
    >
      <div className="grid gap-6 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:items-start">
        {question && (
          <div>
            <CueCard key={question.id} question={question}>
              {question.part === 2 && !showResult && <Part2Timer key={`${question.id}-${list.length}`} />}
            </CueCard>
            <p className="mt-4 text-sm text-muted">{TIPS[question.part]}</p>
          </div>
        )}

        <div className="space-y-4">
          {micError && <Notice tone="error">{micError}</Notice>}

          {recording ? (
            <Card className="space-y-4">
              <div className="flex items-center gap-3">
                {characterOn && <Character mood="listen" size={80} decorative />}
                <div className="min-w-0">
                  <SpeakingPill on label="Đang ghi" />
                  <p className="mt-2 text-3xl font-extrabold tracking-[-0.03em] text-ink tabular">{formatClock(recordSeconds)}</p>
                </div>
              </div>
              <LiveWaveform stream={stream} className="max-w-full" />
              <p className="text-sm text-muted">{characterOn ? "Mình đang nghe. " : ""}Nói tự nhiên, ngừng để nghĩ cũng không sao.</p>
            </Card>
          ) : showResult && latest ? (
            <Card>
              <TakeResult take={latest} prev={prev} lo={lo} characterOn={characterOn} />
            </Card>
          ) : (
            <CharacterSays mood="idle" enabled={characterOn}>
              Nên nói khoảng <span className="tabular">{formatClock(lo)}–{formatClock(hi)}</span>. Bấm Ghi âm khi bạn sẵn sàng.
            </CharacterSays>
          )}

          <p className="hidden text-center text-xs text-subtle md:block">
            Nhấn <kbd className="rounded-[6px] border border-line-strong bg-surface-2 px-1.5 py-0.5 font-sans font-bold text-muted">Space</kbd>{" "}
            để {recording ? "dừng" : "ghi âm"}
          </p>
        </div>
      </div>
    </FlowShell>
  );
}
