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
    source?: string;
    hotness?: number;
    signal_count?: number;
    source_count?: number;
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
    flags?: string[];
    metrics?: CardMetrics | null;
}

export interface CardMetrics {
    impressions: number;
    reveals: number;
    known: number;
    unknown: number;
    shares: number;
    reports: number;
    review_correct: number;
    review_wrong: number;
    dwell_ms_total: number;
    dwell_count: number;
}

export interface Source {
    id: string;
    kind: 'google_trends' | 'rss' | 'youtube' | 'manual' | 'capture';
    label: string;
    enabled: boolean;
    weight: number;
    config: { feeds?: string[]; url?: string };
    last_run_at: string | null;
    last_error: string | null;
}

export interface BlockRule {
    pattern: string;
    kind: 'word' | 'regex' | 'person' | 'topic';
    note: string | null;
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

export type CaptureSource = 'capture_threads' | 'capture_facebook' | 'capture_tiktok' | 'capture_web';

/** A post saved while browsing (extension, Android share, iOS Shortcut). */
export interface Capture {
    id: number;
    source_id: CaptureSource;
    phrase: string;
    body: string | null;
    author: string | null;
    note: string | null;
    url: string | null;
    metrics: Record<string, number> | null;
    seen_at: string;
    dismissed: boolean;
    trend?: { id: string; label: string; status: TrendStatus } | null;
}

export interface CaptureToken {
    id: string;
    name: string;
    created_at: string;
    last_used_at: string | null;
    revoked_at: string | null;
}
