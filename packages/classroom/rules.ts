/** Rules every app's classes follow the same way (unit tested in the apps that use them). */
import type { Assignment, BoardStudent } from './types';

const MESSAGES: Record<string, string> = {
    'own class': 'Đây là lớp bạn dạy, không cần vào bằng mã.',
    'not signed in': 'Bạn cần đăng nhập trước.',
    'no such class': 'Không tìm thấy lớp với mã này.',
    'no seats': 'Lớp hoặc trung tâm đã hết chỗ. Báo giáo viên của bạn nhé.',
    'not the teacher': 'Chỉ giáo viên của lớp làm được việc này.',
    'not in this class': 'Bạn không ở trong lớp này.',
    'not in this center': 'Bạn chưa thuộc trung tâm này.',
    'not a teacher': 'Tài khoản này chưa được mở quyền tạo lớp riêng.',
    'not an admin': 'Việc này cần quyền quản lý.',
    'not yourself': 'Bạn không tự gỡ mình được.',
    'invite expired': 'Lời mời này đã được dùng hoặc đã hết hạn. Xin một lời mời mới nhé.',
    'bad invite': 'Lời mời không hợp lệ.',
    'no apps': 'Chọn ít nhất một ứng dụng cho lớp.',
    'app not in class': 'Lớp này chưa bật ứng dụng đó.',
    'unknown app': 'Ứng dụng này chưa tham gia lớp học.',
    'bad payload': 'Bài giao chưa đúng dạng.',
    'no words': 'Chưa có từ nào để giao.',
    'no questions': 'Chưa chọn câu hỏi nào.',
};

export function classMessage(raw: string): string {
    const key = Object.keys(MESSAGES).find((k) => raw.includes(k));
    if (key) return MESSAGES[key];
    if (/fetch|network/i.test(raw)) return 'Không kết nối được. Thử lại khi có mạng.';
    if (/check constraint|violates/i.test(raw)) return 'Tên quá ngắn hoặc quá dài.';
    return raw;
}

const DAY_MS = 86_400_000;
const daysSince = (iso: string, now: number) => Math.floor((now - Date.parse(iso)) / DAY_MS);

/** Where a student is: new (joined, nothing yet), learning, or needs a nudge (more than 3 days quiet). */
export type StudentState = 'new' | 'active' | 'nudge';

export function studentState(s: Pick<BoardStudent, 'inactive_days' | 'joined_at'>, now = Date.now()): StudentState {
    if (s.inactive_days === null) return daysSince(s.joined_at, now) > 3 ? 'nudge' : 'new';
    return s.inactive_days > 3 ? 'nudge' : 'active';
}

export const isSlipping = (s: Pick<BoardStudent, 'inactive_days' | 'joined_at'>, now = Date.now()) => studentState(s, now) === 'nudge';

/** "3 ngày chưa học" or "Hôm nay"; someone who just joined is new, not idle. */
export function activeLabel(inactiveDays: number | null, joinedAt?: string, now = Date.now()): string {
    if (inactiveDays === null) return joinedAt && daysSince(joinedAt, now) <= 3 ? 'Mới vào lớp' : 'Chưa học';
    if (inactiveDays <= 0) return 'Hôm nay';
    if (inactiveDays === 1) return 'Hôm qua';
    return `${inactiveDays} ngày chưa học`;
}

/** Days until a due date (negative = past). */
export function daysUntil(dueOn: string, now = Date.now()): number {
    const due = Date.parse(`${dueOn}T23:59:59`);
    return Math.ceil((due - now) / DAY_MS) - 1;
}

/** A class link: the student opens it in a learning app and joins with the class code. */
export function joinLink(appUrl: string, code: string): string {
    return `${appUrl.replace(/\/+$/, '')}/join/${encodeURIComponent(code)}`;
}

export function inviteLink(teachUrl: string, token: string): string {
    return `${teachUrl.replace(/\/+$/, '')}/invite/${encodeURIComponent(token)}`;
}

/** Who an assignment is for: the one student it was given to, or the whole class. */
export function assignmentStudents<S extends Pick<BoardStudent, 'user_id'>>(a: Pick<Assignment, 'for_user'>, students: readonly S[]): S[] {
    return a.for_user ? students.filter((s) => s.user_id === a.for_user) : [...students];
}
