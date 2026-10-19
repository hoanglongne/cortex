/**
 * "Bắt gặp" (app/spot): learned words met outside the app, kept as
 * sightings. Four ways in and out of the same record:
 *
 * - spotting: paste a text, the words in it are recorded with the sentence
 *   around them;
 * - the week's hunt: five learned words to catch this week, by text or by
 *   saying "I heard / saw it";
 * - the collection: every word caught, with the sentences it was caught in;
 * - the places map: where words turn up (messages, work, social media…).
 *
 * A sighting stays on this device and in the learner's own backup; nothing
 * goes to a class. Pure functions, unit tested.
 */
import { stepOf, type Journeys } from './steps';

export type PlaceId = 'chat' | 'work' | 'social' | 'screen' | 'read' | 'talk' | 'other';

export const PLACES: { id: PlaceId; label: string }[] = [
    { id: 'chat', label: 'Tin nhắn' },
    { id: 'work', label: 'Công việc, email' },
    { id: 'social', label: 'Mạng xã hội' },
    { id: 'screen', label: 'Phim, nhạc, video' },
    { id: 'read', label: 'Sách, báo, web' },
    { id: 'talk', label: 'Trò chuyện' },
    { id: 'other', label: 'Nơi khác' },
];

export const placeLabel = (id: PlaceId) => PLACES.find((p) => p.id === id)?.label ?? 'Nơi khác';

export interface Sighting {
    cardId: string;
    /** ms */
    at: number;
    place: PlaceId;
    /** The sentence it was met in, when it came from a pasted text. */
    snippet?: string;
}

/** Sightings kept, newest first; older ones drop off. */
export const MAX_SIGHTINGS = 300;
const SNIPPET_MAX = 160;

/** The sentence around [start, end), trimmed to about SNIPPET_MAX characters with the word in it. */
export function snippetAround(text: string, start: number, end: number): string {
    const before = text.slice(0, start);
    const after = text.slice(end);
    const from = Math.max(before.search(/[^.!?\n]*$/), 0);
    const stop = after.search(/[.!?\n]/);
    let s = text.slice(from, stop === -1 ? text.length : end + stop + 1).replace(/\s+/g, ' ').trim();
    if (s.length > SNIPPET_MAX) {
        const word = text.slice(start, end);
        const at = s.indexOf(word);
        const left = Math.max(0, at - Math.floor((SNIPPET_MAX - word.length) / 2));
        s = `${left > 0 ? '…' : ''}${s.slice(left, left + SNIPPET_MAX).trim()}…`;
    }
    return s;
}

/** New sightings in front; one per card per text; capped. */
export function addSightings(list: readonly Sighting[], add: readonly Sighting[]): Sighting[] {
    const seen = new Set<string>();
    const fresh = add.filter((s) => !seen.has(s.cardId) && seen.add(s.cardId));
    return [...fresh, ...list].slice(0, MAX_SIGHTINGS);
}

export interface Collected {
    cardId: string;
    count: number;
    last: number;
    places: PlaceId[];
    snippets: string[];
}

/** The collection: one entry per card, most recently caught first. `idOf` maps a card to its word's first card. */
export function collection(list: readonly Sighting[], idOf: (cardId: string) => string = (id) => id): Collected[] {
    const by = new Map<string, Collected>();
    for (const s of list) {
        const id = idOf(s.cardId);
        const c = by.get(id) ?? { cardId: id, count: 0, last: 0, places: [], snippets: [] };
        c.count++;
        c.last = Math.max(c.last, s.at);
        if (!c.places.includes(s.place)) c.places.push(s.place);
        if (s.snippet && !c.snippets.includes(s.snippet) && c.snippets.length < 3) c.snippets.push(s.snippet);
        by.set(id, c);
    }
    return [...by.values()].sort((a, b) => b.last - a.last);
}

/** Where words turn up: every place, how many sightings, how many words. Most first. */
export function placeMap(list: readonly Sighting[], idOf: (cardId: string) => string = (id) => id): { place: PlaceId; sightings: number; words: number }[] {
    return PLACES.map(({ id }) => {
        const here = list.filter((s) => s.place === id);
        return { place: id, sightings: here.length, words: new Set(here.map((s) => idOf(s.cardId))).size };
    }).sort((a, b) => b.sightings - a.sightings);
}

// ---------------------------------------------------------------- the hunt

export interface Hunt {
    /** Local date of the Monday the hunt's week starts. */
    week: string;
    cardIds: string[];
}

export const HUNT_SIZE = 5;

/** The Monday of the week holding `date` (YYYY-MM-DD, local). */
export function weekOf(date: string): string {
    const [y, m, d] = date.split('-').map(Number);
    const day = new Date(y, m - 1, d, 12);
    const back = (day.getDay() + 6) % 7;
    const monday = new Date(y, m - 1, d - back, 12);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}`;
}

/**
 * Five words worth catching this week: remembered but not met yet first
 * (catching them moves them to Gặp), then other learned words not caught
 * before; one card per word. `seed` varies the choice between weeks.
 */
export function pickHunt(journeys: Journeys, wordOf: (cardId: string) => string | undefined, caught: (cardId: string) => boolean, seed: number): string[] {
    const ids = Object.keys(journeys).sort();
    const rank = (id: string) => {
        const step = stepOf(journeys[id]);
        if (step === 'nho') return 0;
        if (!caught(id)) return step === 'hieu' ? 2 : 1;
        return 3;
    };
    const order = ids
        .map((id, i) => ({ id, r: rank(id), k: (i * 7919 + seed * 104729) % 1000003 }))
        .sort((a, b) => a.r - b.r || a.k - b.k);
    const words = new Set<string>();
    const out: string[] = [];
    for (const { id } of order) {
        const w = wordOf(id);
        if (!w || words.has(w)) continue;
        words.add(w);
        out.push(id);
        if (out.length === HUNT_SIZE) break;
    }
    return out;
}

/** Hunt words caught since the week began (a sighting of any card of the same word counts). */
export function huntCaught(hunt: Hunt, list: readonly Sighting[], idOf: (cardId: string) => string = (id) => id): Set<string> {
    const [y, m, d] = hunt.week.split('-').map(Number);
    const since = new Date(y, m - 1, d).getTime();
    const got = new Set(list.filter((s) => s.at >= since).map((s) => idOf(s.cardId)));
    return new Set(hunt.cardIds.filter((id) => got.has(idOf(id))));
}
