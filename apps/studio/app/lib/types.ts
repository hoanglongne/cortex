export type Level = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export const LEVELS: Level[] = ['beginner', 'intermediate', 'advanced', 'expert'];
export type Lifecycle = 'trend' | 'evergreen' | 'retired';
export type TrendStatus = 'new' | 'queued' | 'generated' | 'ignored' | 'blocked';

export interface RuleResult {
    pass: boolean;
    hard: boolean;
    detail?: string;
}

export interface Trend {
    id: string;
    label: string;
    summary: string | null;
    url: string | null;
    status: TrendStatus;
    tags: string[];
    target_words: string[];
    generated_at: string | null;
    created_at: string;
}

export interface Draft {
    id: string;
    trend_id: string | null;
    trend_label: string | null;
    word: string;
    ipa: string | null;
    level: Level;
    scenario: string;
    translation_hint: string;
    archetype: string | null;
    tone: string | null;
    model: string;
    status: string;
    validation: { ok: boolean; rules: Record<string, RuleResult> };
    warnings: string[];
}

export interface Card {
    id: string;
    word: string;
    ipa: string | null;
    elo: number;
    level: Level;
    scenario: string;
    translation_hint: string;
    trend_label: string | null;
    lifecycle: Lifecycle;
    revision: number;
    created_at: string;
    drops?: string[];
}

export interface Drop {
    id: string;
    title: string;
    status: 'draft' | 'published' | 'archived';
    expires_at: string | null;
    published_at: string | null;
    pack_url: string | null;
    card_count?: number;
    cards?: Card[];
}

export interface Lexeme {
    word: string;
    ipa: string | null;
    elo: number;
    level: Level;
    in_core: boolean;
    times_used: number;
}

/** Human labels for validation rules (validator.ts in the API). */
export const RULE_LABELS: Record<string, string> = {
    length: 'Độ dài',
    single_target: 'Đúng 1 từ đích',
    in_lexicon: 'Từ có trong danh sách',
    blocklist: 'Danh sách chặn',
    dup_exact: 'Trùng câu cũ',
    dup_near: 'Gần giống câu cũ',
    word_fatigue: 'Từ vừa dùng gần đây',
    vi_ratio: 'Ít tiếng Việt',
};
