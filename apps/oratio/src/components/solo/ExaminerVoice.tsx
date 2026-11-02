"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { examinerSpeech } from "@/lib/examiner-voice";
import { speakLines } from "@/lib/examiner-speak";

/**
 * "Giám khảo đọc câu hỏi": the question read aloud in English, like the exam,
 * in a natural voice (the browser's own voice when that is not available). With "tự đọc" on it reads each new question as
 * soon as it shows. No score and no AI: it only speaks.
 */
export function ExaminerVoice({ questionId, part, text }: { questionId: string; part: number; text: string }) {
  const [auto, setAuto] = useState(() => {
    try {
      return localStorage.getItem("oratio-examiner-auto") === "1";
    } catch {
      return false;
    }
  });
  const [speaking, setSpeaking] = useState(false);
  const supported = typeof window !== "undefined" && ("speechSynthesis" in window || typeof Audio !== "undefined");
  const last = useRef<string | null>(null);

  const current = useRef<{ cancel: () => void } | null>(null);

  const stop = () => {
    current.current?.cancel();
    current.current = null;
    setSpeaking(false);
  };

  const speak = () => {
    current.current?.cancel();
    const run = speakLines([examinerSpeech(part, text)]);
    current.current = run;
    setSpeaking(true);
    void run.done.then(() => {
      if (current.current === run) setSpeaking(false);
    });
  };

  useEffect(() => {
    if (auto && last.current !== questionId) speak();
    last.current = questionId;
    return () => {
      current.current?.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId, auto]);

  if (!supported) return null;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
      <button type="button" onClick={speaking ? stop : speak} className="flex h-9 items-center gap-1.5 rounded-full border border-line-strong px-3 font-semibold text-ink-2 hover:bg-surface-2">
        {speaking ? <VolumeX className="size-4" aria-hidden /> : <Volume2 className="size-4" aria-hidden />}
        {speaking ? "Dừng" : "Giám khảo đọc câu hỏi"}
      </button>
      <label className="flex items-center gap-1.5 text-muted">
        <input
          type="checkbox"
          checked={auto}
          onChange={(e) => {
            setAuto(e.target.checked);
            try {
              localStorage.setItem("oratio-examiner-auto", e.target.checked ? "1" : "0");
            } catch {
              // Private mode.
            }
          }}
          className="accent-[var(--color-accent)]"
        />
        Tự đọc mỗi câu
      </label>
    </div>
  );
}
