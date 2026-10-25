/**
 * The score as an image to share (1080×1350, the size Instagram and Zalo
 * show whole): the score, its IELTS range, vocabulary size, date. Drawn on
 * a canvas in the browser; no network, no fonts to load.
 */
import { ieltsRange, vocabSize } from './engine';

export interface ShareScore {
    score: number;
    sd: number;
    at: number;
    /** e.g. "Trung cấp · B1–B2" */
    level: string;
    /** "+85" since the test before, if any. */
    change?: number | null;
    /** Shown under the title when the score was checked by the server. */
    verifyUrl?: string | null;
}

const W = 1080;
const H = 1350;

export function drawShareCard(canvas: HTMLCanvasElement, s: ShareScore, theme: { bg: string; ink: string; muted: string; accent: string; line: string }): void {
    canvas.width = W;
    canvas.height = H;
    const g = canvas.getContext('2d');
    if (!g) return;
    const font = (size: number, weight = 600, mono = false) => `${weight} ${size}px ${mono ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif'}`;

    g.fillStyle = theme.bg;
    g.fillRect(0, 0, W, H);
    // A soft glow of the accent behind the score.
    const glow = g.createRadialGradient(W / 2, 520, 40, W / 2, 520, 620);
    glow.addColorStop(0, `${theme.accent}33`);
    glow.addColorStop(1, `${theme.accent}00`);
    g.fillStyle = glow;
    g.fillRect(0, 0, W, H);

    g.textAlign = 'center';
    g.fillStyle = theme.accent;
    g.font = font(34, 600, true);
    g.fillText('ĐIỂM TỪ VỰNG LEXICA', W / 2, 220);

    g.fillStyle = theme.ink;
    g.font = font(300, 800, true);
    g.fillText(String(s.score), W / 2, 560);

    g.fillStyle = theme.muted;
    g.font = font(40, 500);
    g.fillText(`± ${s.sd} điểm${s.change ? ` · ${s.change > 0 ? '+' : ''}${s.change} so với lần trước` : ''}`, W / 2, 640);

    // Two boxes: IELTS range, vocabulary size.
    const boxes: [string, string][] = [
        ['IELTS từ vựng tương đương', `khoảng ${ieltsRange(s.score, s.sd)}`],
        ['Vốn từ ước lượng', `~${vocabSize(s.score).toLocaleString('vi-VN')} từ`],
    ];
    boxes.forEach(([label, value], i) => {
        const x = 100 + i * 450;
        const y = 740;
        g.strokeStyle = theme.line;
        g.lineWidth = 3;
        g.beginPath();
        g.roundRect(x, y, 430, 200, 32);
        g.stroke();
        g.textAlign = 'left';
        g.fillStyle = theme.muted;
        g.font = font(27, 500);
        g.fillText(label, x + 34, y + 70, 430 - 68);
        g.fillStyle = theme.ink;
        g.font = font(52, 700);
        g.fillText(value, x + 34, y + 150, 430 - 68);
    });

    g.textAlign = 'center';
    g.fillStyle = theme.ink;
    g.font = font(40, 600);
    g.fillText(s.level, W / 2, 1040);
    g.fillStyle = theme.muted;
    g.font = font(30, 500);
    g.fillText(`Ngày ${new Date(s.at).toLocaleDateString('vi-VN')}${s.verifyUrl ? ' · đã xác minh' : ' · điểm luyện tập'}`, W / 2, 1095);
    if (s.verifyUrl) {
        g.font = font(26, 500, true);
        g.fillText(s.verifyUrl.replace(/^https?:\/\//, ''), W / 2, 1145);
    }

    g.fillStyle = theme.accent;
    g.font = font(44, 800);
    g.fillText('LEXICA', W / 2, 1260);
    g.fillStyle = theme.muted;
    g.font = font(26, 500);
    g.fillText('Ước lượng, không phải điểm thi IELTS chính thức', W / 2, 1305);
}

/** Share the image (phone share sheet), or download it where sharing files is not possible. */
export async function shareCanvas(canvas: HTMLCanvasElement, name = 'lexica-diem-tu-vung.png'): Promise<'shared' | 'downloaded'> {
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/png'));
    if (!blob) throw new Error('no image');
    const file = new File([blob], name, { type: 'image/png' });
    if (typeof navigator !== 'undefined' && navigator.canShare?.({ files: [file] })) {
        try {
            await navigator.share({ files: [file], title: 'Điểm từ vựng Lexica' });
            return 'shared';
        } catch {
            // cancelled: fall through to download
        }
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    return 'downloaded';
}
