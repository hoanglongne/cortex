import type { Edition } from './economy';
import { EDITION_LABEL } from './economy';

/**
 * Draws a minted card as a 9:16 image (stories format) and opens the share
 * sheet, or downloads it where sharing files is not supported (§2.7).
 */

const W = 1080;
const H = 1920;
const COLORS = { bg: '#0E0F11', surface: '#16171A', ink: '#EDEEF0', muted: '#9A9DA3', accent: '#C6F432', warning: '#F5B83D', silver: '#C9CDD4' };
const BORDER: Record<Edition, string> = { common: '#34373D', silver: COLORS.silver, holo: COLORS.accent, legendary: COLORS.warning };

export function wrapLines(text: string, maxChars: number): string[] {
    const lines: string[] = [];
    let line = '';
    for (const word of text.split(/\s+/)) {
        if ((line + ' ' + word).trim().length > maxChars && line) {
            lines.push(line);
            line = word;
        } else {
            line = (line + ' ' + word).trim();
        }
    }
    if (line) lines.push(line);
    return lines;
}

function draw(card: { word: string; ipa?: string; meaning: string; scenario: string; edition: Edition; serial: number | null }): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;
    const font = getComputedStyle(document.body).fontFamily || 'system-ui, sans-serif';

    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, W, H);

    // Card
    const x = 90, y = 260, w = W - 180, h = 1300;
    ctx.fillStyle = COLORS.surface;
    ctx.strokeStyle = BORDER[card.edition];
    ctx.lineWidth = card.edition === 'common' ? 4 : 10;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 56);
    ctx.fill();
    ctx.stroke();

    if (card.edition === 'holo' || card.edition === 'legendary') {
        const g = ctx.createLinearGradient(x, y, x + w, y + h);
        const tint = card.edition === 'legendary' ? '245,184,61' : '198,244,50';
        g.addColorStop(0.35, `rgba(${tint},0)`);
        g.addColorStop(0.5, `rgba(${tint},0.18)`);
        g.addColorStop(0.65, `rgba(${tint},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 56);
        ctx.fill();
    }

    ctx.fillStyle = BORDER[card.edition] === '#34373D' ? COLORS.muted : BORDER[card.edition];
    ctx.font = `600 40px ${font}`;
    ctx.fillText(`${EDITION_LABEL[card.edition].toUpperCase()}${card.serial != null ? `  #${String(card.serial).padStart(4, '0')}` : ''}`, x + 70, y + 120);

    ctx.fillStyle = COLORS.accent;
    ctx.font = `700 ${card.word.length > 11 ? 96 : 120}px ${font}`;
    ctx.fillText(card.word, x + 70, y + 300);

    let cy = y + 380;
    if (card.ipa) {
        ctx.fillStyle = COLORS.muted;
        ctx.font = `400 44px ${font}`;
        ctx.fillText(`/${card.ipa}/`, x + 70, cy);
        cy += 90;
    }
    ctx.fillStyle = COLORS.ink;
    ctx.font = `500 52px ${font}`;
    for (const line of wrapLines(card.meaning, 30)) {
        ctx.fillText(line, x + 70, cy);
        cy += 68;
    }
    cy += 50;
    ctx.fillStyle = COLORS.muted;
    ctx.font = `italic 400 46px ${font}`;
    for (const line of wrapLines(`“${card.scenario}”`, 34).slice(0, 9)) {
        ctx.fillText(line, x + 70, cy);
        cy += 64;
    }

    ctx.fillStyle = COLORS.ink;
    ctx.font = `700 64px ${font}`;
    ctx.fillText('Lexica', 90, H - 200);
    ctx.fillStyle = COLORS.muted;
    ctx.font = `400 40px ${font}`;
    ctx.fillText('Học từ vựng bằng câu chuyện đời thường', 90, H - 140);
    return canvas;
}

export async function shareCardImage(card: Parameters<typeof draw>[0]): Promise<void> {
    const canvas = draw(card);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) return;
    const file = new File([blob], `lexica-${card.word.toLowerCase()}.png`, { type: 'image/png' });
    const nav = navigator as Navigator & { canShare?: (data: { files: File[] }) => boolean };
    if (nav.canShare?.({ files: [file] })) {
        try {
            await nav.share({ files: [file], title: card.word });
            return;
        } catch {
            // Cancelled: fall through to download.
        }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
