"use client";

import { useEffect, useRef, useState } from "react";
import { saveAnswer } from "@/actions/answers";
import { Card, Label } from "@/components/ui/card";
import { analyzeBlob } from "@/lib/client/speech-metrics";
import { transcribe, useTranscribeChoice } from "@/lib/client/whisper";
import { transcriptMetrics } from "@/lib/transcript-metrics";
import { TakeResult } from "@/components/solo/TakeResult";
import { UUID, type Take } from "@/components/solo/take";
import type { LiveAnswer } from "./types";

const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

/** Your own recorded answers from the call: metrics, optional transcript, playback, send for review. */
export function MyAnswers({ answers }: { answers: LiveAnswer[] }) {
  const { choice } = useTranscribeChoice();
  const choiceRef = useRef(choice);
  const [takes, setTakes] = useState<Take[]>([]);
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    choiceRef.current = choice;
  });

  // Object URLs are created and released here so playback never outlives the screen
  useEffect(() => {
    const made: Take[] = answers.map((a, i) => ({
      id: i,
      url: URL.createObjectURL(a.blob),
      blob: a.blob,
      seconds: Math.round(a.durationMs / 1000),
      tx: { status: "off" },
      lexica: [],
      save: "pending",
    }));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTakes(made);
    setCursor(0);
    return () => made.forEach((t) => URL.revokeObjectURL(t.url));
  }, [answers]);

  // One answer at a time, so a phone is not asked to decode and transcribe everything at once
  useEffect(() => {
    const a = answers[cursor];
    if (!a || takes.length !== answers.length) return;
    let alive = true;
    const patch = (p: Partial<Take>) => alive && setTakes((prev) => prev.map((t) => (t.id === cursor ? { ...t, ...p } : t)));

    (async () => {
      const metrics = await analyzeBlob(a.blob).catch(() => "failed" as const);
      patch({ metrics });

      let text = "";
      let tm: ReturnType<typeof transcriptMetrics> | undefined;
      if (choiceRef.current === "on") {
        patch({ tx: { status: "pending" } });
        try {
          text = (await transcribe(a.blob)).trim();
          if (!text) throw new Error("empty");
          tm = transcriptMetrics(text, metrics === "failed" ? a.durationMs : metrics.totalMs, metrics === "failed" ? 0 : metrics.longPauses);
          patch({ tx: { status: "done", text, metrics: tm } });
        } catch {
          text = "";
          patch({ tx: { status: "failed" } });
        }
      }

      if (DEMO || !UUID.test(a.questionId) || metrics === "failed") {
        patch({ save: "skipped" });
        return;
      }
      try {
        const res = await saveAnswer({
          questionId: a.questionId,
          mode: "live",
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
        if (res.id) patch({ save: "saved", answerId: res.id, ...(res.lexicaWords ? { lexica: res.lexicaWords } : {}) });
        else patch({ save: "failed" });
      } catch {
        patch({ save: "failed" });
      }
    })().finally(() => alive && setCursor((c) => c + 1));

    return () => {
      alive = false;
    };
  }, [cursor, takes.length, answers]);

  if (answers.length === 0) return null;
  return (
    <section className="mt-6">
      <Label className="mb-3">Câu trả lời của bạn</Label>
      <p className="mb-3 text-sm text-muted">Bản ghi nằm trên máy này. Chỉ khi bạn bấm “Gửi nhờ chấm” cho từng câu, bản ghi đó mới được tải lên.</p>
      <div className="grid gap-4 md:grid-cols-2 md:items-start">
        {takes.map((take, i) => (
          <Card key={take.id}>
            <p className="text-xs font-extrabold uppercase tracking-[0.06em] text-voice">Part {answers[i].part}</p>
            <p className="mb-4 mt-1 break-words text-[15px] leading-snug text-ink">{answers[i].questionText}</p>
            <TakeResult
              take={take}
              lo={0}
              characterOn={false}
              demo={DEMO}
              onSent={() => setTakes((prev) => prev.map((t) => (t.id === take.id ? { ...t, submitted: true } : t)))}
            />
          </Card>
        ))}
      </div>
    </section>
  );
}
