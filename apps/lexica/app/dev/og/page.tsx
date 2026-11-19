'use client';

import TopicIcon from '../../components/brand/TopicIcon';
import { Sparkle, Squiggle, Sticker } from '../../components/brand/Decor';
import { LexicaLogo } from '../../components/LexicaLogo';
import { TOPIC_BLOCK } from '../../lib/brand';
import type { TopicId } from '../../lib/engagement/collection';

const CARDS: { topic: TopicId; label: string; word: string; vi: string; tilt: number; x: number; y: number }[] = [
    { topic: 'money', label: 'Tiền bạc', word: 'afford', vi: 'đủ tiền mua', tilt: -9, x: 0, y: 40 },
    { topic: 'love', label: 'Hẹn hò', word: 'crush', vi: 'người mình thích', tilt: 4, x: 170, y: 0 },
    { topic: 'work', label: 'Công sở', word: 'deadline', vi: 'hạn chót', tilt: -3, x: 330, y: 60 },
];

/**
 * The share image (public/og.png), drawn with the app's own pieces so it
 * stays in direction B. Screenshot this page at 1200×630 to refresh it.
 */
export default function OgPage() {
    return (
        <div data-theme="dark" className="relative h-[630px] w-[1200px] overflow-hidden bg-[#101012] text-[#F4F2EA]" data-prose>
            <div className="absolute left-[72px] top-[96px] w-[520px]">
                <LexicaLogo className="h-[54px] w-auto text-[#F4F2EA]" />
                <h1 className="mt-10 font-display text-[64px] font-extrabold leading-[1.02] tracking-tight">
                    Học từ tiếng Anh
                    <br />
                    từ chính câu
                    <br />
                    tiếng Việt của bạn.
                </h1>
                <Squiggle className="mt-3 h-4 w-56" color="#C6F432" />
                <div className="mt-8 flex gap-3">
                    <Sticker className="!text-lg" color="#C6F432">15 phút mỗi ngày</Sticker>
                    <Sticker className="!text-lg" color="#F4F2EA" tilt={-3}>8 chủ đề đời thường</Sticker>
                </div>
            </div>

            <div className="absolute left-[640px] top-[132px] h-[420px] w-[520px]">
                {CARDS.map((c) => (
                    <div
                        key={c.word}
                        className="absolute flex h-[300px] w-[210px] flex-col justify-between rounded-[26px] border-[3px] border-black p-5 text-[#16150F] shadow-[6px_6px_0_#000]"
                        style={{ left: c.x, top: c.y, background: TOPIC_BLOCK[c.topic], transform: `rotate(${c.tilt}deg)` }}
                    >
                        <span className="whitespace-nowrap font-mono text-[13px] font-bold uppercase tracking-wider">{c.label}</span>
                        <TopicIcon topic={c.topic} className="h-16 w-16" />
                        <span>
                            <span className="block whitespace-nowrap font-display text-[38px] font-extrabold leading-none tracking-tight">{c.word}</span>
                            <span className="mt-1.5 block whitespace-nowrap text-[15px] font-bold">{c.vi}</span>
                        </span>
                    </div>
                ))}
                <Sparkle className="absolute -right-2 -top-16 h-14 w-14" color="#C6F432" />
                <Sparkle className="absolute -left-10 bottom-6 h-8 w-8" color="#F4F2EA" />
            </div>
        </div>
    );
}
