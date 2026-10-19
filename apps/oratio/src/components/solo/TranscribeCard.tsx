"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CharacterSays } from "@/components/ui/character";
import { loadWhisper, type TranscribeChoice } from "@/lib/client/whisper";

type Phase = { phase: "loading" | "ready" | "error"; progress: number };

/** Downloads the on-device model in the background once the learner agreed. Never blocks recording. */
export function useWhisperLoader(choice: TranscribeChoice): Phase {
  const [state, setState] = useState<Phase>({ phase: "loading", progress: 0 });
  useEffect(() => {
    if (choice !== "on") return;
    let alive = true;
    loadWhisper((f) => alive && setState((s) => (s.phase === "loading" ? { phase: "loading", progress: f } : s))).then(
      () => alive && setState({ phase: "ready", progress: 1 }),
      () => alive && setState({ phase: "error", progress: 0 })
    );
    return () => {
      alive = false;
    };
  }, [choice]);
  return state;
}

/** Asks once whether to turn on transcription. */
export function TranscribeAsk({ characterOn, onChoose }: { characterOn: boolean; onChoose: (c: "on" | "off") => void }) {
  return (
    <Card className="space-y-3">
      <CharacterSays mood="idle" enabled={characterOn}>
        Bạn muốn mình chép lời bài nói không? Mình sẽ đếm từ, từ đệm và từ Lexica bạn dùng.
      </CharacterSays>
      <p className="text-sm text-muted">
        Cần tải khoảng 40 MB một lần. Việc chép lời chạy ngay trên máy bạn, âm thanh không bị tải lên đâu cả. Không bật thì bạn vẫn có thời gian nói và quãng ngừng dài.
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => onChoose("on")}>
          Bật
        </Button>
        <Button variant="ghost" onClick={() => onChoose("off")}>
          Để sau
        </Button>
      </div>
    </Card>
  );
}

/** Quiet progress line while the model downloads. */
export function WhisperStatus({ state }: { state: Phase }) {
  if (state.phase === "ready") return null;
  if (state.phase === "error") {
    return <p className="text-sm text-muted">Chưa tải được mô hình chép lời. Bạn vẫn ghi âm và xem các chỉ số về thời gian bình thường.</p>;
  }
  const pct = Math.round(state.progress * 100);
  return (
    <div className="space-y-1.5" aria-live="polite">
      <p className="text-sm text-muted">
        Đang tải mô hình chép lời{pct > 0 ? ` · ` : "…"}
        {pct > 0 && <span className="font-bold text-ink-2 tabular">{pct}%</span>}. Bạn cứ ghi âm, không cần chờ.
      </p>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-3" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Tải mô hình chép lời">
        <div className="h-full rounded-full bg-listen transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
