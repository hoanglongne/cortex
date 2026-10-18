"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * The ON AIR lamp: lit (amber, breathing) while someone is speaking or
 * recording, dark otherwise. The only animated thing on a speaking screen.
 */
export function OnAirLamp({ on, label, className }: { on: boolean; label?: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors",
        on ? "border-onair/50 bg-onair-soft text-onair" : "border-line-strong text-subtle",
        className
      )}
      aria-live="polite"
    >
      <span className={cn("size-2 rounded-full", on ? "bg-onair animate-onair" : "bg-surface-3")} />
      {label ?? "On air"}
    </span>
  );
}

/**
 * A live waveform drawn from a real audio stream (microphone or a remote
 * track). Draws nothing fake: silence is a flat line.
 */
export function LiveWaveform({
  stream,
  className,
  bars = 32,
}: {
  stream: MediaStream | null;
  className?: string;
  bars?: number;
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
    const color = getComputedStyle(document.documentElement).getPropertyValue("--color-onair").trim() || "#FFB23F";
    const idle = getComputedStyle(document.documentElement).getPropertyValue("--color-surface-3").trim() || "#26282D";
    let raf = 0;

    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (!g) return;
      const { width, height } = canvas;
      analyser.getByteTimeDomainData(data);
      g.clearRect(0, 0, width, height);
      const step = Math.floor(data.length / bars);
      const gap = width / bars;
      for (let i = 0; i < bars; i++) {
        let peak = 0;
        for (let j = 0; j < step; j++) peak = Math.max(peak, Math.abs(data[i * step + j] - 128));
        const level = Math.min(1, peak / 64);
        const h = Math.max(2, level * height);
        g.fillStyle = level > 0.06 ? color : idle;
        g.fillRect(i * gap + gap * 0.25, (height - h) / 2, gap * 0.5, h);
      }
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      source.disconnect();
      ctx.close();
    };
  }, [stream, bars]);

  return <canvas ref={canvasRef} width={320} height={56} className={cn("h-14 w-full max-w-xs", className)} aria-hidden />;
}
