'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Check, PenLine } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { getCard, useContentVersion } from '../lib/content/repository';
import { wordsAt } from '../lib/journey/steps';
import SentenceBox from '../components/SentenceBox';

/**
 * "Một câu hôm nay" (lib/journey/outside.ts): one or two sentences about
 * the learner's own day with a word they are learning. The app checks it
 * kindly; the sentence is kept as "Câu của bạn" and shows on the card.
 */
export default function JournalPage() {
    const version = useContentVersion();
    const journeys = useLexicaStore((s) => s.journeys);
    const mySentences = useLexicaStore((s) => s.mySentences);
    const setMySentence = useLexicaStore((s) => s.setMySentence);
    const [picked, setPicked] = useState<string | null>(null);
    const [saved, setSaved] = useState<string[]>([]);
    const [startOfToday] = useState(() => new Date().setHours(0, 0, 0, 0));

    // Today's words first, then the most recent remembered and understood ones.
    const words = useMemo(() => {
        void version;
        const today = Object.keys(journeys).filter((id) => journeys[id].understoodAt >= startOfToday);
        const seen = new Set<string>();
        return [...today, ...wordsAt(journeys, 'nho'), ...wordsAt(journeys, 'gap'), ...wordsAt(journeys, 'hieu')].filter((id) => {
            const w = getCard(id)?.word.toLowerCase();
            if (!w || seen.has(w)) return false;
            seen.add(w);
            return true;
        }).slice(0, 8);
    }, [journeys, startOfToday, version]);

    const current = picked ?? words.find((id) => !saved.includes(id)) ?? null;
    const card = current ? getCard(current) : undefined;

    return (
        <div className="min-h-screen bg-bg px-4 py-8">
            <div className="max-w-2xl mx-auto space-y-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="text-muted hover:text-accent text-sm">
                        ← Học
                    </Link>
                    <p className="text-ink font-bold">Một câu hôm nay</p>
                    <span className="w-10" />
                </div>
                {words.length === 0 ? (
                    <p className="text-sm text-muted">Học vài từ trước đã, rồi quay lại viết về ngày của bạn bằng chúng.</p>
                ) : (
                    <section className="rounded-2xl border border-line bg-surface p-4 space-y-3">
                        <p className="flex items-center gap-2 font-semibold text-ink">
                            <PenLine className="w-4 h-4 text-accent" /> Viết về ngày của bạn
                        </p>
                        <p className="text-sm text-muted">Một câu thật về hôm nay, có một từ bạn đang học. Câu về chính mình nhớ lâu hơn mọi câu mẫu.</p>
                        <div className="flex flex-wrap gap-1.5" role="list" aria-label="Chọn từ">
                            {words.map((id) => (
                                <button
                                    key={id}
                                    onClick={() => setPicked(id)}
                                    className={`h-9 px-3 rounded-full border text-sm lowercase ${id === current ? 'border-accent bg-accent/10 text-ink' : 'border-line text-ink-2 hover:border-line-strong'}`}
                                >
                                    {saved.includes(id) && <Check className="inline w-3.5 h-3.5 mr-1 text-accent" />}
                                    {getCard(id)?.word}
                                </button>
                            ))}
                        </div>
                        {card && (
                            <div key={card.id} className="space-y-2">
                                <p className="text-sm text-ink-2">
                                    <b className="text-ink lowercase">{card.word}</b> · {card.translationHint}
                                </p>
                                {mySentences[card.id] && <p className="text-xs text-muted">Câu cũ của bạn: “{mySentences[card.id].text}”. Lưu câu mới sẽ thay nó.</p>}
                                <SentenceBox
                                    word={card.word.toLowerCase()}
                                    meaning={card.translationHint}
                                    placeholder={`Hôm nay mình… (dùng “${card.word.toLowerCase()}”)`}
                                    saveLabel="Lưu làm câu của bạn"
                                    onSave={(sentence) => {
                                        setMySentence(card.id, sentence, 'written');
                                        setSaved((s) => [...s, card.id]);
                                        setPicked(null);
                                    }}
                                />
                            </div>
                        )}
                        {saved.length > 0 && <p className="text-sm text-accent">Đã lưu {saved.length} câu. Khi ôn, thẻ sẽ hiện câu của bạn.</p>}
                    </section>
                )}
            </div>
        </div>
    );
}
