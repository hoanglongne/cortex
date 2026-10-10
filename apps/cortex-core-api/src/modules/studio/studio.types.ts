export const LEVELS = [
  'beginner',
  'intermediate',
  'advanced',
  'expert',
] as const;
export type Level = (typeof LEVELS)[number];

export const ARCHETYPES = ['casual', 'tech', 'business', 'student'] as const;
export type Archetype = (typeof ARCHETYPES)[number];

export type TrendStatus =
  | 'new'
  | 'queued'
  | 'generated'
  | 'ignored'
  | 'blocked';
export type DraftStatus =
  | 'pending'
  | 'rejected_auto'
  | 'approved'
  | 'rejected'
  | 'edited';
export type Lifecycle = 'trend' | 'evergreen' | 'retired';

export interface TrendRow {
  id: string;
  label: string;
  summary: string | null;
  url: string | null;
  source: string;
  status: TrendStatus;
  hotness: number;
  tags: string[];
  target_words: string[];
  generated_at: string | null;
  created_at: string;
}

export interface LexemeRow {
  word: string;
  ipa: string | null;
  elo: number;
  level: Level;
  in_core: boolean;
  times_used: number;
  last_used_at: string | null;
}

export interface DraftRow {
  id: string;
  trend_id: string | null;
  word: string;
  scenario: string;
  translation_hint: string;
  archetype: Archetype | null;
  tone: string | null;
  model: string;
  prompt_version: string;
  validation: ValidationReport;
  status: DraftStatus;
  reject_reason: string | null;
  card_id: string | null;
  created_at: string;
}

export interface CardRow {
  id: string;
  draft_id: string | null;
  word: string;
  ipa: string | null;
  elo: number;
  level: Level;
  scenario: string;
  translation_hint: string;
  trend_label: string | null;
  tags: string[];
  lifecycle: Lifecycle;
  revision: number;
  created_at: string;
}

export interface DropRow {
  id: string;
  title: string;
  status: 'draft' | 'published' | 'archived';
  expires_at: string | null;
  published_at: string | null;
  pack_url: string | null;
  pack_sha256: string | null;
  created_at: string;
}

export interface BlockRule {
  pattern: string;
  kind: 'word' | 'regex' | 'person' | 'topic';
}

export interface RuleResult {
  pass: boolean;
  hard: boolean;
  detail?: string;
}

export interface ValidationReport {
  ok: boolean;
  rules: Record<string, RuleResult>;
}
