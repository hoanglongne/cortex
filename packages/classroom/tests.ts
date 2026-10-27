/**
 * Class tests (docs/TEACH_PLAN.md, T3; sql/classroom_tests.sql): what the
 * calls return. Questions are the arena's (ArenaQuestionInput); the server
 * keeps the answers until a student hands in.
 */

export type TestStatus = 'not_started' | 'started' | 'submitted';

/** A test in the teacher's list. */
export interface ClassTest {
    id: string;
    title: string;
    created_at: string;
    due_on: string | null;
    closed: boolean;
    total: number;
    submitted: number;
    /** Average right answers of those who handed in. */
    average: number | null;
}

/** A test's results for the teacher. */
export interface TestResults {
    id: string;
    title: string;
    created_at: string;
    due_on: string | null;
    closed: boolean;
    total: number;
    students: { user_id: string; name: string; status: TestStatus; correct?: number; submitted_at?: string; missed?: string[] }[];
    questions: { idx: number; card_id?: string; prompt: string; right: string; answered: number; correct: number }[];
}

/** A test in a student's list (my_tests). */
export interface MyTest {
    id: string;
    class_id: string;
    class: string;
    title: string;
    due_on?: string;
    closed: boolean;
    total: number;
    status: TestStatus;
    correct?: number;
}

/** A test opened by a student (test_take, test_submit). */
export interface TestTake {
    id: string;
    title: string;
    class: string;
    due_on?: string | null;
    closed: boolean;
    submitted: boolean;
    correct?: number | null;
    questions: { idx: number; card_id?: string; kind: string; prompt: string; options: string[]; answer?: number; choice?: number }[];
}

/** "8/10", and a word for it a student reads without feeling judged. */
export function testScoreLine(correct: number, total: number): string {
    const share = total ? correct / total : 0;
    const word = share >= 0.9 ? 'Rất tốt' : share >= 0.7 ? 'Tốt' : share >= 0.5 ? 'Khá' : 'Cần ôn thêm';
    return `${correct}/${total} · ${word}`;
}
