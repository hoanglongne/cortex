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
    { label: 'Mục tiêu', cert: 'Thi IELTS hoặc chứng chỉ tương tự', talk: 'Nói chuyện tự tin ở công việc, du lịch, đời thường' },
    { label: 'Bạn học', cert: 'Từ học thuật, đọc hiểu, viết, nói Part 1', talk: 'Cụm từ và câu nói thật, tình huống hằng ngày' },
    { label: 'Mỗi ngày', cert: 'Ôn, học từ, đọc bài kiểu thi, luyện nói theo Part', talk: 'Ôn, học từ, đọc đoạn ngắn, nói theo tình huống' },
    { label: 'Đo tiến bộ', cert: 'Điểm từ vựng ước lượng khoảng IELTS (chỉ là ước lượng)', talk: 'Số từ bạn dùng được và các lần bạn nói thử' },
    { label: 'Hợp với', cert: 'Có ngày thi hoặc hạn nộp điểm', talk: 'Cần dùng được tiếng Anh, chưa có kỳ thi' },
];

/** Reassurance shown wherever the branch can be changed. */
export const BRANCH_SWITCH_NOTE = 'Đổi hướng lúc nào cũng được. Từ đã học và chuỗi ngày của bạn vẫn giữ nguyên, chỉ từ mới và bài đọc theo hướng mới.';

/** One line about a branch, for headers and the class page. */
export const BRANCH_PROMISE: Record<Branch, string> = {
    cert: 'Bạn luyện đúng kiểu bài thi. App không hứa band, chỉ cho bạn thấy mình đang ở đâu.',
    talk: 'Bạn luyện để dùng được ngay. Không có điểm thi, chỉ có số từ và số lần bạn nói được.',
};
