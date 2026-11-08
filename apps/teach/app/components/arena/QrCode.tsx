'use client';

import { useMemo } from 'react';
import qrcode from 'qrcode-generator';

/** A QR code of `text`, drawn as one SVG (black on white, with the quiet border scanners need). */
export default function QrCode({ text, label, className = '' }: { text: string; label: string; className?: string }) {
    const cells = useMemo(() => {
        try {
            const qr = qrcode(0, 'M');
            qr.addData(text);
            qr.make();
            const n = qr.getModuleCount();
            const dark: [number, number][] = [];
            for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) dark.push([r, c]);
            return { n, dark };
        } catch {
            return null;
        }
    }, [text]);
    if (!cells) return null;
    const border = 4;
    const size = cells.n + border * 2;
    return (
        <svg role="img" aria-label={label} viewBox={`0 0 ${size} ${size}`} shapeRendering="crispEdges" className={className}>
            <rect width={size} height={size} fill="#fff" />
            {cells.dark.map(([r, c]) => (
                <rect key={`${r}-${c}`} x={c + border} y={r + border} width={1} height={1} fill="#000" />
            ))}
        </svg>
    );
}
