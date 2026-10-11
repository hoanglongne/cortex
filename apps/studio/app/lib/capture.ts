import type { Capture, CaptureSource } from './types';

export const SOURCE_LABEL: Record<CaptureSource, string> = {
    capture_threads: 'Threads',
    capture_facebook: 'Facebook',
    capture_tiktok: 'TikTok',
    capture_web: 'Web',
};

/** Phrase the API stores while a capture has no text yet. */
export const PLACEHOLDER = '(chưa có nội dung)';

const METRIC_LABEL: Record<string, string> = {
    likes: 'thích',
    replies: 'trả lời',
    reposts: 'đăng lại',
    shares: 'chia sẻ',
};

export function metricsText(m: Capture['metrics']): string {
    if (!m) return '';
    return Object.entries(m)
        .map(([k, v]) => `${v.toLocaleString('vi-VN')} ${METRIC_LABEL[k] ?? k}`)
        .join(' · ');
}

/** Values for the "Tạo trend" form, taken from the capture. */
export function prefillTrend(c: Pick<Capture, 'phrase' | 'body' | 'note'>): { label: string; summary: string } {
    const label = c.phrase === PLACEHOLDER ? '' : c.phrase.slice(0, 120);
    const parts = [c.note, c.body && c.body !== c.phrase ? c.body : null].filter(Boolean) as string[];
    return { label, summary: parts.join('\n\n').slice(0, 500) };
}

export function timeAgo(iso: string, now = Date.now()): string {
    const min = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60_000));
    if (min < 1) return 'vừa xong';
    if (min < 60) return `${min} phút trước`;
    const h = Math.round(min / 60);
    if (h < 24) return `${h} giờ trước`;
    return `${Math.round(h / 24)} ngày trước`;
}

const TRACKING = /^(utm_\w+|xmt|igshid|igsh|mibextid|fbclid|si|_r|_t|is_from_webapp|sender_device|slof)$/i;

/** Drops tracking parameters that make the same post look like a new link. */
export function cleanUrl(raw: string): string {
    try {
        const u = new URL(raw);
        for (const key of [...u.searchParams.keys()]) if (TRACKING.test(key)) u.searchParams.delete(key);
        u.hash = '';
        return u.toString().replace(/\?$/, '');
    } catch {
        return raw;
    }
}

/**
 * What an Android share sheet sends (title, text, url) → link + text. Apps
 * often put the link inside `text` ("Xem bài của @a trên Threads https://…").
 */
export function parseShared(input: { title?: string | null; text?: string | null; url?: string | null }): { url: string; text: string } {
    const all = [input.url, input.text, input.title].filter(Boolean).join('\n');
    const found = all.match(/https?:\/\/[^\s<>"]+/i)?.[0] ?? '';
    const url = found ? cleanUrl(found.replace(/[).,!?]+$/, '')) : '';
    const text = [input.title, input.text]
        .filter(Boolean)
        .join('\n')
        .replace(/https?:\/\/[^\s<>"]+/gi, '')
        .split('\n')
        .map(l => l.trim())
        .filter(l => l && !/^(xem|see|check out|view)\b.*(threads|facebook|tiktok)/i.test(l))
        .join('\n')
        .trim();
    return { url, text };
}
