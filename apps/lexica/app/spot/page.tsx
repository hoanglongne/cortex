'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, Crosshair, Library, ScanSearch } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { getAllCards, getCard, sameWordIds, useContentVersion } from '../lib/content/repository';
import { localDate } from '../lib/engagement/ghost';
import { spotWords } from '../lib/journey/outside';
import { collection, huntCaught, pickHunt, placeLabel, placeMap, PLACES, snippetAround, weekOf, type PlaceId } from '../lib/journey/sightings';

/**
 * "Bắt gặp" (lib/journey/sightings.ts): learned words met outside the app.
 * Three tabs over one record:
 * - Dán đoạn: paste something met outside (an email, a post, lyrics), see
 *   the learned words in it in any form, say where it was from. On Android
 *   the PWA receives shared text here.
 * - Săn tuần này: five learned words to catch this week.
 * - Bộ sưu tập: every word caught, the sentences, and where words turn up.
 * Catching a word counts as Gặp.
 */
export default function SpotPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-bg" />}>
            <Spot />
        </Suspense>
    );
}

type Tab = 'paste' | 'hunt' | 'collection';
const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'paste', label: 'Dán đoạn', icon: <ScanSearch className="w-4 h-4" /> },
    { id: 'hunt', label: 'Săn tuần này', icon: <Crosshair className="w-4 h-4" /> },
    { id: 'collection', label: 'Bộ sưu tập', icon: <Library className="w-4 h-4" /> },
];

/** One card per word: sightings of two cards of the same word count once. */
const wordId = (id: string) => sameWordIds(id)[0] ?? id;
const wordOf = (id: string) => getCard(id)?.word.toLowerCase();

function Spot() {
    const params = useSearchParams();
    const shared = [params.get('title'), params.get('text'), params.get('url')].filter(Boolean).join('\n');
    const asked = params.get('tab');
    const [tab, setTab] = useState<Tab>(shared ? 'paste' : asked === 'hunt' || asked === 'collection' ? asked : 'paste');

    return (
        <div className="min-h-screen bg-bg px-4 py-8">
            <div className="max-w-2xl mx-auto space-y-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="text-muted hover:text-accent text-sm">
                        ← Học
                    </Link>
                    <p className="text-ink font-bold">Bắt gặp</p>
                    <span className="w-10" />
                </div>
                <div className="grid grid-cols-3 gap-1 rounded-xl bg-surface-2 p-1" role="tablist" aria-label="Bắt gặp">
                    {TABS.map((t) => (
                        <button
                            key={t.id}
                            role="tab"
                            aria-selected={tab === t.id}
                            onClick={() => setTab(t.id)}
                            className={`h-10 rounded-lg flex items-center justify-center gap-1.5 text-sm ${tab === t.id ? 'bg-surface text-ink font-semibold shadow-sm' : 'text-muted hover:text-ink'}`}
                        >
                            {t.icon}
                            <span className="truncate">{t.label}</span>
                        </button>
                    ))}
                </div>
                {tab === 'paste' && <Paste initial={shared} />}
                {tab === 'hunt' && <HuntTab />}
                {tab === 'collection' && <CollectionTab />}
            </div>
        </div>
    );
}

function Places({ value, onPick, label = 'Bạn gặp ở đâu?' }: { value: PlaceId | null; onPick: (p: PlaceId) => void; label?: string }) {
    return (
        <div>
            <p className="text-sm text-ink-2">{label}</p>
            <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label={label}>
                {PLACES.map((p) => (
                    <button
                        key={p.id}
                        aria-pressed={value === p.id}
                        onClick={() => onPick(p.id)}
                        className={`h-9 px-3 rounded-full border text-sm ${value === p.id ? 'border-accent bg-accent/10 text-ink' : 'border-line text-ink-2 hover:border-line-strong'}`}
                    >
                        {p.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

function Paste({ initial }: { initial: string }) {
    const [text, setText] = useState(initial);
    const [place, setPlace] = useState<PlaceId | null>(null);
    const [saved, setSaved] = useState<number | null>(null);
    const version = useContentVersion();
    const journeys = useLexicaStore((s) => s.journeys);
    const recordSightings = useLexicaStore((s) => s.recordSightings);

    const spotted = useMemo(() => {
        void version;
        return spotWords(text, getAllCards().filter((c) => journeys[c.id]));
    }, [text, journeys, version]);
    const ids = [...new Set(spotted.map((s) => s.cardId))];
    const words = ids.map(wordOf).filter(Boolean);

    const save = () => {
        const at = Date.now();
        recordSightings(
            ids.map((cardId) => {
                const first = spotted.find((s) => s.cardId === cardId)!;
                return { cardId, at, place: place ?? 'other', snippet: snippetAround(text, first.start, first.end) };
            }),
        );
        setSaved(ids.length);
    };

    return (
        <>
            <section className="rounded-2xl border border-line bg-surface p-4">
                <p className="flex items-center gap-2 font-semibold text-ink">
                    <ScanSearch className="w-4 h-4 text-accent" /> Từ của bạn ngoài đời
                </p>
                <p className="mt-1 text-sm text-muted">Dán một đoạn tiếng Anh bạn vừa đọc được: email, bài đăng, lời bài hát. App tìm những từ bạn đã học trong đó.</p>
                <textarea
                    value={text}
                    onChange={(e) => {
                        setText(e.target.value);
                        setSaved(null);
                    }}
                    rows={5}
                    maxLength={5000}
                    placeholder="Dán đoạn văn vào đây"
                    aria-label="Đoạn văn"
                    className="mt-3 w-full rounded-xl border border-line bg-bg px-3 py-2 text-ink outline-none focus:border-accent"
                />
            </section>

            {text.trim() && (
                <section data-testid="spot-result" className="rounded-2xl border border-line bg-surface p-4">
                    {spotted.length === 0 ? (
                        <p className="text-sm text-muted">Chưa thấy từ nào bạn đã học trong đoạn này.</p>
                    ) : (
                        <>
                            <p className="text-sm text-ink">
                                Bạn bắt gặp <b>{ids.length}</b> từ đã học: {words.join(', ')}
                            </p>
                            <p className="mt-3 whitespace-pre-wrap leading-relaxed text-ink-2">
                                <Highlighted text={text} spans={spotted} />
                            </p>
                            {saved === null ? (
                                <div className="mt-4 space-y-3">
                                    <Places value={place} onPick={setPlace} label="Đoạn này bạn gặp ở đâu?" />
                                    <button onClick={save} className="h-11 px-4 rounded-xl bg-accent text-on-accent font-bold">
                                        Ghi nhận đã gặp {ids.length} từ
                                    </button>
                                </div>
                            ) : (
                                <p className="mt-4 flex items-center gap-1.5 text-sm text-accent">
                                    <Check className="w-4 h-4" /> Đã cất vào bộ sưu tập. Gặp một từ ngoài app là lúc nó bắt đầu thành của bạn.
                                </p>
                            )}
                        </>
                    )}
                </section>
            )}
        </>
    );
}

function HuntTab() {
    useContentVersion();
    const journeys = useLexicaStore((s) => s.journeys);
    const sightings = useLexicaStore((s) => s.sightings);
    const hunt = useLexicaStore((s) => s.hunt);
    const setHunt = useLexicaStore((s) => s.setHunt);
    const recordSightings = useLexicaStore((s) => s.recordSightings);
    const [week] = useState(() => weekOf(localDate()));
    const [open, setOpen] = useState<string | null>(null);
    const hasWords = Object.keys(journeys).length > 0;

    // A new week (or a first visit) gets its five words.
    useEffect(() => {
        if (!hasWords || hunt?.week === week) return;
        const caughtBefore = new Set(sightings.map((s) => wordId(s.cardId)));
        const seed = Number(week.replace(/-/g, '')) % 997;
        const cardIds = pickHunt(journeys, wordOf, (id) => caughtBefore.has(wordId(id)), seed);
        if (cardIds.length) setHunt({ week, cardIds });
    }, [hasWords, hunt?.week, week, journeys, sightings, setHunt]);

    if (!hasWords) return <p className="text-sm text-muted">Học vài từ trước đã, rồi quay lại săn chúng ngoài đời.</p>;
    if (!hunt || hunt.week !== week) return <div className="h-48 rounded-2xl bg-surface animate-pulse" />;

    const caught = huntCaught(hunt, sightings, wordId);
    const placeOf = (id: string) => sightings.find((s) => wordId(s.cardId) === wordId(id) && s.at >= new Date(`${hunt.week}T00:00:00`).getTime())?.place;

    return (
        <section data-testid="hunt" className="rounded-2xl border border-line bg-surface p-4 space-y-4">
            <div>
                <p className="flex items-center gap-2 font-semibold text-ink">
                    <Crosshair className="w-4 h-4 text-accent" /> 5 từ cần săn tuần này
                </p>
                <p className="mt-1 text-sm text-muted">Để ý tin nhắn, video, bài đăng. Thấy hay nghe một từ ở đâu thì bấm “Mình gặp rồi”, hoặc dán cả đoạn ở tab Dán đoạn.</p>
                <div className="mt-3 flex items-center gap-3">
                    <div className="h-2 flex-1 rounded-full bg-surface-2 overflow-hidden">
                        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${(caught.size / hunt.cardIds.length) * 100}%` }} />
                    </div>
                    <span className="text-sm text-ink tabular-nums">
                        {caught.size}/{hunt.cardIds.length}
                    </span>
                </div>
                {caught.size === hunt.cardIds.length && <p className="mt-2 text-sm text-accent">Bạn bắt đủ cả {hunt.cardIds.length} từ tuần này. Thứ Hai sẽ có 5 từ mới.</p>}
            </div>
            <ul className="divide-y divide-line">
                {hunt.cardIds.map((id) => {
                    const card = getCard(id);
                    if (!card) return null;
                    const got = caught.has(id);
                    const where = got ? placeOf(id) : undefined;
                    return (
                        <li key={id} className="py-3">
                            <div className="flex items-center gap-3">
                                <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${got ? 'bg-accent text-on-accent' : 'border border-dashed border-line-strong text-subtle'}`}>{got ? <Check className="w-4 h-4" /> : <Crosshair className="w-3.5 h-3.5" />}</span>
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-ink lowercase">{card.word}</p>
                                    <p className="text-sm text-muted truncate">{got ? `Đã gặp${where ? ` · ${placeLabel(where)}` : ''}` : card.translationHint}</p>
                                </div>
                                {!got && (
                                    <button onClick={() => setOpen(open === id ? null : id)} aria-expanded={open === id} className="h-9 px-3 rounded-xl border border-line text-sm text-ink hover:border-line-strong shrink-0">
                                        Mình gặp rồi
                                    </button>
                                )}
                            </div>
                            {open === id && !got && (
                                <div className="mt-3 ml-10">
                                    <Places
                                        value={null}
                                        onPick={(place) => {
                                            recordSightings([{ cardId: id, at: Date.now(), place }]);
                                            setOpen(null);
                                        }}
                                        label={`Bạn gặp “${card.word.toLowerCase()}” ở đâu?`}
                                    />
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}

function CollectionTab() {
    useContentVersion();
    const sightings = useLexicaStore((s) => s.sightings);
    const [place, setPlace] = useState<PlaceId | null>(null);
    const map = useMemo(() => placeMap(sightings, wordId), [sightings]);
    const items = useMemo(() => collection(place ? sightings.filter((s) => s.place === place) : sightings, wordId), [sightings, place]);
    const most = Math.max(1, ...map.map((m) => m.sightings));

    if (sightings.length === 0) {
        return (
            <section className="rounded-2xl border border-dashed border-line-strong p-6 text-center">
                <p className="font-medium text-ink">Bộ sưu tập còn trống</p>
                <p className="mt-1 text-sm text-muted">Mỗi từ bạn bắt gặp ngoài đời sẽ nằm ở đây, kèm câu bạn gặp nó và nơi bạn gặp.</p>
            </section>
        );
    }

    return (
        <>
            <section data-testid="place-map" className="rounded-2xl border border-line bg-surface p-4">
                <p className="font-semibold text-ink">Nơi bạn gặp từ</p>
                <p className="mt-1 text-sm text-muted">Bấm một nơi để xem những từ gặp ở đó.</p>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {map.map((m) => (
                        <button
                            key={m.place}
                            onClick={() => setPlace(place === m.place ? null : m.place)}
                            aria-pressed={place === m.place}
                            disabled={m.sightings === 0}
                            className={`rounded-xl border p-3 text-left disabled:opacity-40 ${place === m.place ? 'border-accent bg-accent/10' : 'border-line hover:border-line-strong'}`}
                        >
                            <span className="block text-sm text-ink">{placeLabel(m.place)}</span>
                            <span className="block text-xs text-muted">{m.words} từ</span>
                            <span className="mt-2 block h-1.5 rounded-full bg-surface-2 overflow-hidden">
                                <span className="block h-full rounded-full bg-accent" style={{ width: `${(m.sightings / most) * 100}%` }} />
                            </span>
                        </button>
                    ))}
                </div>
            </section>
            <section data-testid="collection" className="rounded-2xl border border-line bg-surface">
                <p className="px-4 pt-4 font-semibold text-ink">
                    {items.length} từ đã bắt gặp{place ? ` · ${placeLabel(place)}` : ''}
                </p>
                <ul className="divide-y divide-line">
                    {items.map((c) => {
                        const card = getCard(c.cardId);
                        if (!card) return null;
                        return (
                            <li key={c.cardId} className="px-4 py-3">
                                <p className="flex items-baseline justify-between gap-2">
                                    <b className="text-ink lowercase">{card.word}</b>
                                    <span className="text-xs text-muted shrink-0">
                                        gặp {c.count} lần · {c.places.map(placeLabel).join(', ')}
                                    </span>
                                </p>
                                <p className="text-sm text-muted">{card.translationHint}</p>
                                {c.snippets.map((s) => (
                                    <p key={s} className="mt-1.5 border-l-2 border-accent/40 pl-2 text-sm italic text-ink-2">
                                        {s}
                                    </p>
                                ))}
                            </li>
                        );
                    })}
                </ul>
            </section>
        </>
    );
}

function Highlighted({ text, spans }: { text: string; spans: { start: number; end: number }[] }) {
    const parts: React.ReactNode[] = [];
    let at = 0;
    for (const s of spans) {
        if (s.start < at) continue;
        parts.push(text.slice(at, s.start));
        parts.push(
            <mark key={s.start} className="rounded bg-accent/25 px-0.5 text-ink">
                {text.slice(s.start, s.end)}
            </mark>,
        );
        at = s.end;
    }
    parts.push(text.slice(at));
    return <>{parts}</>;
}
