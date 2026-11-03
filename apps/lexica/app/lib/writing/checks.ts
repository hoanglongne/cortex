/**
 * Self-check for the writing ladder (issue #105). Nothing here gives a score
 * or a band: it only looks at things a person can see in the text (length,
 * linking words, a number, a contraction) and says what is there and what is
 * missing, with a tip. What needs judgement is left to the learner's own
 * checklist. Pure, unit tested, runs on the device: the text never leaves it.
 */

export interface Check {
    id: string;
    pass: boolean;
    /** What was looked for, in Vietnamese */
    label: string;
    /** What to do when it is missing */
    tip: string;
}

export const words = (text: string): string[] => text.toLowerCase().match(/[a-z]+(?:['’-][a-z]+)*|\d+(?:[.,]\d+)?%?/g) ?? [];
export const wordCount = (text: string): number => (text.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g) ?? []).length;

const has = (text: string, list: readonly string[]) => list.some((w) => new RegExp(`(^|[^a-z])${w}([^a-z]|$)`, 'i').test(text));
const hits = (text: string, list: readonly string[]) => list.filter((w) => new RegExp(`(^|[^a-z])${w}([^a-z]|$)`, 'i').test(text)).length;

/** Contractions read as informal in an exam essay. */
export const CONTRACTION = /\b(?:can't|won't|don't|doesn't|didn't|isn't|aren't|wasn't|weren't|it's|that's|there's|i'm|i've|i'd|we're|they're|you're|let's|couldn't|wouldn't|shouldn't)\b/i;

/** Casual words a formal sentence usually replaces. */
export const INFORMAL = ['very', 'really', 'a lot of', 'lots of', 'kind of', 'sort of', 'stuff', 'things', 'thing', 'gonna', 'wanna', 'okay', 'ok', 'get', 'got', 'big'] as const;

export const LINKING = ['however', 'therefore', 'moreover', 'furthermore', 'in addition', 'as a result', 'for example', 'for instance', 'such as', 'because', 'although', 'while', 'whereas', 'in conclusion', 'overall', 'consequently', 'this means', 'in other words'] as const;
export const EXAMPLE_MARKS = ['for example', 'for instance', 'such as', 'e.g'] as const;
export const CLOSING_MARKS = ['in conclusion', 'to sum up', 'overall', 'in summary', 'therefore', 'as a result', 'this shows', 'this means'] as const;

export const TREND_WORDS = ['rose', 'rise', 'rises', 'risen', 'increase', 'increased', 'grew', 'grow', 'growth', 'climbed', 'fell', 'fall', 'fallen', 'decrease', 'decreased', 'declined', 'decline', 'dropped', 'drop', 'remained', 'stable', 'stayed', 'fluctuated', 'peaked', 'reached', 'recovered'] as const;
export const COMPARE_WORDS = ['whereas', 'while', 'compared with', 'compared to', 'higher', 'lower', 'more than', 'less than', 'the highest', 'the lowest', 'similar', 'in contrast', 'by contrast', 'than'] as const;
export const OVERVIEW_WORDS = ['overall', 'in general', 'generally', 'it is clear that', 'as a whole', 'the most noticeable', 'it can be seen that'] as const;
export const OPINION = ['i think', 'in my opinion', 'i believe', 'i feel', 'i guess'] as const;

/** Share of words of `a` that no longer appear in `b` (0 = same words, 1 = nothing in common). */
export function changedShare(a: string, b: string): number {
    const before = words(a);
    const after = new Set(words(b));
    if (before.length === 0) return 0;
    return before.filter((w) => !after.has(w)).length / before.length;
}

/** W2: the same sentence, said more formally. */
export function checkFormalRewrite(input: { original: string; rewrite: string; options: readonly string[] }): Check[] {
    const t = input.rewrite.trim();
    const n = wordCount(t);
    const usedOption = input.options.some((o) => t.toLowerCase().includes(o.toLowerCase()));
    const informal = INFORMAL.filter((w) => has(t, [w]));
    return [
        { id: 'length', pass: n >= 6 && /[.!?]$/.test(t), label: 'Là một câu đủ ý, có dấu chấm cuối', tip: 'Viết thành một câu hoàn chỉnh (ít nhất 6 từ) và kết thúc bằng dấu chấm.' },
        { id: 'changed', pass: changedShare(input.original, t) >= 0.25, label: 'Khác câu gốc, không chỉ đổi một từ', tip: 'Thử đổi cả cụm, hoặc đổi cách mở câu, không chỉ thay một từ.' },
        { id: 'option', pass: usedOption, label: 'Dùng một cụm trang trọng từ gợi ý', tip: 'Xem các gợi ý bên dưới và dùng ít nhất một cụm.' },
        { id: 'informal', pass: informal.length === 0, label: informal.length ? `Còn từ thân mật: ${informal.join(', ')}` : 'Không còn từ thân mật (very, really, a lot of…)', tip: 'Thay các từ thân mật bằng từ chính xác hơn (vd very big → substantial).' },
        { id: 'contraction', pass: !CONTRACTION.test(t), label: 'Không viết tắt (don’t, it’s…)', tip: 'Viết đầy đủ: do not, it is.' },
    ];
}

/** W3: a paragraph in four parts. */
export function checkParagraph(parts: { idea: string; explain: string; example: string; wrap: string }): Check[] {
    const all = [parts.idea, parts.explain, parts.example, parts.wrap].join(' ');
    const n = wordCount(all);
    const short = (Object.entries(parts) as [string, string][]).filter(([, v]) => wordCount(v) < 8).map(([k]) => k);
    const LABEL: Record<string, string> = { idea: 'nêu ý', explain: 'giải thích', example: 'ví dụ', wrap: 'kết' };
    return [
        { id: 'parts', pass: short.length === 0, label: short.length ? `Phần còn ngắn: ${short.map((k) => LABEL[k]).join(', ')}` : 'Cả 4 phần đều đủ ý (từ 8 từ trở lên)', tip: 'Mỗi phần cần ít nhất một câu đầy đủ, khoảng 8 từ trở lên.' },
        { id: 'length', pass: n >= 60 && n <= 160, label: `Độ dài ${n} từ (khoảng 60 đến 160)`, tip: n < 60 ? 'Thêm chi tiết ở phần giải thích hoặc ví dụ.' : 'Cắt bớt ý lặp, giữ một ý chính.' },
        { id: 'linking', pass: hits(all, LINKING) >= 2, label: 'Có ít nhất 2 từ nối (because, however, for example…)', tip: 'Nối các câu bằng từ nối để người đọc theo kịp ý.' },
        { id: 'example', pass: has(parts.example, EXAMPLE_MARKS), label: 'Phần ví dụ mở bằng for example / for instance / such as', tip: 'Mở phần ví dụ bằng “For example,” để người đọc nhận ra.' },
        { id: 'wrap', pass: has(parts.wrap, CLOSING_MARKS), label: 'Phần kết nhắc lại ý (in conclusion, overall, therefore…)', tip: 'Mở phần kết bằng một từ báo kết như “Overall,” hoặc “Therefore,”.' },
        { id: 'contraction', pass: !CONTRACTION.test(all), label: 'Không viết tắt', tip: 'Viết đầy đủ: do not, it is.' },
    ];
}

export interface ChartData {
    title: string;
    unit: string;
    years: number[];
    series: { name: string; values: number[] }[];
}

/** W4: describing a chart (Task 1 style). `chart` is the one on screen. */
export function checkTask1(text: string, chart: ChartData): Check[] {
    const n = wordCount(text);
    const numbers = new Set(text.match(/\d+(?:[.,]\d+)?/g) ?? []);
    const wanted = new Set<string>();
    for (const s of chart.series) for (const v of s.values) wanted.add(String(v));
    const mentioned = [...wanted].filter((v) => numbers.has(v)).length;
    const missingSeries = chart.series.filter((s) => !new RegExp(s.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(text)).map((s) => s.name);
    return [
        { id: 'length', pass: n >= 150, label: `Độ dài ${n} từ (Task 1 cần từ 150 từ)`, tip: 'Thêm một đoạn so sánh các số liệu chính.' },
        { id: 'overview', pass: has(text, OVERVIEW_WORDS), label: 'Có câu tổng quan (overall, in general…)', tip: 'Thêm một câu “Overall, …” nói xu hướng chung, không nêu số.' },
        { id: 'trend', pass: hits(text, TREND_WORDS) >= 2, label: 'Nêu xu hướng bằng động từ (rose, fell, remained stable…)', tip: 'Dùng ít nhất hai động từ chỉ xu hướng khác nhau.' },
        { id: 'numbers', pass: mentioned >= 3, label: `Dùng số liệu từ biểu đồ (${mentioned} số)`, tip: 'Trích ít nhất 3 số trong biểu đồ để chứng minh xu hướng.' },
        { id: 'series', pass: missingSeries.length === 0, label: missingSeries.length ? `Chưa nhắc tới: ${missingSeries.join(', ')}` : 'Đã nhắc tới mọi đường trong biểu đồ', tip: 'Mỗi đường trong biểu đồ cần ít nhất một câu.' },
        { id: 'compare', pass: hits(text, COMPARE_WORDS) >= 1, label: 'Có so sánh (whereas, higher than, compared with…)', tip: 'So sánh ít nhất hai đường với nhau.' },
        { id: 'opinion', pass: !has(text, OPINION), label: 'Không nêu ý kiến cá nhân (I think…)', tip: 'Task 1 chỉ mô tả số liệu, không nêu ý kiến.' },
    ];
}

/** How many checks passed, for "4/6 mục". */
export const passed = (checks: readonly Check[]) => checks.filter((c) => c.pass).length;
