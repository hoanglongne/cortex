/**
 * "Đấu trường từ vựng" (docs/TEACH_PLAN.md, section 4): what the arena calls
 * return (sql/classroom_arena.sql), and the clock both screens share. The
 * server keeps the answers and the time; these only describe what it shows.
 */

export type ArenaState = 'lobby' | 'question' | 'reveal' | 'finished';

/** What a teacher sends: a prompt, 2–4 options, the right one. */
export interface ArenaQuestionInput {
    card_id?: string;
    /** meaning: a word, pick its meaning; word: a meaning, pick the word. */
    kind: 'meaning' | 'word';
    prompt: string;
    options: string[];
    answer: number;
}

export type ArenaMode = 'classic' | 'team';

export interface ArenaPlayer {
    user_id: string;
    name: string;
    score: number;
    /** 1 for the leader; ties share a rank. */
    rank: number;
    /** Team mode: 1..4. */
    team?: number;
}

/** A team's standing: its members' average score. */
export interface ArenaTeamScore {
    team: number;
    members: number;
    score: number;
    rank: number;
}

/** One student's game, for the teacher at the end. */
export interface ArenaStat {
    user_id: string;
    name: string;
    answered: number;
    correct: number;
    avg_ms: number | null;
    /** Wrong answers given in under 1.5 seconds. */
    fast_wrong: number;
}

/** A student's answers in a finished room (arena_my_results), for Lexica's review. */
export interface ArenaResult {
    room_id: string;
    seconds: number;
    finished_at: string;
    answers: { card_id: string; correct: boolean; ms: number }[];
}

/** Team names by number, each the colour of the matching answer tile (arena-1..4). */
export const ARENA_TEAMS = ['', 'Đội Xanh lá', 'Đội Cam', 'Đội Xanh dương', 'Đội Vàng'] as const;

/** The projector's view (arena_host_state). */
export interface ArenaHost {
    id: string;
    class_id: string;
    code: string;
    mode: ArenaMode;
    /** Team mode: how many teams (2–4); 0 otherwise. */
    teams: number;
    seconds: number;
    hide_names: boolean;
    state: ArenaState;
    q_index: number;
    q_opened_at: string | null;
    /** The server's time when it answered: for the shared clock. */
    now: string;
    total: number;
    players: ArenaPlayer[];
    question?: {
        idx: number;
        card_id?: string;
        kind: string;
        prompt: string;
        options: string[];
        /** Only once locked. */
        answer?: number;
        answered: number;
        /** How many chose each option, once locked. */
        counts?: number[];
    };
    /** At the end: each question's share of right answers. */
    summary?: { idx: number; card_id?: string; prompt: string; right: string; answered: number; correct: number }[];
    /** Team mode. */
    team_scores?: ArenaTeamScore[];
    /** At the end: each student's game. */
    stats?: ArenaStat[];
}

/** A player's phone (arena_state). */
export interface ArenaPlayerView {
    id: string;
    state: ArenaState;
    q_index: number;
    seconds: number;
    q_opened_at?: string;
    now: string;
    total: number;
    class: string;
    name: string;
    score: number;
    streak: number;
    rank: number;
    players: number;
    mode: ArenaMode;
    /** Team mode: this player's team, its score and rank, and how many teams. */
    team?: number;
    team_score?: number;
    team_rank?: number;
    teams?: number;
    question?: { idx: number; kind: string; prompt: string; options: string[]; answer?: number };
    /** This player's answer to the current question; right or wrong only once locked. */
    mine?: { choice: number; correct?: boolean; points?: number };
    /** At the end. */
    top?: { name: string; score: number; rank: number }[];
}

export interface ArenaRoomOpen {
    id: string;
    code: string;
    class: string;
    state: ArenaState;
}

/** The Realtime channel of a room: signals only ("state changed", "someone joined or answered"). */
export const arenaChannel = (roomId: string) => `arena:${roomId}`;

/**
 * Milliseconds left on the open question, on this device's clock: the
 * server's `now` and `q_opened_at` give the offset, so a phone whose clock is
 * off still counts down with everyone else. `receivedAt`: when this device got
 * the answer that carried `now`.
 */
export function timeLeft(v: { seconds: number; q_opened_at?: string | null; now: string }, receivedAt: number, at: number): number {
    if (!v.q_opened_at) return 0;
    const offset = Date.parse(v.now) - receivedAt; // server minus device
    const elapsed = at + offset - Date.parse(v.q_opened_at);
    return Math.max(0, Math.min(v.seconds * 1000, v.seconds * 1000 - elapsed));
}

/** The four answer colours and shapes, the same on the projector and the phone. */
export const ARENA_SHAPES = ['▲', '◆', '●', '■'] as const;
