'use client';

import Link from 'next/link';
import { BookOpen, CalendarCheck, ChevronRight, Footprints, LayoutGrid, Mic, PenLine, RotateCcw, Route, ScanSearch, School, Swords, TrendingUp, Users } from 'lucide-react';
import { STEP_HINT, STEP_LABEL, STEPS } from '../lib/journey/steps';

const GROUPS: { title: string; sub: string; items: { href: string; icon: React.ReactNode; title: string; text: string }[] }[] = [
    {
        title: 'Mỗi ngày',
        sub: 'Mười lăm phút là đủ. App tự xếp việc nào trước.',
        items: [
            { href: '/', icon: <CalendarCheck className="w-4 h-4" />, title: 'Hôm nay', text: 'Phiên học trong ngày: từ mới, từ đến hạn ôn, một chút nói và đọc. Làm hết là giữ được chuỗi ngày.' },
            { href: '/review', icon: <RotateCcw className="w-4 h-4" />, title: 'Ôn tập', text: 'Từ đến hạn hiện đúng lúc sắp quên. Nhớ lại đúng ở hai ngày cách nhau là từ lên Nhớ.' },
            { href: '/path', icon: <Route className="w-4 h-4" />, title: 'Lộ trình', text: '30 ngày có mục tiêu, có trạm dừng để xem mình đi được bao xa.' },
        ],
    },
    {
        title: 'Luyện thêm',
        sub: 'Khi có thêm thời gian, hoặc muốn luyện riêng một kỹ năng.',
        items: [
            { href: '/read', icon: <BookOpen className="w-4 h-4" />, title: 'Đọc', text: 'Đoạn văn ngắn có từ bạn đang học. Nhận ra từ trong đoạn là từ lên Gặp.' },
            { href: '/speak', icon: <Mic className="w-4 h-4" />, title: 'Luyện nói', text: 'Nghe, nói, xem máy nghe được gì. Máy nghe rõ là từ lên Dùng.' },
            { href: '/journal', icon: <PenLine className="w-4 h-4" />, title: 'Một câu hôm nay', text: 'Trả lời một câu hỏi về ngày của bạn bằng từ vừa học. Chọn độ sâu, đổi câu hỏi tuỳ ý.' },
            { href: '/review?hard=1', icon: <Swords className="w-4 h-4" />, title: 'Từ khó', text: 'Những từ bạn hay quên, luyện riêng vài phút.' },
            { href: '/', icon: <TrendingUp className="w-4 h-4" />, title: 'Drop', text: 'Bộ thẻ theo trend của tuần, chỉ mở trong vài ngày.' },
        ],
    },
    {
        title: 'Ra ngoài đời',
        sub: 'Từ chỉ thật sự là của bạn khi bạn gặp và dùng nó ngoài app.',
        items: [
            { href: '/spot', icon: <ScanSearch className="w-4 h-4" />, title: 'Bắt gặp', text: 'Dán đoạn bạn đọc được để tìm từ đã học, săn 5 từ mỗi tuần, xem bộ sưu tập và nơi bạn hay gặp từ.' },
            { href: '/', icon: <Footprints className="w-4 h-4" />, title: 'Hẹn dùng ngoài đời', text: 'Cuối phiên Hôm nay, chọn một từ để thử trong tin nhắn, email hay cuộc trò chuyện. Hôm sau app hỏi bạn dùng được chưa.' },
        ],
    },
    {
        title: 'Sưu tầm và cùng người khác',
        sub: '',
        items: [
            { href: '/album', icon: <LayoutGrid className="w-4 h-4" />, title: 'Album', text: 'Mỗi từ là một thẻ sưu tầm theo chủ đề. Ôn đúng đủ lần thì đúc được ấn bản đẹp hơn.' },
            { href: '/class', icon: <School className="w-4 h-4" />, title: 'Lớp học', text: 'Vào lớp bằng link của giáo viên, học bài được giao. Giáo viên chỉ thấy tên bạn, bốn con số Hiểu, Nhớ, Gặp, Dùng, và số lần sai theo từng nhóm âm.' },
            { href: '/buddy', icon: <Users className="w-4 h-4" />, title: 'Buddy', text: 'Học cùng một người bạn, giữ chuỗi ngày chung.' },
        ],
    },
];

/** "Lexica có gì": every part of the app on one page, in the order a learner meets them. */
export default function GuidePage() {
    return (
        <div className="min-h-screen bg-bg px-4 py-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Link href="/" className="text-muted hover:text-accent text-sm">
                        ← Học
                    </Link>
                    <p className="text-ink font-bold">Lexica có gì</p>
                    <span className="w-10" />
                </div>

                <section className="rounded-2xl border border-line bg-surface p-4">
                    <p className="font-semibold text-ink">Bốn bước của một từ</p>
                    <p className="mt-1 text-sm text-muted">Lexica chỉ đếm một thứ: mỗi từ của bạn đi tới bước nào.</p>
                    <ol className="mt-3 grid gap-2 sm:grid-cols-2">
                        {STEPS.map((step, i) => (
                            <li key={step} className="rounded-xl border border-line bg-bg p-3">
                                <p className="text-sm font-semibold text-ink">
                                    {i + 1}. {STEP_LABEL[step]}
                                </p>
                                <p className="text-sm text-muted">{STEP_HINT[step]}</p>
                            </li>
                        ))}
                    </ol>
                    <p className="mt-2 text-sm text-muted">
                        Sau bốn bước là <b className="text-ink-2">Đời</b>: bạn dùng từ thật trong tin nhắn, email hay câu nói của mình.
                    </p>
                </section>

                {GROUPS.map((g) => (
                    <section key={g.title}>
                        <p className="font-semibold text-ink">{g.title}</p>
                        {g.sub && <p className="text-sm text-muted">{g.sub}</p>}
                        <ul className="mt-2 rounded-2xl border border-line bg-surface divide-y divide-line">
                            {g.items.map((it) => (
                                <li key={it.title}>
                                    <Link href={it.href} className="flex items-start gap-3 px-4 py-3 hover:bg-surface-2/50 first:rounded-t-2xl last:rounded-b-2xl">
                                        <span className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-muted shrink-0">{it.icon}</span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-sm font-medium text-ink">{it.title}</span>
                                            <span className="block text-sm text-muted">{it.text}</span>
                                        </span>
                                        <ChevronRight className="w-4 h-4 mt-2 text-subtle shrink-0" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </div>
        </div>
    );
}
