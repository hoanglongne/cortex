/**
 * The Today ring (issue #146): four arcs, one per stage, around one button.
 * SVG arc paths, clockwise from the top, with a gap between arcs. Pure.
 */
const rad = (deg: number) => ((deg - 90) * Math.PI) / 180;
const pt = (cx: number, cy: number, r: number, deg: number) => [cx + r * Math.cos(rad(deg)), cy + r * Math.sin(rad(deg))].map((n) => Math.round(n * 100) / 100);

/** `n` arc paths around (cx, cy) at radius r, each leaving `gap` degrees free. */
export function ringArcs(n: number, r: number, cx = r, cy = r, gap = 14): string[] {
    const span = 360 / n;
    return Array.from({ length: n }, (_, i) => {
        const a = i * span + gap / 2;
        const b = (i + 1) * span - gap / 2;
        const [x1, y1] = pt(cx, cy, r, a);
        const [x2, y2] = pt(cx, cy, r, b);
        return `M${x1},${y1} A${r},${r} 0 ${b - a > 180 ? 1 : 0} 1 ${x2},${y2}`;
    });
}

/** Where a stage's label sits: the middle of its arc, pushed out by `out`. */
export function arcMiddle(i: number, n: number, r: number, cx = r, cy = r, out = 0): [number, number] {
    const [x, y] = pt(cx, cy, r + out, (i + 0.5) * (360 / n));
    return [x, y];
}
