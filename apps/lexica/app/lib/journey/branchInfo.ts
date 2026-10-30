/**
 * What Chứng chỉ and Giao tiếp each mean, side by side, so the choice is
 * informed (issue #72, docs/ECOSYSTEM_STRATEGY.md section 4). Words are
 * deliberately promise-free: no band, no "chắc chắn".
 */
import type { Branch } from './path';

export interface BranchRow {
    label: string;
    cert: string;
    talk: string;
}

export const BRANCH_ROWS: BranchRow[] = [
    { label: 'Học để', cert: 'Thi IELTS', talk: 'Nói được ngoài đời' },
    { label: 'Nội dung', cert: 'Từ học thuật, đọc, viết', talk: 'Cụm từ, tình huống thật' },
    { label: 'Đo bằng', cert: 'Điểm từ vựng (ước lượng)', talk: 'Số từ dùng được' },
];

/** Reassurance shown wherever the branch can be changed. */
export const BRANCH_SWITCH_NOTE = 'Đổi hướng lúc nào cũng được, tiến độ vẫn giữ.';

/** One line about a branch, for headers and the class page. */
export const BRANCH_PROMISE: Record<Branch, string> = {
    cert: 'Luyện đúng kiểu bài thi. Không hứa band.',
    talk: 'Luyện để dùng được ngay, không có điểm thi.',
};
