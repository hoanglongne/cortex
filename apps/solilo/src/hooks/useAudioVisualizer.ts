'use client';

import { useRef, useEffect, useCallback } from 'react';

/**
 * Drives a <canvas> element with a smooth waveform visualization from a MediaStream.
 */
export function useAudioVisualizer(stream: MediaStream | null) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animFrameRef = useRef<number>(0);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const prevHeightsRef = useRef<Float32Array | null>(null);

    const attachCanvas = useCallback((canvas: HTMLCanvasElement | null) => {
        canvasRef.current = canvas;
    }, []);

    useEffect(() => {
        if (!stream || !canvasRef.current) return;

        const audioCtx = new AudioContext();
        audioCtxRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        source.connect(analyser);
        analyserRef.current = analyser;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        // Smooth decay buffer
        if (!prevHeightsRef.current || prevHeightsRef.current.length !== bufferLength) {
            prevHeightsRef.current = new Float32Array(bufferLength);
        }
        const prevHeights = prevHeightsRef.current;

        function draw() {
            if (!ctx || !canvas) return;
            animFrameRef.current = requestAnimationFrame(draw);

            analyser!.getByteFrequencyData(dataArray);

            // Read theme colors from CSS variables
            const rootStyles = getComputedStyle(document.documentElement);
            const bgColor = rootStyles.getPropertyValue('--color-background').trim() || '#0F172A';
            const accentRgb = rootStyles.getPropertyValue('--color-accent-rgb').trim() || '244, 63, 94';
            const goldRgb = rootStyles.getPropertyValue('--color-band-gold-rgb').trim() || '251, 191, 36';
            const [aR, aG, aB] = accentRgb.split(',').map(Number);
            const [gR, gG, gB] = goldRgb.split(',').map(Number);

            // Clear with slight trail for glow effect
            // Convert hex bg to rgba for trail
            const hex = bgColor.replace('#', '');
            const bgR = parseInt(hex.substring(0, 2), 16);
            const bgG = parseInt(hex.substring(2, 4), 16);
            const bgB = parseInt(hex.substring(4, 6), 16);
            ctx.fillStyle = `rgba(${bgR}, ${bgG}, ${bgB}, 0.85)`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2;
            const gap = 2;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const target = (dataArray[i] / 255) * canvas.height * 0.9;
                // Smooth rise/fall
                prevHeights[i] += (target - prevHeights[i]) * 0.3;
                const barHeight = prevHeights[i];

                // Color gradient: bottom=accent, top=gold
                const t = barHeight / canvas.height;
                const r = aR + (gR - aR) * t;
                const g = aG + (gG - aG) * t;
                const b = aB + (gB - aB) * t;

                // Glow
                ctx.shadowColor = `rgba(${aR}, ${aG}, ${aB}, ${0.3 * t})`;
                ctx.shadowBlur = 8 * t;

                // Rounded bars via fillRect with gradient
                const gradient = ctx.createLinearGradient(x, canvas.height, x, canvas.height - barHeight);
                gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.9)`);
                gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.4)`);
                ctx.fillStyle = gradient;

                const barX = x + gap / 2;
                const barW = Math.max(barWidth - gap, 1);
                // Draw rounded bar (top corners)
                const radius = Math.min(barW / 2, 3);
                const barY = canvas.height - barHeight;
                ctx.beginPath();
                ctx.moveTo(barX + radius, barY);
                ctx.lineTo(barX + barW - radius, barY);
                ctx.quadraticCurveTo(barX + barW, barY, barX + barW, barY + radius);
                ctx.lineTo(barX + barW, canvas.height);
                ctx.lineTo(barX, canvas.height);
                ctx.lineTo(barX, barY + radius);
                ctx.quadraticCurveTo(barX, barY, barX + radius, barY);
                ctx.fill();

                ctx.shadowBlur = 0;

                x += barWidth;
            }
        }

        draw();

        return () => {
            cancelAnimationFrame(animFrameRef.current);
            audioCtx.close();
        };
    }, [stream]);

    return { attachCanvas };
}
