'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Check, PenLine, Shuffle } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { getCard, useContentVersion } from '../lib/content/repository';
import { wordsAt } from '../lib/journey/steps';
import { TOPICS, topicOf, type TopicId } from '../lib/engagement/collection';
import { localDate } from '../lib/engagement/ghost';
import { DEPTH_LABEL, pickPrompt, type Depth } from '../lib/journey/prompts';
import { JOURNAL_PROMPTS } from '../data/journalPrompts';
import SentenceBox from '../components/SentenceBox';

/** A stable number in [0, 1) for a text: the day's question for a word, same on every render. */
const seedOf = (text: string) => (text.split('').reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7) % 1000) / 1000;

/**
 * "Một câu hôm nay" (lib/journey/outside.ts): one or two sentences about
 * the learner's own day with a word they are learning. The app checks it
 * kindly; the sentence is kept as "Câu của bạn" and shows on the card.
 * A question to answer (lib/journey/prompts.ts) comes from the word's topic
 * at the depth the learner picks; "Đổi câu" draws another.
 */
export default function JournalPage() {
    const version = useContentVersion();
    const journeys = useLexicaStore((s) => s.journeys);
    const mySentences = useLexicaStore((s) => s.mySentences);
    const setMySentence = useLexicaStore((s) => s.setMySentence);
    const [picked, setPicked] = useState<string | null>(null);
    const [saved, setSaved] = useState<string[]>([]);
    const [startOfToday] = useState(() => new Date().setHours(0, 0, 0, 0));
    const [depth, setDepth] = useState<Depth>(1);
    const [topicPick, setTopicPick] = useState<TopicId | ''>('');
    const [seen, setSeen] = useState<string[]>([]);
    const [roll, setRoll] = useState<number | null>(null);

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
    const topic = topicPick || (card ? topicOf(card) : 'life');
    const prompt = card ? pickPrompt(JOURNAL_PROMPTS, { topic, depth, exclude: seen, rand: roll ?? seedOf(`${localDate()}${card.id}${depth}`) }) : null;
    const another = () => {
        if (prompt) setSeen((s) => [...s, prompt.id]);
        setRoll(Math.random());
    };

    return (
        <div className="min-h-screen bg-bg px-4 py-6">
            <div className="max-w-2xl mx-auto space-y-5">
                <header className="flex items-center justify-between">
                    <Link href="/practice" className="text-muted hover:text-accent text-sm">
                        ← Luyện
                    </Link>
                    <h1 className="text-ink font-bold">Một câu hôm nay</h1>
                    <span className="w-12 text-right text-xs text-muted">{saved.length > 0 ? `${saved.length} câu` : ''}</span>
                </header>

                {words.length === 0 ? (
                    <section className="rounded-3xl border border-dashed border-line-strong p-8 text-center">
                        <PenLine className="mx-auto w-8 h-8 text-accent" />
                        <p className="mt-3 font-semibold text-ink">Học vài từ trước đã</p>
                        <p className="mt-1 text-sm text-muted">Rồi quay lại viết về ngày của bạn bằng chúng.</p>
                    </section>
                ) : (
                    <>
                        {/* 1. The word: one row, scrolls sideways on a phone */}
                        <div>
                            <p className="px-1 mb-2 font-mono text-[11px] uppercase tracking-wider text-subtle">Viết với từ</p>
                            <div className="-mx-4 px-4 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]" role="list" aria-label="Chọn từ">
                                {words.map((id) => (
                                    <button
                                        key={id}
                                        onClick={() => setPicked(id)}
                                        aria-pressed={id === current}
                                        className={`h-9 px-3.5 shrink-0 rounded-full border text-sm lowercase flex items-center gap-1 ${id === current ? 'border-accent bg-accent text-on-accent font-semibold' : 'border-line bg-surface text-ink-2 hover:border-line-strong'}`}
                                    >
                                        {saved.includes(id) && <Check className="w-3.5 h-3.5" />}
                                        {getCard(id)?.word}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {card && (
                            <section key={card.id} className="rounded-3xl border border-line bg-surface overflow-hidden">
                                {/* 2. The question, large; its settings quiet underneath */}
                                {prompt && (
                                    <div data-testid="journal-prompt" className="bg-gradient-to-b from-accent/10 to-transparent p-5 pb-4">
                                        <p className="font-mono text-[11px] uppercase tracking-wider text-accent">Câu hỏi cho bạn</p>
                                        <p className="mt-2 text-xl font-semibold text-ink leading-snug">{prompt.text}</p>
                                        <div className="mt-4 flex items-center gap-2">
                                            <div className="flex rounded-full bg-bg/60 border border-line p-0.5" role="group" aria-label="Độ sâu câu hỏi">
                                                {([1, 2, 3] as const).map((d) => (
                                                    <button
                                                        key={d}
                                                        aria-pressed={depth === d}
                                                        onClick={() => {
                                                            setDepth(d);
                                                            setRoll(null);
                                                        }}
                                                        className={`h-7 px-3 rounded-full text-xs ${depth === d ? 'bg-surface text-ink font-semibold shadow-sm' : 'text-muted hover:text-ink'}`}
                                                    >
                                                        {DEPTH_LABEL[d]}
                                                    </button>
                                                ))}
                                            </div>
                                            <select
                                                value={topicPick}
                                                onChange={(e) => {
                                                    setTopicPick(e.target.value as TopicId | '');
                                                    setRoll(null);
                                                }}
                                                aria-label="Chủ đề câu hỏi"
                                                className="h-8 min-w-0 max-w-[9rem] rounded-full border border-line bg-bg/60 px-2.5 text-xs text-ink-2 truncate"
                                            >
                                                <option value="">Chủ đề của từ</option>
                                                {TOPICS.map((t) => (
                                                    <option key={t.id} value={t.id}>
                                                        {t.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <button onClick={another} aria-label="Đổi câu hỏi" title="Đổi câu hỏi" className="ml-auto w-9 h-9 shrink-0 rounded-full border border-line bg-bg/60 flex items-center justify-center text-accent hover:border-accent/60">
                                                <Shuffle className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* 3. The answer */}
                                <div className="p-5 pt-3 space-y-3 border-t border-line">
                                    <p className="text-sm text-ink-2">
                                        Dùng <b className="text-accent lowercase">{card.word}</b> <span className="text-muted">· {card.translationHint}</span>
                                    </p>
                                    {mySentences[card.id] && <p className="rounded-lg bg-bg px-3 py-2 text-xs text-muted">Câu cũ: “{mySentences[card.id].text}”. Lưu câu mới sẽ thay nó.</p>}
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
                            </section>
                        )}

                        {/* What was written this visit, as the learner will meet it again on the cards */}
                        {saved.length > 0 && (
                            <section className="space-y-2">
                                <p className="px-1 font-mono text-[11px] uppercase tracking-wider text-subtle">Câu bạn vừa viết · sẽ hiện khi ôn</p>
                                {saved.map((id) =>
                                    mySentences[id] ? (
                                        <figure key={id} className="rounded-2xl border border-accent/30 bg-accent/5 px-4 py-3">
                                            <blockquote className="text-ink">“{mySentences[id].text}”</blockquote>
                                            <figcaption className="mt-1 text-xs text-muted lowercase">{getCard(id)?.word}</figcaption>
                                        </figure>
                                    ) : null,
                                )}
                            </section>
                        )}

                        {!card && saved.length > 0 && <p className="text-center text-sm text-muted">Hết từ cho hôm nay. Mai quay lại nhé.</p>}
                    </>
                )}
            </div>
        </div>
    );
}
