/**
 * Lexica brand, direction B ("thẻ sưu tầm"): bold flat colour blocks, thick
 * black outlines and flat black drop shadows, sticker-like labels.
 * Spec: docs/LEXICA_DESIGN_B.md. Dark is the default; light is cream paper
 * with the same outlines.
 */
import type { TopicId } from './engagement/collection';

/** One block colour per topic; text and icons on it are always near-black. */
export const TOPIC_BLOCK: Record<TopicId, string> = {
    money: '#F2C230',
    work: '#5B8DEF',
    love: '#FF7BA0',
    study: '#A98BFF',
    social: '#3FD0C9',
    food: '#FF8A4C',
    people: '#7BD389',
    life: '#B9BDC6',
};

/** Accent colours used outside topics (stickers, rewards). */
export const BRAND = {
    lime: '#C6F432',
    gold: '#F2C230',
    pink: '#FF7BA0',
    sky: '#5B8DEF',
    teal: '#3FD0C9',
    ink: '#16150F',
} as const;

/** Small fixed tilts so stacked cards and stickers look hand-placed, never random per render. */
export const TILTS = [-6, 3, -2, 5, -4, 2] as const;
export const tiltOf = (i: number) => TILTS[((i % TILTS.length) + TILTS.length) % TILTS.length];
