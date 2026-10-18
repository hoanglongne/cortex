"use client";

import { RefreshCw } from "lucide-react";
import { useOnlineCount } from "@/hooks/useOnlineCount";
import { Button } from "@/components/ui/button";
import { Label, Notice } from "@/components/ui/card";
import { OnAirLamp } from "@/components/ui/on-air";
import { FlowShell } from "@/components/ui/shell";
import { formatClock } from "@/components/ui/timer";

interface MatchmakingScreenProps {
  /** The partner band range being searched, as shown on Home ("Bất kỳ", "6.0–7.0"…) */
  bandLabel: string;
  onCancel: () => void;
  onRetry: () => void;
  onPracticeSolo: () => void;
  status: "searching" | "matched" | "error";
  searchTime: number;
  error?: string | null;
}

/** After this long with no partner, offer solo practice. */
const OFFER_SOLO_AFTER_S = 45;
/** Matches findMatch's rules: after 90s any band is accepted. */
const ANY_BAND_AFTER_S = 90;

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
  // The count includes this user while they wait
  const others = Math.max(0, count - 1);

  const heading =
    status === "error"
      ? "Không kết nối được"
      : searchTime >= ANY_BAND_AFTER_S
        ? "Đang tìm với mọi band…"
        : "Đang tìm bạn luyện…";

  return (
    <FlowShell onBack={onCancel} backLabel="Huỷ" right={<OnAirLamp on={false} label="Đang tìm" />}>
      <div className="pt-6 text-center animate-enter">
        {status === "error" && (
          <Notice tone="error" className="mb-8 text-left">
            <p>{error || "Có lỗi khi ghép cặp."}</p>
            <Button variant="secondary" size="sm" className="mt-3" onClick={onRetry}>
              <RefreshCw /> Thử lại
            </Button>
          </Notice>
        )}

        <p
          className="font-mono text-6xl tabular text-ink sm:text-7xl"
          aria-label={`Đã chờ ${formatClock(searchTime)}`}
        >
          {formatClock(searchTime)}
        </p>

        <div className="mt-6" aria-live="polite">
          <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">{heading}</h1>
          <p className="mt-2 text-sm text-muted">
            Band bạn luyện cùng: <span className="font-mono text-ink-2">{bandLabel}</span>
            {searchTime >= ANY_BAND_AFTER_S && bandLabel !== "Bất kỳ" ? " (đã mở rộng)" : ""}
          </p>
          <p className="mt-1 text-sm text-subtle">
            {others > 0 ? `${others} người khác đang chờ ghép` : "Chưa có ai khác đang chờ"}
          </p>
        </div>

        {status === "searching" && searchTime >= OFFER_SOLO_AFTER_S && (
          <div className="mx-auto mt-8 max-w-md rounded-[var(--radius-card)] border border-line bg-surface p-4 text-left">
            <p className="text-sm text-ink-2">
              Chưa có ai phù hợp. Bạn có thể chờ tiếp, hoặc luyện một mình trước rồi quay lại sau.
            </p>
            <Button variant="secondary" className="mt-3" onClick={onPracticeSolo}>
              Tập một mình
            </Button>
          </div>
        )}
      </div>

      <section className="mt-12 border-t border-line pt-6">
        <Label>Buổi luyện diễn ra thế nào?</Label>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
          <li>
            Hai bạn lần lượt làm <span className="text-ink-2">giám khảo</span> và <span className="text-ink-2">thí sinh</span>, đổi vai sau mỗi lượt.
          </li>
          <li>Giám khảo đọc câu hỏi trên màn hình và bấm “Câu tiếp theo”. Thí sinh trả lời bằng giọng nói.</li>
          <li>Có Part 1, Part 2 (thẻ đề, 1 phút chuẩn bị, nói 2 phút) và Part 3, tổng 18 câu.</li>
          <li>Xong buổi, hai bạn chấm nhau theo 4 tiêu chí IELTS.</li>
        </ul>
      </section>
    </FlowShell>
  );
}
