/** Topics and frames for "Đoạn văn có khung" (W3, issue #105). Static: nothing here is generated per learner. */

export interface Frame {
    id: string;
    topic: string;
    /** The question to answer in one paragraph */
    prompt: string;
    /** A model paragraph in the right order, one sentence per part */
    model: [idea: string, explain: string, example: string, wrap: string];
    /** Sentence starters for each part */
    starters: { idea: string[]; explain: string[]; example: string[]; wrap: string[] };
}

export const FRAMES: Frame[] = [
    {
        id: 'language',
        topic: 'Học ngoại ngữ',
        prompt: 'Why is learning a second language useful for young people?',
        model: [
            'Learning a second language gives young people a clear advantage in today’s world.',
            'This is because it lets them communicate with more people and builds their confidence.',
            'For example, a student who speaks English can join online courses from universities abroad.',
            'Overall, a second language opens doors that remain closed to those who speak only one.',
        ],
        starters: {
            idea: ['One clear advantage of … is that', 'Many young people benefit from …'],
            explain: ['This is because', 'The reason is that'],
            example: ['For example,', 'For instance,'],
            wrap: ['Overall,', 'In conclusion,'],
        },
    },
    {
        id: 'phones',
        topic: 'Điện thoại trong lớp học',
        prompt: 'Should students be allowed to use phones in class?',
        model: [
            'Students should be allowed to use phones in class, but only for learning.',
            'The main reason is that a phone is a fast tool for looking up words and checking facts.',
            'For instance, a student can find the meaning of a new word in seconds instead of waiting for the teacher.',
            'Therefore, schools should set clear rules rather than ban phones completely.',
        ],
        starters: {
            idea: ['In my view, … should', 'There are good reasons to'],
            explain: ['The main reason is that', 'This matters because'],
            example: ['For instance,', 'Such as'],
            wrap: ['Therefore,', 'To sum up,'],
        },
    },
    {
        id: 'cities',
        topic: 'Sống ở thành phố',
        prompt: 'What is one problem of living in a big city, and what can be done about it?',
        model: [
            'One serious problem of living in a big city is heavy traffic.',
            'It wastes people’s time every day and increases air pollution.',
            'For example, many workers spend more than two hours on the road each day.',
            'As a result, cities should invest in cheap and reliable public transport.',
        ],
        starters: {
            idea: ['One serious problem of … is', 'A common difficulty is'],
            explain: ['It causes … and', 'As a consequence,'],
            example: ['For example,', 'In many cities,'],
            wrap: ['As a result,', 'Therefore,'],
        },
    },
    {
        id: 'sleep',
        topic: 'Giấc ngủ của học sinh',
        prompt: 'Why do many students not get enough sleep, and why does it matter?',
        model: [
            'Many students do not get enough sleep because of homework and screen time.',
            'Lack of sleep makes it hard to concentrate and weakens memory.',
            'For example, a tired student often forgets what the teacher said an hour earlier.',
            'In conclusion, students need a fixed bedtime to study well and stay healthy.',
        ],
        starters: {
            idea: ['Many students … because', 'A common reason for … is'],
            explain: ['This makes it hard to', 'As a result,'],
            example: ['For example,', 'For instance,'],
            wrap: ['In conclusion,', 'To sum up,'],
        },
    },
    {
        id: 'reading',
        topic: 'Đọc sách',
        prompt: 'Is reading books still important in the age of video?',
        model: [
            'Reading books is still important, even though video is easy to watch.',
            'Books train the mind to follow long ideas, while short videos rarely do.',
            'For instance, readers learn many new words without trying, simply by meeting them again and again.',
            'Overall, books and video can work together, but reading should not disappear.',
        ],
        starters: {
            idea: ['Reading is still important because', 'Although …, books'],
            explain: ['Books train', 'Unlike video,'],
            example: ['For instance,', 'For example,'],
            wrap: ['Overall,', 'In summary,'],
        },
    },
    {
        id: 'volunteer',
        topic: 'Làm tình nguyện',
        prompt: 'Why should students do volunteer work?',
        model: [
            'Students should do volunteer work because it teaches skills that school cannot.',
            'Working with others builds responsibility and shows students how their community lives.',
            'For example, a student who helps at a food bank learns to plan, to work in a team and to listen.',
            'Therefore, schools should make time for volunteering during the year.',
        ],
        starters: {
            idea: ['Students should … because', 'There are clear benefits to'],
            explain: ['Working with others', 'In this way,'],
            example: ['For example,', 'For instance,'],
            wrap: ['Therefore,', 'In conclusion,'],
        },
    },
];

/** The four parts, in order, as the learner sees them. */
export const PARTS = [
    { key: 'idea', label: 'Nêu ý', hint: 'Một câu nói thẳng ý chính của cả đoạn.' },
    { key: 'explain', label: 'Giải thích', hint: 'Vì sao ý đó đúng? Một đến hai câu.' },
    { key: 'example', label: 'Ví dụ', hint: 'Một ví dụ cụ thể: người, nơi chốn hoặc số.' },
    { key: 'wrap', label: 'Kết', hint: 'Nhắc lại ý, không thêm ý mới.' },
] as const;
export type PartKey = (typeof PARTS)[number]['key'];

/** A fixed shuffle (no randomness at render time): the model sentences in a scrambled order. */
export function scrambled(n = 4): number[] {
    return n === 4 ? [2, 0, 3, 1] : Array.from({ length: n }, (_, i) => i);
}
