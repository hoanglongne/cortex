'use client';

import { useMemo, useState } from 'react';
import { Footprints } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { getCard } from '../lib/content/repository';
import { localDate } from '../lib/engagement/ghost';
import { pledgeIdea, pledgeState, pledgeWord, usesWord } from '../lib/journey/outside';
import SentenceBox from './SentenceBox';

/**
 * "Mang ra ngoài đời" (lib/journey/outside.ts): one word to try in real
 * life. Offered at the end of the Today session; the next day, Home asks how
 * it went. Honest self-report; a sentence is welcome, never required.
 *
 * `offer`: may propose a new word (the session recap). Without it the card
 * only shows a pledge already made (Home).
 */
export default function PledgeCard({ offer = false }: { offer?: boolean }) {
    const journeys = useLexicaStore((s) => s.journeys);
    const pledge = useLexicaStore((s) => s.pledge);
    const archetype = useLexicaStore((s) => s.userArchetype);
    const makePledge = useLexicaStore((s) => s.makePledge);
    const clearPledge = useLexicaStore((s) => s.clearPledge);
    const markLived = useLexicaStore((s) => s.markLived);
    const [skipped, setSkipped] = useState<string[]>([]);
    const [answer, setAnswer] = useState<'used' | 'not-yet' | null>(null);
    const [done, setDone] = useState<string | null>(null);
    const [today] = useState(() => localDate());
    const [startOfToday] = useState(() => new Date().setHours(0, 0, 0, 0));
    const state = pledgeState(pledge, today);

    const offered = useMemo(
        () => (offer && state === 'none' ? pledgeWord(journeys, startOfToday, new Set(skipped)) : null),
        [offer, state, journeys, startOfToday, skipped],
    );

    if (done) {
        return (
            <Shell>
                <p className="text-ink">{done}</p>
            </Shell>
        );
    }

    if (state === 'due' && pledge) {
        const card = getCard(pledge.cardId);
        if (!card) return null;
        const word = card.word.toLowerCase();
        return (
            <Shell testId="pledge-checkin">
                <p className="text-ink">
                    Hôm trước bạn hẹn dùng <b>{word}</b> ngoài đời. Dùng được chưa?
                </p>
                {!answer && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                        <button onClick={() => setAnswer('used')} className="h-11 rounded-xl bg-accent text-on-accent font-bold">
                            Dùng rồi
                        </button>
                        <button onClick={() => setAnswer('not-yet')} className="h-11 rounded-xl border border-line text-ink hover:border-line-strong">
                            Chưa
                        </button>
                    </div>
                )}
                {answer === 'used' && (
                    <div className="mt-3 space-y-2">
                        <p className="text-xs text-muted">
                            Thành thật nhé: chỉ ghi nhận khi bạn đã thật sự dùng. Con số này là để bạn biết mình đi tới đâu, không phải để khoe. Nếu nhớ câu đã dùng, dán vào đây: máy xem giúp và giữ nó làm câu của bạn.
                        </p>
                        <SentenceBox
                            word={word}
                            meaning={card.translationHint}
                            optional
                            placeholder={`Câu bạn đã dùng với “${word}” (không bắt buộc)`}
                            saveLabel="Ghi nhận đã dùng"
                            onSave={(sentence) => {
                                markLived(card.id, sentence && usesWord(sentence, word) ? sentence : undefined);
                                setDone(`Tuyệt. “${word}” giờ là từ của bạn ngoài đời, không chỉ trong app.`);
                            }}
                        />
                    </div>
                )}
                {answer === 'not-yet' && (
                    <div className="mt-3 space-y-2">
                        <p className="text-sm text-muted">Không sao, dùng được một từ ngoài đời cần đúng lúc. Thử thêm hôm nay nhé?</p>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => {
                                    makePledge(card.id);
                                    setAnswer(null);
                                }}
                                className="h-11 rounded-xl bg-accent text-on-accent font-bold"
                            >
                                Thử thêm hôm nay
                            </button>
                            <button
                                onClick={() => {
                                    clearPledge();
                                    setDone('Đã bỏ hẹn. Cuối phiên sau sẽ có từ khác để thử.');
                                }}
                                className="h-11 rounded-xl border border-line text-ink hover:border-line-strong"
                            >
                                Bỏ hẹn
                            </button>
                        </div>
                    </div>
                )}
            </Shell>
        );
    }

    if (state === 'today' && pledge) {
        const card = getCard(pledge.cardId);
        if (!card) return null;
        return (
            <Shell testId="pledge-today">
                <p className="text-ink">
                    Hôm nay thử dùng <b>{card.word.toLowerCase()}</b> <span className="text-muted">({card.translationHint})</span>
                </p>
                <p className="mt-1 text-sm text-muted">{pledgeIdea(card.id, archetype, card.situation?.prompt)} Mai app sẽ hỏi bạn.</p>
            </Shell>
        );
    }

    if (!offered) return null;
    const card = getCard(offered);
    if (!card) return null;
    return (
        <Shell testId="pledge-offer">
            <p className="text-ink">
                Mang một từ ra ngoài đời: <b>{card.word.toLowerCase()}</b> <span className="text-muted">({card.translationHint})</span>
            </p>
            <p className="mt-1 text-sm text-muted">{pledgeIdea(card.id, archetype, card.situation?.prompt)}</p>
            <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => makePledge(card.id)} className="h-10 px-4 rounded-xl bg-accent text-on-accent text-sm font-bold">
                    Mình sẽ thử
                </button>
                <button onClick={() => setSkipped((s) => [...s, card.id])} className="h-10 px-3 rounded-xl border border-line text-sm text-ink hover:border-line-strong">
                    Từ khác
                </button>
            </div>
        </Shell>
    );
}

function Shell({ children, testId }: { children: React.ReactNode; testId?: string }) {
    return (
        <section data-testid={testId} className="rounded-2xl border border-line bg-surface p-4">
            <p className="mb-2 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-subtle">
                <Footprints className="w-3.5 h-3.5" /> Ra ngoài đời
            </p>
            {children}
        </section>
    );
}
