import { api } from './api';
import { LEVELS, type Draft, type RuleResult } from './types';
import { RULE_LABELS } from './types';

/**
 * One review queue for every kind of content. Each kind describes how to load
 * its pending items, how to show them (labelled text blocks) and how to approve
 * or reject one; the screen is the same for all of them.
 */
export type ReviewType = 'drafts' | 'variants' | 'quotes' | 'passages' | 'talk' | 'filtered';

export const TYPE_LABEL: Record<ReviewType, string> = {
    drafts: 'Thẻ mới',
    variants: 'Câu mẫu',
    quotes: 'Ngoài đời',
    passages: 'Bài đọc',
    talk: 'Giao tiếp',
    filtered: 'Bị lọc tự động',
};

export interface Field {
    key: string;
    label: string;
    multiline?: boolean;
    options?: readonly string[];
}

export interface Block {
    label: string;
    text: string;
    /** The sentence under review: shown large */
    main?: boolean;
    muted?: boolean;
    /** Highlight the UPPER-CASE target word like Lexica's card */
    target?: boolean;
}

export interface Note {
    tone: 'ok' | 'warn' | 'bad';
    text: string;
    detail?: string;
}

export interface ReviewItem {
    key: string;
    type: ReviewType;
    id: string;
    title: string;
    subtitle?: string;
    badges: string[];
    blocks: Block[];
    notes: Note[];
    fields: Field[];
    values: Record<string, string>;
    canApprove: boolean;
    /** Asks for a reason before rejecting (new cards only) */
    reasons?: readonly string[];
    send: (action: 'approve' | 'reject', edits?: Record<string, string>, reason?: string) => Promise<unknown>;
}

export const DRAFT_REASONS = ['cringe', 'sai nghĩa', 'nhạy cảm', 'trend cũ', 'khác'] as const;

/** Notes from a draft's automatic checks: only what needs the editor's eye, or "all passed". */
export function draftNotes(rules: Record<string, RuleResult>): Note[] {
    const bad = Object.entries(rules).filter(([, r]) => !r.pass);
    if (bad.length === 0) return [{ tone: 'ok', text: 'Đạt mọi kiểm tra tự động' }];
    return bad.map(([name, r]) => ({ tone: r.hard ? 'bad' : 'warn', text: RULE_LABELS[name] ?? name, detail: r.detail }));
}

function fromDraft(d: Draft, type: 'drafts' | 'filtered'): ReviewItem {
    return {
        key: `${type}:${d.id}`,
        type,
        id: d.id,
        title: d.word,
        subtitle: [d.ipa ? `/${d.ipa}/` : '', d.translation_hint].filter(Boolean).join('  ·  '),
        badges: [d.trend_label, d.level, d.tone, d.archetype].filter((x): x is string => !!x),
        blocks: [
            { label: 'Câu', text: d.scenario, main: true, target: true },
            ...(d.collocations?.length ? [{ label: 'Hay đi với', text: d.collocations.join(' · '), muted: true }] : []),
        ],
        notes: type === 'filtered' ? [...draftNotes(d.validation.rules), { tone: 'warn', text: 'Bị lọc: sửa lại câu rồi duyệt' }] : draftNotes(d.validation.rules),
        fields: [
            { key: 'scenario', label: 'Câu (từ đích viết HOA)', multiline: true },
            { key: 'translationHint', label: 'Nghĩa' },
            { key: 'level', label: 'Level', options: LEVELS },
        ],
        values: { scenario: d.scenario, translationHint: d.translation_hint, level: d.level },
        canApprove: type === 'drafts',
        reasons: DRAFT_REASONS,
        send: (action, edits, reason) =>
            api(`/drafts/${d.id}/${action}`, { method: 'POST', body: action === 'reject' ? { reason } : (edits ?? {}) }),
    };
}

interface VariantGroup {
    card: { id: string; word: string; scenario: string; translation_hint: string };
    variants: { card_id: string; archetype: 'tech' | 'business' | 'student'; scenario: string }[];
}
const ARCH: Record<string, string> = { tech: 'Dân tech', business: 'Văn phòng', student: 'Sinh viên' };

interface QuoteRow {
    id: string;
    word: string;
    kind: 'book' | 'news' | 'song';
    text: string;
    translation: string | null;
    source: string;
}
const KIND: Record<string, string> = { book: 'Sách', news: 'Báo', song: 'Bài hát' };

interface PassageRow {
    id: string;
    level: string;
    kind: 'text' | 'dialogue';
    topic: string;
    title: string;
    text: string;
    translation: string;
    new_word_list: { word: string }[];
}

interface TalkRow {
    id: string;
    level: string;
    topic: string;
    phrase: string;
    scenario: string;
    translation_hint: string;
    situation_prompt: string;
    situation_model: string;
}

export const wordCount = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;

export async function loadPending(type: ReviewType): Promise<ReviewItem[]> {
    switch (type) {
        case 'drafts':
        case 'filtered': {
            const status = type === 'drafts' ? 'pending' : 'rejected_auto';
            return (await api<Draft[]>(`/drafts?status=${status}&limit=30`)).map(d => fromDraft(d, type));
        }
        case 'variants': {
            const groups = await api<VariantGroup[]>('/variants?status=pending&limit=20');
            return groups.flatMap(g =>
                g.variants.map<ReviewItem>(v => ({
                    key: `variants:${v.card_id}:${v.archetype}`,
                    type,
                    id: `${v.card_id}:${v.archetype}`,
                    title: g.card.word,
                    subtitle: g.card.translation_hint,
                    badges: [ARCH[v.archetype]],
                    blocks: [
                        { label: `Câu cho ${ARCH[v.archetype].toLowerCase()}`, text: v.scenario, main: true, target: true },
                        { label: 'Câu gốc (đời thường)', text: g.card.scenario, muted: true, target: true },
                    ],
                    notes: [],
                    fields: [{ key: 'scenario', label: 'Câu (từ đích viết HOA)', multiline: true }],
                    values: { scenario: v.scenario },
                    canApprove: true,
                    send: (action, edits) =>
                        api(`/variants/${v.card_id}/${v.archetype}`, { method: 'POST', body: { action, ...(edits?.scenario !== undefined ? { scenario: edits.scenario } : {}) } }),
                })),
            );
        }
        case 'quotes':
            return (await api<QuoteRow[]>('/quotes?status=pending&limit=30')).map<ReviewItem>(q => ({
                key: `quotes:${q.id}`,
                type,
                id: q.id,
                title: q.word,
                badges: [KIND[q.kind], q.source].filter(Boolean),
                blocks: [{ label: 'Câu trích', text: q.text, main: true }, ...(q.translation ? [{ label: 'Dịch', text: q.translation, muted: true }] : [])],
                notes: [],
                fields: [{ key: 'text', label: 'Câu trích', multiline: true }],
                values: { text: q.text },
                canApprove: true,
                send: (action, edits) => api(`/quotes/${q.id}/${action}`, { method: 'POST', body: edits?.text !== undefined ? { text: edits.text } : {} }),
            }));
        case 'passages':
            return (await api<PassageRow[]>('/passages?status=pending&limit=15')).map<ReviewItem>(p => {
                const n = wordCount(p.text);
                const [min, max] = p.kind === 'dialogue' ? [60, 170] : [120, 200];
                return {
                    key: `passages:${p.id}`,
                    type,
                    id: p.id,
                    title: p.title,
                    subtitle: `Từ mới: ${p.new_word_list.map(w => w.word).join(', ')}`,
                    badges: [p.level, p.topic, p.kind === 'dialogue' ? 'Hội thoại' : 'Đoạn văn'],
                    blocks: [
                        { label: 'Nội dung', text: p.text, main: true },
                        { label: 'Bản dịch', text: p.translation, muted: true },
                    ],
                    notes: [n >= min && n <= max ? { tone: 'ok', text: `${n} từ, đúng độ dài` } : { tone: 'warn', text: `${n} từ, ngoài khoảng ${min}–${max}` }],
                    fields: [
                        { key: 'title', label: 'Tiêu đề' },
                        { key: 'text', label: 'Nội dung', multiline: true },
                        { key: 'translation', label: 'Bản dịch', multiline: true },
                    ],
                    values: { title: p.title, text: p.text, translation: p.translation },
                    canApprove: true,
                    send: (action, edits) => api(`/passages/${p.id}/${action}`, { method: 'POST', body: edits ?? {} }),
                };
            });
        case 'talk':
            return (await api<TalkRow[]>('/talk?status=pending&limit=20')).map<ReviewItem>(c => ({
                key: `talk:${c.id}`,
                type,
                id: c.id,
                title: c.phrase,
                subtitle: c.translation_hint,
                badges: [c.level, c.topic],
                blocks: [
                    { label: 'Câu chêm', text: c.scenario, main: true },
                    { label: 'Tình huống', text: c.situation_prompt, muted: true },
                    { label: 'Câu mẫu', text: c.situation_model },
                ],
                notes: [],
                fields: [
                    { key: 'phrase', label: 'Cụm' },
                    { key: 'scenario', label: 'Câu chêm' },
                    { key: 'translation_hint', label: 'Nghĩa' },
                    { key: 'situation_prompt', label: 'Tình huống' },
                    { key: 'situation_model', label: 'Câu mẫu' },
                ],
                values: { phrase: c.phrase, scenario: c.scenario, translation_hint: c.translation_hint, situation_prompt: c.situation_prompt, situation_model: c.situation_model },
                canApprove: true,
                send: (action, edits) => api(`/talk/${c.id}/${action}`, { method: 'POST', body: edits ?? {} }),
            }));
    }
}

/**
 * "Tất cả": the kinds take turns (one of each, then again), so an editor does
 * not review 20 quotes in a row. Order inside a kind is kept.
 */
export function interleave<T extends { type: string }>(lists: T[][]): T[] {
    const out: T[] = [];
    const longest = Math.max(0, ...lists.map(l => l.length));
    for (let i = 0; i < longest; i++) for (const l of lists) if (i < l.length) out.push(l[i]);
    return out;
}

/** Rough time to clear the queue, from how long one item takes this editor. */
export function minutesLeft(items: number, secondsPerItem: number): number {
    return Math.max(1, Math.round((items * secondsPerItem) / 60));
}

export const REVIEW_TYPES: ReviewType[] = ['drafts', 'variants', 'quotes', 'passages', 'talk'];
