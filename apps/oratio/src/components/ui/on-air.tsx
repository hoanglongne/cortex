"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/** "Who is speaking" pill: lit while someone speaks. */
export function SpeakingPill({ on, label, className }: { on: boolean; label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.06em] transition-colors",
        on ? "bg-voice-soft text-voice" : "border border-line text-subtle",
        className
      )}
      aria-live="polite"
    >
      <span className={cn("size-2 rounded-full", on ? "bg-voice animate-pulse-soft" : "bg-surface-3")} />
      {label}
    </span>
  );
}

/**
 * A live waveform from a real audio stream (microphone or a remote track),
 * drawn as rounded bars. Silence is a row of short grey bars.
 */
export function LiveWaveform({
  stream,
  className,
  bars = 28,
  height = 48,
}: {
  stream: MediaStream | null;
  className?: string;
  bars?: number;
  height?: number;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !stream || stream.getAudioTracks().length === 0) return;

    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    const g = canvas.getContext("2d");
    const styles = getComputedStyle(canvas);
    const idle = styles.getPropertyValue("--c-line-strong").trim() || "#E2E2EA";
    let raf = 0;

    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (!g) return;
      const { width, height: h } = canvas;
      analyser.getByteTimeDomainData(data);
      g.clearRect(0, 0, width, h);
      const step = Math.floor(data.length / bars);
      const gap = width / bars;
      const w = Math.max(3, gap * 0.45);
      for (let i = 0; i < bars; i++) {
        let peak = 0;
        for (let j = 0; j < step; j++) peak = Math.max(peak, Math.abs(data[i * step + j] - 128));
        const level = Math.min(1, peak / 60);
        const bh = Math.max(6, level * h);
        g.fillStyle = level > 0.08 ? "#FF5A1F" : idle;
        const x = i * gap + (gap - w) / 2;
        const y = (h - bh) / 2;
        g.beginPath();
        g.roundRect(x, y, w, bh, w / 2);
        g.fill();
      }
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      source.disconnect();
      ctx.close();
    };
  }, [stream, bars]);

  return <canvas ref={canvasRef} width={bars * 10} height={height} className={cn("w-full max-w-xs", className)} style={{ height }} aria-hidden />;
}

/** @deprecated use SpeakingPill (kept while screens move over) */
export function OnAirLamp({ on, label, className }: { on: boolean; label?: string; className?: string }) {
  return <SpeakingPill on={on} label={label ?? "Đang nói"} className={className} />;
}
