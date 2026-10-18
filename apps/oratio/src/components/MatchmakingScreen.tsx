"use client";

import { RefreshCw } from "lucide-react";
import { useOnlineCount } from "@/hooks/useOnlineCount";
import { useCharacterEnabled } from "@/lib/client/theme";
import { Button } from "@/components/ui/button";
import { Card, Label, Notice } from "@/components/ui/card";
import { CharacterSays } from "@/components/ui/character";
import { FlowShell } from "@/components/ui/shell";
import { formatClock } from "@/components/ui/timer";

interface MatchmakingScreenProps {
  /** The partner band range being searched, as shown on Home ("Bất kỳ", "6.0–7.0"…) */
  bandLabel: string;
  onCancel: () => void;
  onRetry: () => void;
  onPracticeSolo: () => void;
  status: "searching" | "matched" | "error";
  /** Seconds waited so far (owned by AppFlow, which also drives the band widening) */
  searchTime: number;
  error?: string | null;
}

/** After this long with no partner, offer solo practice. */
const OFFER_SOLO_AFTER_S = 45;
/** Matches findMatch's rules: after 90s any band is accepted. */
const ANY_BAND_AFTER_S = 90;

const STEPS = [
  "Hai bạn gọi thoại, không cần bật camera.",
  "Lần lượt làm giám khảo và thí sinh, đủ Part 1, 2, 3.",
  "Xong buổi thì chấm nhau theo 4 tiêu chí IELTS.",
];

export default function MatchmakingScreen({
  bandLabel,
  onCancel,
  onRetry,
  onPracticeSolo,
  status,
  searchTime,
  error,
}: MatchmakingScreenProps) {
  const { count } = useOnlineCount();
  const { enabled: characterOn } = useCharacterEnabled();
  // The count includes this user while they wait
  const others = Math.max(0, count - 1);
  const widened = searchTime >= ANY_BAND_AFTER_S;

  const heading = status === "error" ? "Không kết nối được" : widened ? "Đang tìm với mọi band…" : "Đang tìm bạn cùng luyện…";

  return (
    <FlowShell title="Phòng thi" onBack={onCancel} backLabel="Huỷ tìm" close>
      <div className="mx-auto flex max-w-md flex-col items-center pt-4 text-center animate-enter">
        {status === "error" && (
          <Notice tone="error" className="mb-6 w-full text-left">
            <p>{error || "Có lỗi khi ghép cặp."}</p>
            <Button variant="secondary" size="sm" className="mt-3" onClick={onRetry}>
              <RefreshCw /> Thử lại
            </Button>
          </Notice>
        )}

        <CharacterSays mood="listen" size={120} enabled={characterOn} className="justify-center">
          {status === "error" ? "Mình chưa nghe thấy ai cả. Thử lại nhé." : "Mình đang nghe ngóng giúp bạn."}
        </CharacterSays>

        <p className="mt-6 text-6xl font-extrabold tracking-[-0.03em] text-ink tabular" aria-label={`Đã chờ ${formatClock(searchTime)}`}>
          {formatClock(searchTime)}
        </p>

        <div className="mt-4" aria-live="polite">
          <h1 className="text-xl font-extrabold tracking-[-0.03em] text-ink md:text-2xl">{heading}</h1>
          <p className="mt-2 text-sm text-muted">
            {others > 0 ? `${others} người đang chờ` : "Chưa có ai khác đang chờ"} · bạn chọn band{" "}
            <span className="font-bold text-ink tabular">{bandLabel}</span>
            {widened && bandLabel !== "Bất kỳ" ? " (đã mở rộng)" : ""}
          </p>
        </div>

        {status === "searching" && searchTime >= OFFER_SOLO_AFTER_S && (
          <Card className="mt-6 w-full text-left">
            <p className="text-sm text-ink-2">Chưa có ai phù hợp. Bạn có thể chờ tiếp, hoặc tập một mình trước rồi quay lại sau.</p>
            <Button variant="secondary" size="sm" className="mt-3" onClick={onPracticeSolo}>
              Tập một mình
            </Button>
          </Card>
        )}

        <Button variant="secondary" className="mt-8" onClick={onCancel}>
          Huỷ tìm
        </Button>
      </div>

      <section className="mx-auto mt-10 max-w-md border-t border-line pt-6">
        <Label>Ghép được rồi sẽ thế nào?</Label>
        <ol className="mt-3 space-y-2.5">
          {STEPS.map((s, i) => (
            <li key={s} className="flex gap-3 text-sm text-muted">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-extrabold text-subtle">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
      </section>
    </FlowShell>
  );
}
