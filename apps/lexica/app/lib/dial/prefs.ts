/**
 * Blend preferences shared by the app and the extension
 * (docs/LEXICA_DIAL_MERID_PLAN.md, issues #160–#165).
 *
 * - N1: three intensities with a per-page cap, plus an estimate line.
 * - N2: how a swapped word shows (replace, highlight only, both).
 * - N3: a key per rule hit, for 👍/👎 feedback.
 * - N4: pages Blend never touches.
 * - N7: which language a page is in.
 *
 * Pure and import-free on purpose: extension/build.mjs transpiles this file
 * into the content script and the popup as-is.
 */

export type DialIntensity = 'light' | 'medium' | 'heavy';
export type DialMode = 'replace' | 'highlight' | 'both';

export const INTENSITY: Record<DialIntensity, { label: string; cap: number; share: number }> = {
    light: { label: 'Nhẹ', cap: 3, share: 30 },
    medium: { label: 'Vừa', cap: 8, share: 60 },
    heavy: { label: 'Nhiều', cap: 20, share: 100 },
};
export const INTENSITIES: DialIntensity[] = ['light', 'medium', 'heavy'];

export const MODE_LABEL: Record<DialMode, string> = {
    replace: 'Thay hẳn',
    highlight: 'Tô sáng',
    both: 'Cả hai',
};
export const MODES: DialMode[] = ['replace', 'highlight', 'both'];

/**
 * Words are replaced by default, for everyone (20/11/2026). Highlight-only was
 * the default for learners under 50 words, but with it a new user saw almost
 * nothing change and thought Blend did not work. It stays one tap away.
 */
export function defaultMode(_learnedWords?: number): DialMode {
    return 'replace';
}

/** Old 0–100 % level → the nearest intensity. */
export function intensityFromLevel(level: number): DialIntensity {
    return level <= 40 ? 'light' : level <= 75 ? 'medium' : 'heavy';
}

/** What a hit shows: the visible text, and the English word when it is hidden until tapped. */
export function hitText(mode: DialMode, vi: string, en: string): { text: string; hiddenEn: boolean } {
    if (mode === 'highlight') return { text: vi, hiddenEn: true };
    if (mode === 'both') return { text: `${vi} (${en})`, hiddenEn: false };
    return { text: en, hiddenEn: false };
}

/** One rule hit, for feedback: card and the Vietnamese phrase in lower case, NFC. */
export function ruleKey(cardId: string, vi: string): string {
    return `${cardId}:${vi.normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim()}`;
}

/**
 * "≈ N lượt gặp từ mỗi ngày · ≈ M từ khác nhau mỗi tuần". `pagesPerDay` and
 * `shownPerPage` are averages from the last 7 days (null while there is too
 * little to go on, then a typical reader is assumed: 5 pages a day).
 */
export function estimate(intensity: DialIntensity, pagesPerDay: number | null, shownPerPage: number | null): { perDay: number; perWeek: number; guessed: boolean } {
    const guessed = pagesPerDay === null || shownPerPage === null;
    const pages = pagesPerDay ?? 5;
    const perPage = Math.min(INTENSITY[intensity].cap, shownPerPage ?? INTENSITY[intensity].cap * 0.7);
    const perDay = Math.round(pages * perPage);
    // The same words come back often; about 40% of a week's encounters are different words.
    const perWeek = Math.round(perDay * 7 * 0.4);
    return { perDay, perWeek, guessed };
}

export function estimateLine(e: { perDay: number; perWeek: number; guessed: boolean }): string {
    return `≈ ${e.perDay} lượt gặp từ mỗi ngày · ≈ ${e.perWeek} từ khác nhau mỗi tuần${e.guessed ? ' (ước tính)' : ''}`;
}

/** Sites Blend never runs on, whatever the learner picks: money, mail, health, government, sign-in. */
export const BLOCKED_HOSTS = [
    // banks and wallets
    'vietcombank.com.vn', 'techcombank.com.vn', 'bidv.com.vn', 'vietinbank.vn', 'agribank.com.vn', 'mbbank.com.vn', 'tpb.vn', 'vpbank.com.vn',
    'acb.com.vn', 'sacombank.com.vn', 'hdbank.com.vn', 'vib.com.vn', 'shb.com.vn', 'ocb.com.vn', 'msb.com.vn', 'seabank.com.vn', 'timo.vn', 'cake.vn',
    'momo.vn', 'zalopay.vn', 'vnpay.vn', 'shopeepay.vn', 'viettelmoney.vn', 'paypal.com', 'stripe.com', 'wise.com',
    // mail
    'mail.google.com', 'outlook.live.com', 'outlook.office.com', 'mail.yahoo.com', 'proton.me', 'mail.zoho.com',
    // government and tax
    'gov.vn', 'vneid.gov.vn', 'dichvucong.gov.vn', 'thuedientu.gdt.gov.vn', 'baohiemxahoi.gov.vn',
    // health
    'medpro.vn', 'vinmec.com', 'hellobacsi.com', 'jiohealth.com', 'doctoranywhere.vn',
    // accounts
    'accounts.google.com', 'login.microsoftonline.com', 'appleid.apple.com',
];

const BLOCKED_WORDS = /(^|[.\-/])(bank|banking|ebank|ibank|login|signin|sign-in|auth|checkout|payment|pay|wallet|mail|webmail|benhvien|hospital|clinic|health)([.\-/]|$)/i;

/** Whether `host` is `site` or one of its subdomains. */
export function onSite(host: string, site: string): boolean {
    const h = host.toLowerCase().replace(/^www\./, '');
    const s = site.toLowerCase().replace(/^www\./, '');
    return h === s || h.endsWith(`.${s}`);
}

/**
 * Pages Blend never touches (issue #160): the hard list above, hosts or
 * paths that look like banking, mail, health or sign-in, and any page with a
 * password or card-number field.
 */
export function isBlocked(host: string, path = '/', signals: { password?: boolean; card?: boolean } = {}): boolean {
    if (signals.password || signals.card) return true;
    if (BLOCKED_HOSTS.some((s) => onSite(host, s))) return true;
    return BLOCKED_WORDS.test(host) || BLOCKED_WORDS.test(path);
}

const VI_MARKS = /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/gi;
const EN_WORDS = /\b(the|and|of|to|is|are|was|that|with|for|this|have|from)\b/gi;

/** The page's language from a sample of its text: Vietnamese, English or neither. */
export function pageLanguage(sample: string): 'vi' | 'en' | 'other' {
    const text = sample.slice(0, 4000);
    const letters = (text.match(/\p{L}/gu) ?? []).length;
    if (letters < 40) return 'other';
    const vi = (text.match(VI_MARKS) ?? []).length / letters;
    if (vi > 0.03) return 'vi';
    const words = (text.match(/\p{L}+/gu) ?? []).length;
    const en = (text.match(EN_WORDS) ?? []).length / Math.max(1, words);
    return en > 0.08 ? 'en' : 'other';
}
