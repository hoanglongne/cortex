"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, Mic, Square, RotateCcw, Users, AlertCircle } from "lucide-react";
import { getSoloQuestions } from "@/actions/questions";
import type { IeltsQuestion } from "@/lib/types/database";
import { Part2Timer, QuestionText } from "./QuestionParts";

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

  const header = (
    <header className="flex items-center justify-between mb-6">
      <button
        onClick={onBack}
        aria-label="Về trang chủ"
        className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 hover:bg-zinc-800 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 text-zinc-300" />
      </button>
      <h1 className="text-base font-semibold text-white">Luyện một mình</h1>
      <div className="w-10" />
    </header>
  );

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#050505] px-4 py-6 max-w-2xl mx-auto">
        {header}
        <div role="alert" className="p-6 rounded-2xl bg-zinc-900/80 border border-white/10 text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <p className="text-sm text-zinc-300 mb-4">{loadError}</p>
          <button onClick={load} className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-sm text-white">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!questions) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-oratio-primary animate-spin" aria-label="Đang tải" />
      </div>
    );
  }

  if (finished) {
    return (
      <div className="min-h-screen bg-[#050505] px-4 py-6 max-w-2xl mx-auto pb-16">
        {header}
        <h2 className="text-xl font-semibold text-white mb-1">Xong buổi tự luyện</h2>
        <p className="text-sm text-zinc-400 mb-6">
          Nghe lại câu trả lời: bạn có trả lời đúng câu hỏi không, có ví dụ không, chỗ nào ngập ngừng? Bản ghi chỉ nằm trong tab này, không được tải lên.
        </p>
        <ol className="space-y-3 mb-8">
          {questions.map((q, i) => {
            const rec = recordings[q.id];
            return (
              <li key={q.id} className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10">
                <p className="text-xs text-zinc-400 mb-1">Part {q.part} • Câu {i + 1}</p>
                <p className="text-sm text-white/90 mb-3">{q.question_text}</p>
                {rec ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <audio controls src={rec.url} className="w-full sm:w-auto max-w-full h-9" />
                    <span className="text-xs text-zinc-400">{fmt(rec.seconds)}</span>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500">Không ghi âm câu này.</p>
                )}
              </li>
            );
          })}
        </ol>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onFindPartner}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-oratio-primary to-oratio-secondary text-white text-sm font-medium"
          >
            <Users className="w-4 h-4" /> Ghép cặp với người thật
          </button>
          <button onClick={load} className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm">
            <RotateCcw className="w-4 h-4" /> Luyện bộ câu khác
          </button>
          <button onClick={onBack} className="px-5 py-3 rounded-xl text-zinc-400 hover:text-white text-sm">
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  const rec = question ? recordings[question.id] : undefined;
  const [lo, hi] = TARGET_S[question?.part ?? 1] ?? [20, 60];

  return (
    <div className="min-h-screen bg-[#050505] px-4 py-6 max-w-2xl mx-auto pb-16">
      {header}

      <div className="flex items-center gap-1.5 mb-4" aria-label={`Câu ${index + 1} trên ${questions.length}`}>
        {questions.map((q, i) => (
          <div key={q.id} className={`h-1.5 flex-1 rounded-full ${i < index ? "bg-oratio-primary" : i === index ? "bg-white/60" : "bg-white/10"}`} />
        ))}
      </div>

      {question && (
        <div className="p-6 rounded-3xl bg-zinc-900/80 border border-white/10 mb-4">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-4">
            Part {question.part} • {question.category} • Câu {index + 1}/{questions.length}
          </p>
          <QuestionText key={question.id} question={question} revealable={false} />
          {question.part === 2 && (
            <div className="mt-5">
              <Part2Timer key={question.id} />
            </div>
          )}
          <p className="text-sm text-zinc-400 mt-5">{TIPS[question.part]}</p>
        </div>
      )}

      {micError && (
        <p role="alert" className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300">
          {micError}
        </p>
      )}

      <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/5 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {recording ? (
            <button
              onClick={stopRecording}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium"
            >
              <Square className="w-4 h-4" /> Dừng ({fmt(recordSeconds)})
            </button>
          ) : (
            <button
              onClick={startRecording}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium"
            >
              <Mic className="w-4 h-4" /> {rec ? "Ghi lại" : "Ghi âm câu trả lời"}
            </button>
          )}
          <span className="text-xs text-zinc-400">
            Nên nói khoảng {fmt(lo)}–{fmt(hi)}
          </span>
        </div>
        {rec && !recording && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <audio controls src={rec.url} className="w-full sm:w-auto max-w-full h-9" />
            <span className={`text-xs ${rec.seconds < lo ? "text-amber-300" : "text-zinc-400"}`}>
              {fmt(rec.seconds)}
              {rec.seconds < lo ? " – hơi ngắn, thử thêm lý do hoặc ví dụ" : ""}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => go(index - 1)}
          disabled={index === 0}
          className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-300 text-sm disabled:opacity-40"
        >
          <ArrowLeft className="w-4 h-4" /> Câu trước
        </button>
        <button
          onClick={() => go(index + 1)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-oratio-primary to-oratio-secondary text-white text-sm font-medium"
        >
          {index + 1 >= questions.length ? "Xem lại cả buổi" : "Câu tiếp theo"} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
