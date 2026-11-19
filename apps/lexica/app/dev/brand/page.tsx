'use client';

import { useState } from 'react';
import TopicIcon from '../../components/brand/TopicIcon';
import { Blob, Bolt, Bubble, Burst, Check, Cloud, Confetti, Crown, DoodleArrow, DotGrid, Flame, Heart, Pencil, PeekEyes, Rainbow, Ribbon, ScribbleCircle, Smiley, Sparkle, Speaker, Squiggle, Stamp, Star, Sticker, Tape, Trophy } from '../../components/brand/Decor';
import { TOPIC_BLOCK, tiltOf } from '../../lib/brand';
import { Button, Card, Chip, EmptyState, Eyebrow, Option, SectionTitle, Stat, Tag } from '../../components/ui';
import { TOPICS } from '../../lib/engagement/collection';

/** Direction B tokens for both themes (docs/LEXICA_DESIGN_B.md §Tokens). */
const THEMES = {
    dark: { bg: '#101012', surface: '#1B1B1F', edge: '#2C2C33', ink: '#F4F2EA', muted: '#9C9AA3', outline: '#000000' },
    light: { bg: '#FBF6EA', surface: '#FFFFFF', edge: '#16150F', ink: '#16150F', muted: '#6A665B', outline: '#16150F' },
} as const;

/** The brand sheet: every token, asset and base component of direction B on one page, in both themes. */
export default function BrandPage() {
    const [mode, setMode] = useState<'dark' | 'light'>('dark');
    const t = THEMES[mode];
    const hard = { border: `3px solid ${t.outline}`, boxShadow: `5px 5px 0 ${t.outline}` };
    const soft = mode === 'dark' ? { background: t.surface, border: `2px solid ${t.edge}` } : { background: t.surface, border: `2px solid ${t.edge}`, boxShadow: `3px 3px 0 ${t.edge}` };
    return (
        <main data-testid="brand" style={{ background: t.bg, color: t.ink, fontFamily: "'Bricolage Grotesque', var(--font-sans)" }} className="min-h-screen w-full p-6">
            {/* eslint-disable-next-line @next/next/no-page-custom-font */}
            <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&display=swap&subset=vietnamese" rel="stylesheet" />
            <div className="mx-auto max-w-5xl space-y-10">
                <header className="flex items-center justify-between">
                    <h1 className="text-4xl font-extrabold tracking-tight">Lexica · Hướng B</h1>
                    <div className="flex gap-2">
                        {(['dark', 'light'] as const).map((m) => (
                            <button key={m} onClick={() => setMode(m)} className="rounded-xl px-4 py-2 font-bold" style={mode === m ? { background: '#C6F432', color: '#16150F', ...hard, boxShadow: `3px 3px 0 ${t.outline}` } : soft}>
                                {m === 'dark' ? 'Tối' : 'Sáng'}
                            </button>
                        ))}
                    </div>
                </header>

                <section>
                    <h2 className="mb-3 text-xl font-extrabold">Màu chủ đề và biểu tượng</h2>
                    <div className="grid grid-cols-4 gap-4">
                        {TOPICS.map((tp, i) => (
                            <div key={tp.id} className="flex aspect-[3/4] flex-col justify-between rounded-[20px] p-4 text-[#16150F]" style={{ background: TOPIC_BLOCK[tp.id], ...hard, transform: `rotate(${tiltOf(i) / 2}deg)` }}>
                                <span className="font-mono text-[11px] font-bold uppercase tracking-wider">{tp.label}</span>
                                <TopicIcon topic={tp.id} className="h-14 w-14" />
                                <span className="font-mono text-[11px]">{TOPIC_BLOCK[tp.id]}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="mb-3 text-xl font-extrabold">Trang trí</h2>
                    <div className="flex flex-wrap items-center gap-8">
                        <Burst className="h-40 w-40"><b className="text-4xl font-extrabold">+14</b><span className="text-xs font-bold">bước tiến</span></Burst>
                        <Blob className="h-32 w-32" />
                        <Sparkle className="h-10 w-10" color="#C6F432" />
                        <Squiggle className="h-4 w-32" color="#FF7BA0" />
                        <DoodleArrow className="h-14 w-20" color={t.ink} />
                        <Flame className="h-10 w-10" />
                        <DotGrid className="h-20 w-20" color={t.muted} />
                    </div>
                </section>

                <section>
                    <h2 className="mb-3 text-xl font-extrabold">Trang trí, đợt 2</h2>
                    <div className="grid grid-cols-6 items-center justify-items-center gap-y-8 gap-x-4">
                        <Star />
                        <Heart />
                        <Bolt />
                        <Crown />
                        <Check />
                        <Smiley />
                        <Bubble>Wow!</Bubble>
                        <Cloud />
                        <Rainbow />
                        <Trophy />
                        <Speaker />
                        <Pencil />
                        <Stamp>Đã thuộc</Stamp>
                        <Ribbon>Đủ bộ!</Ribbon>
                        <Tape />
                        <Confetti />
                        <div className="relative flex h-16 w-32 items-center justify-center font-extrabold"><ScribbleCircle className="absolute inset-0 h-full w-full" />feasible</div>
                        <PeekEyes />
                    </div>
                </section>

                <section>
                    <h2 className="mb-3 text-xl font-extrabold">Ghép thử</h2>
                    <div className="grid grid-cols-3 gap-6">
                        <div className="relative rounded-[20px] p-5 pt-8" style={{ background: t.surface, ...hard }}>
                            <Tape className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 -rotate-3" color="#F2C230" />
                            <p className="font-mono text-[11px] font-bold uppercase tracking-wider" style={{ color: t.muted }}>Chưa có từ nào</p>
                            <p className="mt-1 text-lg font-extrabold">Lật thẻ đầu tiên nào!</p>
                            <div className="mt-3 flex items-end justify-between"><Cloud className="h-10 w-16" /><PeekEyes className="h-8 w-14" /></div>
                        </div>
                        <div className="relative flex flex-col items-center rounded-[20px] p-5" style={{ background: '#A98BFF', color: '#16150F', ...hard }}>
                            <Crown className="absolute -top-5 h-9 w-12" />
                            <Trophy className="h-16 w-16" />
                            <p className="mt-2 text-lg font-extrabold whitespace-nowrap">Ngày 30 xong!</p>
                            <Confetti className="absolute bottom-2 right-2 h-10 w-14" />
                        </div>
                        <div className="relative rounded-[20px] p-5" style={{ background: t.surface, ...hard }}>
                            <Stamp className="absolute -right-3 -top-4 h-20 w-20">Đã thuộc</Stamp>
                            <p className="text-3xl font-extrabold">abundant</p>
                            <Squiggle className="mt-1 h-3 w-28" color="#FF7BA0" />
                            <p className="mt-3 text-sm" style={{ color: t.muted }}>dồi dào, nhiều</p>
                            <div className="mt-3 flex gap-2"><Star className="h-7 w-7" /><Star className="h-7 w-7" /><Star className="h-7 w-7" color={mode === 'dark' ? '#2C2C33' : '#E7E1D2'} /></div>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="mb-3 text-xl font-extrabold">Sticker</h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <Sticker color="#F2C230"><Flame className="h-4 w-4" /> 6 ngày</Sticker>
                        <Sticker color="#C6F432" tilt={-4}>x4 liền!</Sticker>
                        <Sticker color="#3FD0C9">3/3 nhiệm vụ</Sticker>
                        <Sticker color="#FF7BA0" tilt={3}>Mới</Sticker>
                        <Sticker color="#FFFFFF">vnexpress.net</Sticker>
                    </div>
                </section>

                <section>
                    <h2 className="mb-3 text-xl font-extrabold">Nút, ô, lựa chọn</h2>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between rounded-[18px] px-5 py-4 text-lg font-extrabold text-[#16150F]" style={{ background: '#C6F432', ...hard }}>Mở phiên hôm nay <span className="font-mono text-sm font-medium">8 phút →</span></div>
                            <div className="flex gap-3">
                                <div className="rounded-2xl px-4 py-3 font-bold" style={soft}>Phụ</div>
                                <div className="rounded-2xl px-4 py-3 font-bold text-[#16150F]" style={{ background: '#C6F432', border: `2px solid ${t.outline}`, boxShadow: `3px 3px 0 ${t.outline}` }}>Đang chọn</div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {[['12', 'chờ ôn'], ['128', 'đã hiểu'], ['9', 'đã dùng']].map(([n, l], i) => (
                                    <div key={l} className="rounded-2xl p-3" style={i === 0 ? { background: '#C6F432', color: '#16150F', border: `2px solid ${t.outline}`, boxShadow: `3px 3px 0 ${t.outline}` } : soft}>
                                        <b className="block text-2xl font-extrabold">{n}</b>
                                        <span className="text-xs" style={{ color: i === 0 ? '#16150F' : t.muted }}>{l}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 content-start gap-3">
                            {['thực hiện được', 'nhìn thấy được', 'chịu đựng được', 'thay đổi được'].map((o, i) => (
                                <div key={o} className="rounded-2xl px-4 py-3 font-bold whitespace-nowrap" style={i === 0 ? { background: '#C6F432', color: '#16150F', border: `2px solid ${t.outline}`, boxShadow: `4px 4px 0 ${t.outline}` } : soft}>
                                    {o}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section data-testid="ui-kit">
                    <h2 className="mb-1 text-xl font-extrabold">Bộ component trong app</h2>
                    <p className="mb-3 text-sm" style={{ color: t.muted }}>Từ components/ui, theo nền đang chọn của app (Cài đặt → Giao diện), không theo nút ở đầu trang.</p>
                    <div className="grid grid-cols-2 gap-6 rounded-[22px] bg-bg p-5 text-ink">
                        <div className="space-y-3">
                            <SectionTitle hint="8 phút">Hôm nay</SectionTitle>
                            <Button size="lg" className="w-full">Mở phiên hôm nay</Button>
                            <div className="flex gap-2"><Button tone="secondary">Để sau</Button><Button tone="danger" size="sm">Xoá</Button></div>
                            <div className="flex gap-2"><Chip on>Vừa</Chip><Chip>Nhẹ</Chip><Chip>Nhiều</Chip></div>
                            <div className="grid grid-cols-3 gap-2"><Stat value={12} label="chờ ôn" on /><Stat value={128} label="đã hiểu" /><Stat value={9} label="đã dùng" /></div>
                            <div className="flex gap-2"><Tag color="#F2C230">6 ngày</Tag><Tag>x4 liền!</Tag></div>
                        </div>
                        <div className="space-y-3">
                            <Card className="p-4"><Eyebrow>Ô mềm</Eyebrow><p className="font-bold">Nội dung thường</p></Card>
                            <Card variant="hard" color={TOPIC_BLOCK.money} className="p-4"><Eyebrow className="!text-[var(--on-block)]">Khối cứng</Eyebrow><p className="font-extrabold">Thứ quan trọng nhất màn</p></Card>
                            <div className="grid grid-cols-2 gap-2"><Option state="right">thực hiện được</Option><Option>nhìn thấy được</Option><Option state="wrong">chịu đựng được</Option><Option state="faded">thay đổi được</Option></div>
                            <EmptyState title="Chưa có từ nào" text="Lật thẻ đầu tiên nào!" />
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="mb-3 text-xl font-extrabold">Chữ</h2>
                    <p className="text-6xl font-extrabold tracking-tight">3 thẻ mới đang chờ <span style={{ background: '#C6F432', color: '#16150F', padding: '0 8px', borderRadius: 10 }}>mở</span>.</p>
                    <p className="mt-2 text-xl font-bold">Tiêu đề phụ · Bricolage Grotesque 700</p>
                    <p className="mt-1" style={{ color: t.muted }}>Chữ thường · Bricolage Grotesque 500 · nhãn dùng JetBrains Mono in hoa</p>
                </section>
            </div>
        </main>
    );
}
