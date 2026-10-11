import type { BlockRule, RuleResult, ValidationReport } from './studio.types';

/** Draft text checked before an editor ever sees it (spec §5.5). */
export interface DraftInput {
  word: string;
  scenario: string;
}

export interface ValidationContext {
  lexicon: ReadonlySet<string>;
  blocklist: readonly BlockRule[];
  /** Normalized scenarios already published or pending. */
  existingScenarios: ReadonlySet<string>;
  /** Published scenarios that use the same word, for near-duplicate checks. */
  sameWordScenarios: readonly string[];
  /** Words published in the last 14 days. */
  recentWords: ReadonlySet<string>;
}

export const MIN_LENGTH = 40;
export const MAX_LENGTH = 160;

export function normalize(text: string): string {
  return text.toLowerCase().normalize('NFC').replace(/\s+/g, ' ').trim();
}

/** Upper-case Latin tokens of 2+ letters: how a target word is marked in a scenario. */
export function upperTokens(scenario: string): string[] {
  return scenario
    .split(/[^\p{L}'-]+/u)
    .filter((t) => /^[A-Z][A-Z'-]*[A-Z]$/.test(t));
}

/** True when `token` is `word` or a regular inflection of it. */
export function matchesInflection(token: string, word: string): boolean {
  const t = token.toLowerCase();
  const w = word.toLowerCase();
  if (t === w) return true;
  const stem = w.endsWith('e') ? w.slice(0, -1) : w;
  const last = w[w.length - 1] ?? '';
  const forms = new Set([
    `${w}s`,
    `${w}es`,
    `${w}d`,
    `${w}ed`,
    `${stem}ing`,
    `${stem}ed`,
    `${w}${last}ed`,
    `${w}${last}ing`,
    `${w}ly`,
  ]);
  if (w.endsWith('y')) {
    const base = w.slice(0, -1);
    forms.add(`${base}ies`);
    forms.add(`${base}ied`);
    forms.add(`${base}ily`);
  }
  return forms.has(t);
}

const VI_MARK =
  /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/iu;

function blocked(text: string, rule: BlockRule): boolean {
  const t = normalize(text);
  const p = normalize(rule.pattern);
  switch (rule.kind) {
    case 'regex':
      try {
        return new RegExp(rule.pattern, 'iu').test(text);
      } catch {
        return false;
      }
    case 'word': {
      const escaped = p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`(^|[^\\p{L}])${escaped}($|[^\\p{L}])`, 'u').test(t);
    }
    default:
      return t.includes(p);
  }
}

function trigrams(text: string): Set<string> {
  const s = ` ${normalize(text)} `;
  const out = new Set<string>();
  for (let i = 0; i < s.length - 2; i++) out.add(s.slice(i, i + 3));
  return out;
}

/** Jaccard similarity of character trigrams, 0..1. */
export function similarity(a: string, b: string): number {
  const ta = trigrams(a);
  const tb = trigrams(b);
  let inter = 0;
  for (const g of ta) if (tb.has(g)) inter++;
  const union = ta.size + tb.size - inter;
  return union === 0 ? 0 : inter / union;
}

export function validateDraft(
  draft: DraftInput,
  ctx: ValidationContext,
): ValidationReport {
  const rules: Record<string, RuleResult> = {};
  const hard = (name: string, pass: boolean, detail?: string) => {
    rules[name] = { pass, hard: true, ...(detail ? { detail } : {}) };
  };
  const soft = (name: string, pass: boolean, detail?: string) => {
    rules[name] = { pass, hard: false, ...(detail ? { detail } : {}) };
  };

  const { scenario } = draft;
  const word = draft.word.toLowerCase();

  hard(
    'length',
    scenario.length >= MIN_LENGTH && scenario.length <= MAX_LENGTH,
    `${scenario.length} ký tự`,
  );

  // Short all-caps tokens (CV, KPI, OT) are acronyms, not target words.
  const tokens = upperTokens(scenario);
  const targets = tokens.filter((t) => matchesInflection(t, word));
  const others = tokens.filter(
    (t) => !matchesInflection(t, word) && t.length > 3,
  );
  hard(
    'single_target',
    targets.length === 1 && others.length === 0,
    others.length > 0
      ? `từ viết hoa thừa: ${others.join(', ')}`
      : `${targets.length} lần "${word}"`,
  );

  hard('in_lexicon', ctx.lexicon.has(word));

  const hit = ctx.blocklist.find(
    (r) => blocked(scenario, r) || blocked(draft.word, r),
  );
  hard('blocklist', !hit, hit ? `${hit.kind}: ${hit.pattern}` : undefined);

  hard('dup_exact', !ctx.existingScenarios.has(normalize(scenario)));

  const nearest = Math.max(
    0,
    ...ctx.sameWordScenarios.map((s) => similarity(s, scenario)),
  );
  soft('dup_near', nearest < 0.7, nearest.toFixed(2));

  soft('word_fatigue', !ctx.recentWords.has(word));

  const words = scenario.split(/\s+/).filter((w) => /\p{L}/u.test(w));
  const viShare =
    words.length === 0
      ? 0
      : words.filter((w) => VI_MARK.test(w)).length / words.length;
  soft('vi_ratio', viShare >= 0.35, `${Math.round(viShare * 100)}%`);

  const ok = Object.values(rules).every((r) => r.pass || !r.hard);
  return { ok, rules };
}

/** Names of failed soft rules, shown as warnings in the review inbox. */
export function warnings(report: ValidationReport): string[] {
  return Object.entries(report.rules)
    .filter(([, r]) => !r.pass && !r.hard)
    .map(([name]) => name);
}
