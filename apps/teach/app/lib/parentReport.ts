/**
 * The parents' weekly report (docs/TEACH_PLAN.md 3.2), written the way a
 * parent who knows no English would say it: how many days the child
 * studied, what they can do now with real examples, the one number, one way
 * to help at home, and the teacher's own line. Composed from the finished
 * week's numbers; the teacher reads it, adds a line and approves it
 * (sql/classroom_parents.sql). Pure, unit tested.
 */
import type { ReportContent, ReportItem } from '@cortex/classroom';
import type { LexicaWeek } from '@cortex/classroom-lexica';

/** Quick lines for the teacher's note. */
export const NOTE_CHIPS = ['Con chăm, giữ nhịp này nhé.', 'Con tiến bộ rõ trong tuần.', 'Con cần học đều hơn.', 'Con phát âm rõ hơn trước.', 'Con nên ôn lại từ cũ.'];

const list = (words: readonly string[], n: number) => words.slice(0, n);

/** "a, b và c" */
export const joinVi = (xs: readonly string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} và ${xs[xs.length - 1]}`);

type Attend = NonNullable<ReportContent['attend']>;

/** "đi học đủ 3/3 buổi trên lớp", "đi học 2/3 buổi trên lớp (1 buổi nghỉ có phép)" */
function attendPart(a: Attend): string {
    const notes = [a.late ? `${a.late} buổi đi muộn` : '', a.excused ? `${a.excused} buổi nghỉ có phép` : ''].filter(Boolean);
    if (a.came === 0) return `vắng cả ${a.held} buổi trên lớp${a.excused ? ` (${a.excused === a.held ? 'đều' : `${a.excused} buổi`} có phép)` : ''}`;
    return `đi học ${a.came === a.held ? 'đủ ' : ''}${a.came}/${a.held} buổi trên lớp${notes.length ? ` (${joinVi(notes)})` : ''}`;
}

/** Lessons missed without leave. */
const missed = (a: Attend | undefined) => (a ? a.held - a.came - (a.excused ?? 0) : 0);

function summary(days: number, lx: LexicaWeek | null, attend?: Attend): string {
    if (attend) {
        if (days === 0) return `Tuần này con ${attendPart(attend)}, ${lx?.hasData ? 'nhưng chưa mở Lexica ở nhà.' : 'chưa có số liệu tự học ở nhà.'}`;
        return `Tuần này con ${attendPart(attend)} và tự học ở nhà ${days}/7 ngày.${lexicaPart(lx)}`;
    }
    if (days === 0) return lx?.hasData ? 'Tuần này con chưa mở Lexica.' : 'Tuần này chưa có số liệu học của con.';
    return `Tuần này con học ${days}/7 ngày.${lexicaPart(lx)}`;
}

function lexicaPart(lx: LexicaWeek | null): string {
    let s = '';
    if (lx?.hasData) {
        if (lx.firstWeek) s += ` Đây là tuần đầu con học cùng lớp${lx.nho ? `; đến nay con đã nhớ ${lx.nho} từ` : ''}.`;
        else {
            const parts = [lx.nho ? `nhớ thêm ${lx.nho} từ` : '', lx.dung ? `nói rõ được ${lx.dung} từ` : ''].filter(Boolean);
            if (parts.length) s += ` Con ${joinVi(parts)}.`;
            else if (lx.hieu) s += ` Con học thêm ${lx.hieu} từ mới.`;
        }
        if (lx.hardSound) s += ` Con còn hay nhầm ${lx.hardSound.name} (như trong "${lx.hardSound.example}").`;
    }
    return s;
}

function did(lx: LexicaWeek | null): ReportItem[] {
    if (!lx?.hasData || lx.firstWeek) return [];
    const out: ReportItem[] = [];
    if (lx.saidWords.length) out.push({ text: `Con nói rõ ${lx.saidWords.length} từ của bài trên lớp, máy nghe đúng`, words: list(lx.saidWords, 5) });
    else if (lx.dung) out.push({ text: `Con nói rõ ${lx.dung} từ mới, máy nghe đúng` });
    if (lx.rememberedWords.length) out.push({ text: `Con nhớ được ${lx.rememberedWords.length} từ của bài trên lớp`, words: list(lx.rememberedWords, 5) });
    if (lx.doi) out.push({ text: `Con dùng ${lx.doi} từ trong đời thường (tin nhắn, câu nói hằng ngày)` });
    if (lx.hieu && out.length < 3) out.push({ text: `Con học ${lx.hieu} từ mới` });
    return out.slice(0, 3);
}

/** One concrete thing to do at home, the most useful first. */
function help(days: number, lx: LexicaWeek | null, attend?: Attend): string {
    const off = missed(attend);
    if (off > 0) return `Con vắng ${off} buổi trên lớp không báo trước. Nhắc con học bù từ của buổi đó trong Lexica, và báo cô/thầy khi con phải nghỉ.`;
    if (days <= 2) return 'Nhắc con mở Lexica mỗi ngày 10 phút: học đều quan trọng hơn học dồn.';
    if (lx?.overdue && lx.overdue >= 10) return `Con đang có ${lx.overdue} từ đến lúc ôn lại. Nhắc con mở phần Ôn chừng 10 phút để không quên.`;
    if (lx && lx.rememberedWords.length >= 3) return `Hỏi con nghĩa của 3 từ: ${joinVi(list(lx.rememberedWords, 3))}.`;
    if (lx?.hardSound) return `Nhờ con đọc to vài từ có ${lx.hardSound.name}, như "${lx.hardSound.example}".`;
    return 'Hỏi con tuần này học được từ nào hay, và nhờ con đặt một câu với từ đó.';
}

export function composeReport(input: { days: number; lexica: LexicaWeek | null; attend?: Attend | null; note?: string }): ReportContent {
    const days = Math.max(0, Math.min(7, Math.round(input.days)));
    const lx = input.lexica;
    const attend = input.attend && input.attend.held > 0 ? input.attend : undefined;
    const note = input.note?.trim();
    return {
        v: 1,
        days,
        summary: summary(days, lx, attend),
        did: did(lx),
        ...(attend ? { attend } : {}),
        ...(lx?.score ? { score: lx.score } : {}),
        help: help(days, lx, attend),
        ...(note ? { note } : {}),
    };
}

/** The score as a parent reads it: "1080 · IELTS từ vựng khoảng 6.0–6.5 · tăng 20 so với lần trước". */
export function scoreLine(score: NonNullable<ReportContent['score']>): string {
    const change = score.delta === undefined ? '' : score.delta > 0 ? ` · tăng ${score.delta} so với lần trước` : score.delta < 0 ? ` · giảm ${-score.delta} so với lần trước` : ' · giữ như lần trước';
    return `${score.score} · IELTS từ vựng khoảng ${score.ielts}${change}`;
}

/** One line per parent for Zalo: "Phụ huynh em An: <link>". */
export function linksMessage(rows: readonly { name: string; link: string; pin?: string }[], weekLabel: string): string {
    const head = `Báo cáo tuần ${weekLabel} của các con đã có. Phụ huynh bấm vào link của con mình để xem:`;
    return [head, ...rows.map((r) => `- Phụ huynh em ${r.name}: ${r.link}${r.pin ? ` (mã PIN ${r.pin})` : ''}`)].join('\n');
}
