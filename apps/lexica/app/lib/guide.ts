/**
 * Help that comes when it is useful (docs/FEEDBACK_PLAN.md, Đợt 5):
 *
 * - the first-week checklist: seven small firsts that show what Lexica can
 *   do, each ticked by what the learner actually did;
 * - one timely tip at a time on Home, when the learner's own numbers say a
 *   feature would help now.
 *
 * The page /guide ("Lexica có gì") explains everything at once. Pure,
 * unit tested.
 */

/** What the rules look at, counted from the store. */
export interface GuideFacts {
    words: number;
    /** Right recalls, any word. */
    recalls: number;
    remembered: number;
    met: number;
    spoken: number;
    sentences: number;
    sightings: number;
    pledged: boolean;
    lived: number;
    daysStudied: number;
    due: number;
    hard: number;
    /** Hunt words caught / total this week; null without a hunt. */
    hunt: { caught: number; total: number } | null;
    /** 0 Sunday … 6 Saturday. */
    weekday: number;
    /** Days since the first word was learned; null before. */
    daysSinceStart: number | null;
}

export interface ChecklistItem {
    id: string;
    title: string;
    hint: string;
    href: string;
    done: boolean;
}

export function checklist(f: GuideFacts): ChecklistItem[] {
    return [
        { id: 'learn', title: 'Học 10 từ đầu tiên', hint: 'Lật thẻ, đọc câu, chọn nghĩa đúng.', href: '/', done: f.words >= 10 },
        { id: 'review', title: 'Ôn lại một từ', hint: 'Từ đến hạn ôn nằm trong phiên Hôm nay.', href: '/review', done: f.recalls > 0 },
        { id: 'speak', title: 'Nói một từ cho máy nghe', hint: 'Máy nghe rõ là từ lên bước Dùng.', href: '/speak', done: f.spoken > 0 },
        { id: 'write', title: 'Viết một câu của bạn', hint: 'Một câu thật về hôm nay, có từ vừa học.', href: '/journal', done: f.sentences > 0 },
        { id: 'spot', title: 'Bắt gặp một từ ngoài app', hint: 'Dán đoạn bạn đọc được, hoặc săn từ của tuần.', href: '/spot', done: f.sightings > 0 || f.met > 0 },
        { id: 'pledge', title: 'Hẹn dùng một từ ngoài đời', hint: 'Cuối phiên Hôm nay, chọn một từ để thử.', href: '/', done: f.pledged || f.lived > 0 },
        { id: 'days', title: 'Học 3 ngày khác nhau', hint: 'Nhớ cần hai lần đúng cách nhau vài ngày.', href: '/', done: f.daysStudied >= 3 },
    ];
}

/** Shown for the first two weeks, until every item is done. */
export function showChecklist(f: GuideFacts, hidden: boolean): boolean {
    if (hidden) return false;
    if (f.daysSinceStart !== null && f.daysSinceStart > 14) return false;
    return checklist(f).some((i) => !i.done);
}

export interface Tip {
    id: string;
    text: string;
    href: string;
    action: string;
    /** Comes back on another day after "Để sau" (otherwise gone for good). */
    daily?: boolean;
}

/** The first tip that applies and was not put away; `dismissed` maps a tip id to the local date it was put away. */
export function nextTip(f: GuideFacts, dismissed: Record<string, string>, today: string): Tip | null {
    const tips: (Tip & { when: boolean })[] = [
        { id: 'hunt-midweek', when: !!f.hunt && f.hunt.caught < f.hunt.total && f.weekday >= 4, daily: true, text: `Tuần này bạn đã bắt được ${f.hunt?.caught ?? 0}/${f.hunt?.total ?? 0} từ cần săn. Còn vài ngày, để ý tin nhắn và video nhé.`, href: '/spot?tab=hunt', action: 'Xem từ cần săn' },
        { id: 'due', when: f.due >= 8, daily: true, text: `Có ${f.due} từ đến hạn ôn. Ôn đúng lúc là cách nhanh nhất để từ lên Nhớ.`, href: '/review', action: 'Ôn ngay' },
        { id: 'spot-first', when: f.remembered >= 3 && f.sightings === 0 && f.met === 0, text: `Bạn đã nhớ ${f.remembered} từ. Gặp lại chúng ngoài app là lúc từ thật sự thành của bạn: thử săn 5 từ trong tuần này.`, href: '/spot?tab=hunt', action: 'Bắt đầu săn' },
        { id: 'speak-first', when: f.words >= 15 && f.spoken === 0, text: 'Bạn chưa nói thử từ nào. Nói to một lần giúp nhớ lâu hơn đọc mười lần.', href: '/speak', action: 'Luyện nói' },
        { id: 'write-first', when: f.remembered >= 5 && f.sentences === 0, text: 'Một câu về ngày của bạn, có một từ vừa học, nhớ lâu hơn mọi câu mẫu.', href: '/journal', action: 'Viết một câu' },
        { id: 'hard', when: f.hard >= 5, text: `Có ${f.hard} từ bạn hay quên. Luyện riêng chúng vài phút là đủ.`, href: '/review?hard=1', action: 'Luyện từ khó' },
        { id: 'guide', when: f.daysStudied >= 2, text: 'Lexica còn Đọc, Luyện nói, Album, Lớp học… Xem một lượt để biết dùng gì khi nào.', href: '/guide', action: 'Lexica có gì' },
    ];
    const t = tips.find((x) => x.when && !(x.id in dismissed && (!x.daily || dismissed[x.id] === today)));
    if (!t) return null;
    const { when: _when, ...tip } = t;
    void _when;
    return tip;
}
