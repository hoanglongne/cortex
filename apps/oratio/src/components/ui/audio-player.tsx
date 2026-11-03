"use client";

import * as React from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { clock } from "@/lib/rating-marks";
import { cn } from "@/lib/utils";

const RATES = [1, 1.25, 1.5, 0.75] as const;

/**
 * Oratio's own audio player in place of the browser's grey bar: a big play
 * button, a seek bar that can be dragged or moved with the arrow keys, back 10
 * seconds, and a speed button. The `<audio>` element is hidden; pass `audioRef`
 * to read its time or move it from outside (the speech map does).
 */
export function AudioPlayer({
  src,
  seconds,
  audioRef,
  limitSeconds,
  onTimeUpdate,
  onSeeked,
  onDuration,
  className,
}: {
  src: string;
  /** Length when the browser cannot say (recordings made in the browser often report an endless length) */
  seconds?: number;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  /** Only this much may be heard; the bar shows where it ends */
  limitSeconds?: number;
  onTimeUpdate?: (seconds: number) => void;
  onSeeked?: (seconds: number) => void;
  onDuration?: (seconds: number) => void;
  className?: string;
}) {
  const own = React.useRef<HTMLAudioElement>(null);
  const ref = audioRef ?? own;
  const bar = React.useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = React.useState(false);
  const [time, setTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [rate, setRate] = React.useState<(typeof RATES)[number]>(1);
  const dragging = React.useRef(false);

  const total = Number.isFinite(duration) && duration > 0 ? duration : (seconds ?? 0);
  const reach = limitSeconds && total ? Math.min(limitSeconds, total) : total;
  const pct = total ? Math.min(100, (time / total) * 100) : 0;
  const limitPct = limitSeconds && total && limitSeconds < total ? (limitSeconds / total) * 100 : null;

  const seek = (seconds: number) => {
    const el = ref.current;
    if (!el || !total) return;
    el.currentTime = Math.min(Math.max(0, seconds), reach || total);
    setTime(el.currentTime);
  };
  const seekFromPointer = (clientX: number) => {
    const box = bar.current?.getBoundingClientRect();
    if (box && box.width > 0) seek(((clientX - box.left) / box.width) * total);
  };
  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) void el.play().catch(() => undefined);
    else el.pause();
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <audio
        ref={ref}
        src={src}
        preload="metadata"
        className="hidden"
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration);
          if (Number.isFinite(e.currentTarget.duration)) onDuration?.(e.currentTarget.duration);
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => {
          const t = e.currentTarget.currentTime;
          if (!dragging.current) setTime(t);
          onTimeUpdate?.(t);
        }}
        onSeeked={(e) => onSeeked?.(e.currentTarget.currentTime)}
      />

      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Dừng" : "Phát"}
        className="flex size-12 shrink-0 items-center justify-center rounded-full bg-voice text-on-voice shadow-[0_3px_0_var(--color-voice-edge)] transition-transform active:translate-y-[2px] active:shadow-none"
      >
        {playing ? <Pause className="size-5 fill-current" aria-hidden /> : <Play className="size-5 translate-x-0.5 fill-current" aria-hidden />}
      </button>

      <div className="min-w-0 flex-1">
        <div
          ref={bar}
          role="slider"
          tabIndex={0}
          aria-label="Vị trí đang nghe"
          aria-valuemin={0}
          aria-valuemax={Math.round(total)}
          aria-valuenow={Math.round(time)}
          aria-valuetext={`${clock(time)} trên ${clock(total)}`}
          className="group relative flex h-8 cursor-pointer touch-none items-center"
          onPointerDown={(e) => {
            dragging.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            seekFromPointer(e.clientX);
          }}
          onPointerMove={(e) => dragging.current && seekFromPointer(e.clientX)}
          onPointerUp={() => {
            dragging.current = false;
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") seek(time + 5);
            else if (e.key === "ArrowLeft") seek(time - 5);
            else return;
            e.preventDefault();
          }}
        >
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
            <div className="h-full rounded-full bg-voice" style={{ width: `${pct}%` }} />
          </div>
          {limitPct != null && <span className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 rounded bg-subtle" style={{ left: `${limitPct}%` }} aria-hidden />}
          <span className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-voice shadow transition-transform group-hover:scale-110" style={{ left: `${pct}%` }} aria-hidden />
        </div>
        <div className="flex justify-between font-mono text-[12px] tabular text-subtle">
          <span>{clock(time)}</span>
          <span>{clock(total)}</span>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-center gap-1">
        <button
          type="button"
          onClick={() => seek(time - 10)}
          aria-label="Lùi 10 giây"
          className="flex size-9 items-center justify-center rounded-full border border-line-strong text-ink-2 hover:border-muted"
        >
          <RotateCcw className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => {
            const next = RATES[(RATES.indexOf(rate) + 1) % RATES.length];
            setRate(next);
            if (ref.current) ref.current.playbackRate = next;
          }}
          aria-label={`Tốc độ ${rate} lần. Bấm để đổi.`}
          className="h-6 rounded-full border border-line-strong px-2 font-mono text-[11px] font-bold text-ink-2 hover:border-muted"
        >
          {rate}x
        </button>
      </div>
    </div>
  );
}
