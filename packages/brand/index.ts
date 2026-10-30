/**
 * The shared face of Cortex (docs/CORTEX_HUB_PLAN.md): the words and numbers
 * every app and the landing say the same way. Colours and type live in
 * tokens.css; each app keeps its own accent.
 */

export type Track = 'cert' | 'talk';

export const TRACK_LABEL: Record<Track, string> = { cert: 'Chứng chỉ', talk: 'Giao tiếp' };

/** The two tracks side by side. No band, no promise. */
export const TRACK_ROWS: { label: string; cert: string; talk: string }[] = [
    { label: 'Học để', cert: 'Thi IELTS', talk: 'Nói được ngoài đời' },
    { label: 'Học gì', cert: 'Từ học thuật, đọc, viết', talk: 'Cụm từ, tình huống thật' },
    { label: 'Đo bằng', cert: 'Điểm từ vựng ước lượng', talk: 'Số từ dùng được' },
];

export const TRACK_SWITCH_NOTE = 'Đổi hướng lúc nào cũng được, tiến độ vẫn giữ.';

/** Lines said the same way everywhere. */
export const BRAND = {
    name: 'Cortex',
    tagline: 'Học xong là nhớ. Dạy xong là thấy.',
    estimateNote: 'Điểm trong app là ước lượng, không phải điểm thi thật.',
    pilotNote: 'Giá hiện là giá thử nghiệm.',
} as const;

/** Each app keeps its own accent; the dot beside its name uses it. */
export const APP_ACCENT = {
    lexica: '#C6F432',
    teach: '#2E7556',
    oratio: '#FF5A1F',
} as const;
