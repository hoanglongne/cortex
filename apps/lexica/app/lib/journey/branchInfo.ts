/**
 * What Chứng chỉ and Giao tiếp each mean, side by side, so the choice is
 * informed (issue #72, docs/ECOSYSTEM_STRATEGY.md section 4). Words are
 * deliberately promise-free: no band, no "chắc chắn".
 */
import { TRACK_ROWS, TRACK_SWITCH_NOTE } from '@cortex/brand';
import type { Branch } from './path';

export const BRANCH_ROWS = TRACK_ROWS;

/** Reassurance shown wherever the branch can be changed. */
export const BRANCH_SWITCH_NOTE = TRACK_SWITCH_NOTE;

/** One line about a branch, for headers and the class page. */
export const BRANCH_PROMISE: Record<Branch, string> = {
    cert: 'Luyện đúng kiểu bài thi. Không hứa band.',
    talk: 'Luyện để dùng được ngay, không có điểm thi.',
};
