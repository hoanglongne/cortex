'use client';

import { useState } from 'react';
import TopicIcon from '../../components/brand/TopicIcon';
import { Blob, Burst, DoodleArrow, DotGrid, Flame, Sparkle, Squiggle, Sticker } from '../../components/brand/Decor';
import { TOPIC_BLOCK, tiltOf } from '../../lib/brand';
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
