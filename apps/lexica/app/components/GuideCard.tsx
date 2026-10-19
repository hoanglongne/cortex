'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Check, Lightbulb, X } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { getProgressStats } from '../lib/eloAlgorithm';
import { hardWords } from '../lib/engagement/hard';
import { localDate } from '../lib/engagement/ghost';
import { sameWordIds } from '../lib/content/repository';
import { checklist, nextTip, showChecklist, type GuideFacts } from '../lib/guide';
import { huntCaught, weekOf } from '../lib/journey/sightings';

const DAY_MS = 86_400_000;

/**
 * Home's help (lib/guide.ts): the first-week checklist while it is useful,
 * otherwise one tip that fits what the learner's numbers say right now.
 */
export default function GuideCard() {
    const journeys = useLexicaStore((s) => s.journeys);
    const cardProgress = useLexicaStore((s) => s.cardProgress);
    const mySentences = useLexicaStore((s) => s.mySentences);
    const sightings = useLexicaStore((s) => s.sightings);
    const hunt = useLexicaStore((s) => s.hunt);
    const pledge = useLexicaStore((s) => s.pledge);
    const studyHistory = useLexicaStore((s) => s.studyHistory);
    const tipsDismissed = useLexicaStore((s) => s.tipsDismissed);
    const dismissTip = useLexicaStore((s) => s.dismissTip);
    const checklistHidden = useLexicaStore((s) => s.checklistHidden);
    const hideChecklist = useLexicaStore((s) => s.hideChecklist);
    const [now] = useState(() => Date.now());
    const today = localDate(now);

    const facts = useMemo<GuideFacts>(() => {
        const js = Object.values(journeys);
        const first = js.length ? Math.min(...js.map((j) => j.understoodAt)) : null;
        const wordId = (id: string) => sameWordIds(id)[0] ?? id;
        return {
            words: js.length,
            recalls: js.filter((j) => j.recalls.length > 0).length,
            remembered: js.filter((j) => j.rememberedAt).length,
            met: js.filter((j) => j.metAt).length,
            spoken: js.filter((j) => j.usedAt).length,
            sentences: Object.keys(mySentences).length,
            sightings: sightings.length,
            pledged: Boolean(pledge),
            lived: js.filter((j) => j.livedAt).length,
            daysStudied: Object.keys(studyHistory).length,
            due: getProgressStats(cardProgress).dueToday,
            hard: hardWords(cardProgress).length,
            hunt: hunt && hunt.week === weekOf(today) ? { caught: huntCaught(hunt, sightings, wordId).size, total: hunt.cardIds.length } : null,
            weekday: new Date(now).getDay(),
            daysSinceStart: first === null ? null : Math.floor((now - first) / DAY_MS),
        };
    }, [journeys, mySentences, sightings, pledge, studyHistory, cardProgress, hunt, today, now]);

    if (showChecklist(facts, checklistHidden)) {
        const items = checklist(facts);
        const done = items.filter((i) => i.done).length;
        return (
            <section data-testid="week-one" aria-label="Tuần đầu với Lexica" className="w-full rounded-2xl border border-line bg-surface p-4">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="font-semibold text-ink">Tuần đầu với Lexica</p>
                        <p className="text-sm text-muted">Bảy việc nhỏ để biết app làm được gì. Xong {done}/{items.length}.</p>
                    </div>
                    <button onClick={hideChecklist} aria-label="Ẩn danh sách tuần đầu" className="w-8 h-8 rounded-lg flex items-center justify-center text-subtle hover:text-ink hover:bg-surface-2">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-surface-2 overflow-hidden">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${(done / items.length) * 100}%` }} />
                </div>
                <ul className="mt-3 space-y-1">
                    {items.map((i) => (
                        <li key={i.id}>
                            <Link href={i.href} className="flex items-start gap-3 rounded-xl px-2 py-1.5 hover:bg-surface-2/60">
                                <span className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${i.done ? 'bg-accent text-on-accent' : 'border border-line-strong'}`}>{i.done && <Check className="w-3.5 h-3.5" />}</span>
                                <span className="min-w-0">
                                    <span className={`block text-sm ${i.done ? 'text-muted line-through' : 'text-ink'}`}>{i.title}</span>
                                    {!i.done && <span className="block text-xs text-muted">{i.hint}</span>}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
                <Link href="/guide" className="mt-2 inline-block text-sm text-accent hover:underline">
                    Xem Lexica có gì
                </Link>
            </section>
        );
    }

    const tip = nextTip(facts, tipsDismissed, today);
    if (!tip) return null;
    return (
        <section data-testid="tip" aria-label="Gợi ý" className="w-full rounded-2xl border border-accent/30 bg-accent/5 p-4">
            <p className="flex items-start gap-2 text-sm text-ink">
                <Lightbulb className="w-4 h-4 mt-0.5 text-accent shrink-0" />
                <span>{tip.text}</span>
            </p>
            <div className="mt-3 flex items-center gap-2 pl-6">
                <Link href={tip.href} className="h-9 px-3 inline-flex items-center rounded-xl bg-accent text-on-accent text-sm font-bold">
                    {tip.action}
                </Link>
                <button onClick={() => dismissTip(tip.id)} className="h-9 px-3 rounded-xl text-sm text-muted hover:text-ink">
                    {tip.daily ? 'Để sau' : 'Đã hiểu'}
                </button>
            </div>
        </section>
    );
}
