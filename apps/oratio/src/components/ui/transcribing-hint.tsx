"use client";

import * as React from "react";

const TIPS = [
  "Người nói trôi chảy cũng dừng, nhưng dừng ở ranh giới giữa các ý, không dừng giữa một ý.",
  "Từ “um”, “uh” nghe nhiều lần làm người nghe mệt hơn là một quãng im lặng ngắn.",
  "Nói liền cả cụm như “a lot of people” sẽ nhanh và tự nhiên hơn nói từng từ rời.",
  "Một câu có “because” hoặc “although” cho thấy bạn nối được ý, điểm ngữ pháp được lợi.",
  "Thay một từ quen như “good” bằng từ cụ thể hơn (rewarding, reliable…) giúp điểm từ vựng.",
  "Máy chép lại ngay trên máy bạn. Âm thanh không rời khỏi thiết bị.",
  "Nghe lại chính mình thường cho thấy nhiều điều hơn là nhớ lại lúc đang nói.",
];

const BARS = [0.5, 0.9, 0.65, 1, 0.7, 0.85, 0.55, 0.95, 0.6];

/**
 * Something to look at while the words are being written down: the first time
 * the model has to be downloaded, and then it takes a while to listen. Bars
 * that move, what it is doing now, and a tip about speaking every few seconds.
 */
export function TranscribingHint({ loaded }: { loaded: number }) {
  const [seconds, setSeconds] = React.useState(0);
  React.useEffect(() => {
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, []);
  const tip = Math.floor(seconds / 6) % TIPS.length;

  const downloading = loaded > 0 && loaded < 1;
  const phase = downloading ? `Đang tải mô hình nghe (${Math.round(loaded * 100)}%). Lần sau sẽ nhanh hơn.` : seconds < 4 ? "Chuẩn bị nghe…" : "Đang nghe từng từ…";
  return (
    <div className="mt-2 rounded-[12px] bg-surface-2 px-3 py-3" role="status" aria-live="polite">
      <div className="flex items-center gap-3">
        <div className="flex h-8 items-center gap-[3px]" aria-hidden>
          {BARS.map((h, i) => (
            <span key={i} className="w-[3px] origin-center rounded-full bg-voice" style={{ height: `${h * 100}%`, animation: `eq 0.9s ease-in-out ${i * 0.09}s infinite alternate` }} />
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-ink-2">{phase}</p>
          {downloading && (
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-3">
              <div className="h-full rounded-full bg-voice transition-[width]" style={{ width: `${Math.round(loaded * 100)}%` }} />
            </div>
          )}
        </div>
        <span className="tabular text-[12px] text-subtle">{seconds}s</span>
      </div>
      <p key={tip} className="mt-2 text-[12px] leading-snug text-muted" style={{ animation: "enter 0.4s ease-out" }}>
        <b className="text-ink-2">Mẹo:</b> {TIPS[tip]}
      </p>
    </div>
  );
}
