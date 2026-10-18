"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Mic, Square } from "lucide-react";
import { getSoloQuestions } from "@/actions/questions";
import type { IeltsQuestion } from "@/lib/types/database";
import LoadingSpinner from "./LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Label, Notice } from "@/components/ui/card";
import { CueCard } from "@/components/ui/cue-card";
import { LiveWaveform, OnAirLamp } from "@/components/ui/on-air";
import { FlowShell } from "@/components/ui/shell";
import { Part2Timer } from "@/components/ui/timer";
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

type Recording = { url: string; seconds: number };

const fmt = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;

/**
 * Practise alone when nobody is online: real IELTS questions, a Part 2 timer,
 * and recording yourself to listen back. Nothing is uploaded or graded; the
 * recordings stay in this tab.
 */
export default function SoloPracticeScreen({ onBack, onFindPartner }: SoloPracticeScreenProps) {
  const [questions, setQuestions] = useState<IeltsQuestion[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [recordings, setRecordings] = useState<Record<string, Recording>>({});
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // Mirror of streamRef so the waveform re-renders once the mic stream exists
  const [stream, setStream] = useState<MediaStream | null>(null);
  const urlsRef = useRef<string[]>([]);

  const load = useCallback(async () => {
    setLoadError(null);
    setQuestions(null);
    const result = await getSoloQuestions();
    if (result.success && result.questions && result.questions.length > 0) {
      setQuestions(result.questions);
      setIndex(0);
      setFinished(false);
      setRecordings({});
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
        const url = URL.createObjectURL(new Blob(chunks, { type: recorder.mimeType }));
        urlsRef.current.push(url);
        setRecordings((prev) => ({ ...prev, [questionId]: { url, seconds: (Date.now() - started) / 1000 } }));
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
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Xong buổi tập</h1>
        <p className="mt-2 text-sm text-muted">
          Nghe lại: bạn có trả lời đúng câu hỏi không, có ví dụ không, chỗ nào ngập ngừng? Bản ghi chỉ nằm trong tab này, không được tải lên.
        </p>
        <ol className="mt-6 space-y-3">
          {questions.map((q, i) => {
            const rec = recordings[q.id];
            return (
              <li key={q.id} className="rounded-[var(--radius-card)] border border-line bg-surface p-4">
                <Label>
                  Câu {i + 1} · Part {q.part}
                </Label>
                <p className="mt-2 font-serif text-base leading-snug text-ink">{q.question_text}</p>
                {rec ? (
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <audio controls src={rec.url} className="h-9 w-full max-w-full sm:w-auto" />
                    <span className="font-mono text-xs tabular text-muted">{fmt(rec.seconds)}</span>
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

  const rec = question ? recordings[question.id] : undefined;
  const [lo, hi] = TARGET_S[question?.part ?? 1] ?? [20, 60];
  const isLast = index + 1 >= questions.length;

  return (
    <FlowShell
      title={`Tập một mình · Câu ${index + 1}/${questions.length}`}
      onBack={onBack}
      backLabel="Về trang chủ"
      footer={
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Câu trước">
            <ArrowLeft />
          </Button>
          {recording ? (
            <Button variant="danger" className="flex-1" onClick={stopRecording}>
              <Square /> Dừng (<span className="tabular">{fmt(recordSeconds)}</span>)
            </Button>
          ) : (
            <Button variant={rec ? "secondary" : "primary"} className="flex-1" onClick={startRecording}>
              <Mic /> {rec ? "Ghi lại" : "Ghi âm"}
            </Button>
          )}
          <Button variant={rec && !recording ? "primary" : "secondary"} onClick={() => go(index + 1)}>
            {isLast ? "Xem lại" : "Câu tiếp"} <ArrowRight />
          </Button>
        </div>
      }
    >
      <div className="mt-2 grid grid-cols-8 gap-1" role="img" aria-label={`Câu ${index + 1} trên ${questions.length}`}>
        {questions.map((q, i) => (
          <span key={q.id} className={cn("h-1 rounded-full", i < index ? "bg-ink-2" : i === index ? "bg-onair" : "bg-surface-3")} />
        ))}
      </div>

      {question && (
        <CueCard key={question.id} question={question} className="mt-5">
          {question.part === 2 && <Part2Timer key={question.id} />}
        </CueCard>
      )}

      {question && <p className="mt-4 text-sm text-muted">{TIPS[question.part]}</p>}

      {micError && (
        <Notice tone="error" className="mt-4">
          {micError}
        </Notice>
      )}

      <div className="mt-6 space-y-3">
        {recording && (
          <div className="flex flex-col items-start gap-3">
            <OnAirLamp on label="Đang ghi" />
            <LiveWaveform stream={stream} />
          </div>
        )}
        {!recording && !rec && (
          <p className="text-sm text-muted">
            Nên nói khoảng <span className="font-mono tabular">{fmt(lo)}–{fmt(hi)}</span>.
          </p>
        )}
        {rec && !recording && (
          <div className="rounded-[var(--radius-card)] border border-line bg-surface p-3">
            <audio controls src={rec.url} className="h-9 w-full" />
            <p className="mt-2 text-xs text-muted">
              <span className="font-mono tabular text-ink-2">{fmt(rec.seconds)}</span>
              {rec.seconds < lo ? " · hơi ngắn, thử thêm lý do hoặc ví dụ" : ""}
            </p>
          </div>
        )}
      </div>
    </FlowShell>
  );
}
