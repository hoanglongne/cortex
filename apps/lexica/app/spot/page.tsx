'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, ClipboardPaste, Crosshair, Library, ScanSearch, Sparkles } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { getAllCards, getCard, getPassages, getQuotes, sameWordIds, useContentVersion } from '../lib/content/repository';
import { localDate } from '../lib/engagement/ghost';
import { spotWords } from '../lib/journey/outside';
import { collection, huntCaught, pickHunt, placeLabel, placeMap, PLACES, snippetAround, weekOf, type PlaceId } from '../lib/journey/sightings';

/**
 * "Bắt gặp" (lib/journey/sightings.ts): learned words met outside the app.
 * One page, in the order a learner meets it:
 * - Săn tuần này: five learned words to catch this week, one card each;
 *   "Gặp rồi" asks where, and the card turns over.
 * - Quét một đoạn: paste (or share, on Android) something met outside, see
 *   the learned words in it in any form; a sample passage shows how.
 * - Bộ sưu tập: every word caught, the sentences, and where words turn up.
 * Catching a word counts as Gặp. `?tab=` from older links scrolls there.
 */
export default function SpotPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-bg" />}>
            <Spot />
        </Suspense>
    );
}

/** One card per word: sightings of two cards of the same word count once. */
const wordId = (id: string) => sameWordIds(id)[0] ?? id;
const wordOf = (id: string) => getCard(id)?.word.toLowerCase();

function Spot() {
    const params = useSearchParams();
    const shared = [params.get('title'), params.get('text'), params.get('url')].filter(Boolean).join('\n');
    const asked = shared ? 'scan' : params.get('tab') === 'collection' ? 'collection' : params.get('tab') === 'paste' ? 'scan' : null;
    const hasWords = useLexicaStore((s) => Object.keys(s.journeys).length > 0);

    useEffect(() => {
        if (asked) document.getElementById(`spot-${asked}`)?.scrollIntoView({ block: 'start' });
    }, [asked]);

    return (
        <div className="min-h-screen bg-bg px-4 py-6">
            <div className="max-w-2xl mx-auto space-y-6">
                <header className="flex items-center justify-between">
                    <Link href="/practice" className="text-muted hover:text-accent text-sm">
                        ← Luyện
                    </Link>
                    <h1 className="text-ink font-bold">Bắt gặp</h1>
                    <span className="w-12" />
                </header>
                {hasWords ? (
                    <>
                        <HuntSection />
                        <ScanSection initial={shared} />
                        <CollectionSection />
                    </>
                ) : (
                    <section className="rounded-3xl border border-dashed border-line-strong p-8 text-center">
                        <Crosshair className="mx-auto w-8 h-8 text-accent" />
                        <p className="mt-3 font-semibold text-ink">Học vài từ trước đã</p>
                        <p className="mt-1 text-sm text-muted">Rồi quay lại săn chúng trong tin nhắn, video, bài đăng của bạn.</p>
                    </section>
                )}
            </div>
        </div>
    );
}

function PlaceChips({ onPick, value = null, compact = false }: { onPick: (p: PlaceId) => void; value?: PlaceId | null; compact?: boolean }) {
    return (
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Bạn gặp ở đâu">
            {PLACES.map((p) => (
                <button
                    key={p.id}
                    type="button"
                    aria-pressed={value === p.id}
                    onClick={() => onPick(p.id)}
                    className={`${compact ? 'h-8 px-2.5 text-xs' : 'h-9 px-3 text-sm'} rounded-full border ${value === p.id ? 'border-accent bg-accent/10 text-ink' : 'border-line text-ink-2 hover:border-line-strong bg-surface'}`}
                >
                    {p.label}
                </button>
            ))}
        </div>
    );
}

/** A small ring for "caught out of five". */
function Ring({ value, total }: { value: number; total: number }) {
    const r = 26;
    const c = 2 * Math.PI * r;
    return (
        <div className="relative w-16 h-16 shrink-0">
            <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90" aria-hidden>
                <circle cx="32" cy="32" r={r} fill="none" strokeWidth="6" className="stroke-surface-3" />
                <circle
                    cx="32"
                    cy="32"
                    r={r}
                    fill="none"
                    strokeWidth="6"
                    strokeLinecap="round"
                    className="stroke-accent transition-all duration-500"
                    strokeDasharray={c}
                    strokeDashoffset={c * (1 - value / Math.max(1, total))}
                />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-mono font-bold text-ink">
                {value}/{total}
            </span>
        </div>
    );
}

function HuntSection() {
    useContentVersion();
    const journeys = useLexicaStore((s) => s.journeys);
    const sightings = useLexicaStore((s) => s.sightings);
    const hunt = useLexicaStore((s) => s.hunt);
    const setHunt = useLexicaStore((s) => s.setHunt);
    const recordSightings = useLexicaStore((s) => s.recordSightings);
    const [today] = useState(() => localDate());
    const week = weekOf(today);
    const [open, setOpen] = useState<string | null>(null);
    const [justCaught, setJustCaught] = useState<string | null>(null);

    // A new week (or a first visit) gets its five words.
    useEffect(() => {
        if (hunt?.week === week) return;
        const caughtBefore = new Set(sightings.map((s) => wordId(s.cardId)));
        const seed = Number(week.replace(/-/g, '')) % 997;
        const cardIds = pickHunt(journeys, wordOf, (id) => caughtBefore.has(wordId(id)), seed);
        if (cardIds.length) setHunt({ week, cardIds });
    }, [hunt?.week, week, journeys, sightings, setHunt]);

    if (!hunt || hunt.week !== week) return <div className="h-64 rounded-3xl bg-surface animate-pulse" />;

    const caught = huntCaught(hunt, sightings, wordId);
    const since = new Date(`${hunt.week}T00:00:00`).getTime();
    const placeOf = (id: string) => sightings.find((s) => wordId(s.cardId) === wordId(id) && s.at >= since)?.place;
    const all = caught.size === hunt.cardIds.length;
    const [y, m, d] = today.split('-').map(Number);
    const daysLeft = 7 - ((new Date(y, m - 1, d).getDay() + 6) % 7);

    return (
        <section id="spot-hunt" data-testid="hunt" className="scroll-mt-4 rounded-3xl border border-accent/40 bg-gradient-to-b from-accent/10 to-accent/[0.02] p-5 space-y-4">
            <div className="flex items-center gap-4">
                <Ring value={caught.size} total={hunt.cardIds.length} />
                <div className="min-w-0">
                    <p className="font-mono text-[11px] uppercase tracking-wider text-accent">Săn tuần này · còn {daysLeft} ngày</p>
                    <h2 className="mt-1 text-xl font-semibold text-ink">{all ? 'Bắt đủ cả 5 từ!' : '5 từ đang trốn ngoài kia'}</h2>
                    <p className="mt-0.5 text-sm text-muted">{all ? 'Thứ Hai có 5 từ mới. Những từ này đã lên Gặp.' : 'Để ý tin nhắn, video, bài đăng. Thấy hay nghe được thì bấm “Gặp rồi”.'}</p>
                </div>
            </div>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {hunt.cardIds.map((id) => {
                    const card = getCard(id);
                    if (!card) return null;
                    const got = caught.has(id);
                    const where = got ? placeOf(id) : undefined;
                    const isOpen = open === id && !got;
                    return (
                        <li key={id} className={isOpen ? 'col-span-2 sm:col-span-3' : ''}>
                            <div
                                className={`h-full rounded-2xl border p-3 transition-colors ${got ? 'border-accent/50 bg-accent/10' : isOpen ? 'border-accent/60 bg-surface' : 'border-dashed border-line-strong bg-surface/60'} ${justCaught === id ? 'animate-[pulse_0.6s_ease-out_1]' : ''}`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <p className="font-semibold text-ink lowercase leading-tight">{card.word}</p>
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${got ? 'bg-accent text-on-accent' : 'text-subtle'}`}>
                                        {got ? <Check className="w-3.5 h-3.5" /> : <Crosshair className="w-4 h-4" />}
                                    </span>
                                </div>
                                <p className="mt-1 text-xs text-muted line-clamp-2">{card.translationHint}</p>
                                {got ? (
                                    <p className="mt-2 text-xs font-medium text-accent">Đã bắt{where ? ` · ${placeLabel(where)}` : ''}</p>
                                ) : isOpen ? (
                                    <div className="mt-3 space-y-2">
                                        <p className="text-sm text-ink-2">Bạn gặp “{card.word.toLowerCase()}” ở đâu?</p>
                                        <PlaceChips
                                            compact
                                            onPick={(place) => {
                                                recordSightings([{ cardId: id, at: Date.now(), place }]);
                                                setOpen(null);
                                                setJustCaught(id);
                                            }}
                                        />
                                        <button type="button" onClick={() => setOpen(null)} className="text-xs text-muted hover:text-ink">
                                            Thôi, chưa gặp
                                        </button>
                                    </div>
                                ) : (
                                    <button type="button" onClick={() => setOpen(id)} aria-expanded={false} className="mt-2.5 h-8 w-full rounded-lg border border-line text-xs font-medium text-ink hover:border-accent/60">
                                        Gặp rồi
                                    </button>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}

/** The passage with the most of the learner's words in it: "see what this does" in one tap. */
function useSample(): string | null {
    const version = useContentVersion();
    const journeys = useLexicaStore((s) => s.journeys);
    return useMemo(() => {
        void version;
        const mine = getAllCards().filter((c) => journeys[c.id]);
        let best: { text: string; n: number } | null = null;
        for (const p of getPassages()) {
            const n = new Set(spotWords(p.text, mine).map((s) => s.cardId)).size;
            if (n > 0 && (!best || n > best.n)) best = { text: p.text.split('\n\n').slice(0, 2).join('\n\n'), n };
        }
        if (best) return best.text;
        // No passage has their words yet: real quotes (books, news, songs) of the words they learned.
        const quotes = mine
            .flatMap((c) =>
                getQuotes(c.id)
                    .slice(0, 1)
                    .map((q) => q.text),
            )
            .slice(0, 3);
        if (quotes.length > 0) return quotes.join('\n\n');
        // Last: their words in the phrases they come in, as a short list.
        const phrases = mine.flatMap((c) => c.collocations?.slice(0, 1) ?? []).slice(0, 4);
        return phrases.length > 0 ? phrases.map((p) => `• ${p}`).join('\n') : null;
    }, [journeys, version]);
}

function ScanSection({ initial }: { initial: string }) {
    const [text, setText] = useState(initial);
    const [place, setPlace] = useState<PlaceId | null>(null);
    const [saved, setSaved] = useState<number | null>(null);
    const [sampleUsed, setSampleUsed] = useState(false);
    const [editing, setEditing] = useState(false);
    const version = useContentVersion();
    const journeys = useLexicaStore((s) => s.journeys);
    const recordSightings = useLexicaStore((s) => s.recordSightings);
    const sample = useSample();

    const spotted = useMemo(() => {
        void version;
        return spotWords(
            text,
            getAllCards().filter((c) => journeys[c.id]),
        );
    }, [text, journeys, version]);
    const ids = [...new Set(spotted.map((s) => s.cardId))];
    const words = ids.map(wordOf).filter(Boolean);

    const edit = (t: string, fromSample = false) => {
        setText(t);
        setEditing(false);
        setSaved(null);
        setSampleUsed(fromSample);
    };
    const paste = async () => {
        try {
            const t = await navigator.clipboard.readText();
            if (t.trim()) edit(t);
        } catch {
            // no permission: the learner pastes into the box
        }
    };
    const save = () => {
        const at = Date.now();
        recordSightings(
            ids.map((cardId) => {
                const first = spotted.find((s) => s.cardId === cardId)!;
                return {
                    cardId,
                    at,
                    place: place ?? 'other',
                    snippet: snippetAround(text, first.start, first.end),
                };
            }),
        );
        setSaved(ids.length);
    };

    return (
        <section id="spot-scan" className="scroll-mt-4 space-y-3">
            <div className="px-1">
                <h2 className="flex items-center gap-2 font-semibold text-ink">
                    <ScanSearch className="w-4 h-4 text-accent" /> Quét một đoạn
                </h2>
                <p className="mt-0.5 text-sm text-muted">Dán tiếng Anh bạn vừa đọc: email, caption, lời bài hát. App soi ra từ bạn đã học, kể cả khi đổi dạng.</p>
            </div>
            <div className="rounded-2xl border border-line bg-surface p-3 space-y-3">
                {text.trim() && spotted.length > 0 && !editing ? (
                    <div data-testid="spot-result" className="max-h-72 overflow-y-auto whitespace-pre-wrap leading-relaxed text-ink-2 px-1">
                        <Highlighted text={text} spans={spotted} />
                    </div>
                ) : null}
                {(editing || !text.trim() || spotted.length === 0) && (
                    <textarea
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value);
                            setSaved(null);
                            setSampleUsed(false);
                        }}
                        autoFocus={editing}
                        rows={5}
                        maxLength={5000}
                        placeholder="Dán đoạn văn vào đây"
                        aria-label="Đoạn văn"
                        className="w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                    />
                )}
                <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => void paste()} className="h-9 px-3 rounded-lg border border-line text-sm text-ink hover:border-line-strong flex items-center gap-1.5">
                        <ClipboardPaste className="w-4 h-4" /> Dán
                    </button>
                    {sample && !text.trim() && (
                        <button type="button" onClick={() => edit(sample, true)} className="h-9 px-3 rounded-lg text-sm text-accent hover:bg-accent/10 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4" /> Thử với đoạn mẫu
                        </button>
                    )}
                    {text.trim() && spotted.length > 0 && (
                        <button type="button" onClick={() => setEditing(!editing)} className="h-9 px-3 rounded-lg border border-line text-sm text-ink hover:border-line-strong">
                            {editing ? 'Xem từ đã soi' : 'Sửa đoạn'}
                        </button>
                    )}
                    {text.trim() && (
                        <button type="button" onClick={() => edit('')} className="h-9 px-3 rounded-lg text-sm text-muted hover:text-ink ml-auto">
                            Xoá
                        </button>
                    )}
                </div>
            </div>

            {text.trim() && (
                <div className="rounded-2xl border border-line bg-surface p-4">
                    {spotted.length === 0 ? (
                        <p data-testid="spot-result" className="text-sm text-muted">
                            Chưa thấy từ nào bạn đã học trong đoạn này. Thử một đoạn dài hơn nhé.
                        </p>
                    ) : sampleUsed ? (
                        <p className="text-sm text-ink">
                            Trong đoạn mẫu có <b>{ids.length}</b> từ của bạn: {words.join(', ')}. Đoạn bạn tự gặp ngoài đời mới được cất vào bộ sưu tập.
                        </p>
                    ) : saved === null ? (
                        <div className="space-y-3">
                            <p className="text-sm text-ink">
                                Bắt được <b>{ids.length}</b> từ: <span className="text-accent">{words.join(', ')}</span>
                            </p>
                            <p className="text-sm text-ink-2">Đoạn này bạn gặp ở đâu?</p>
                            <PlaceChips value={place} onPick={setPlace} />
                            <button onClick={save} className="h-11 w-full sm:w-auto px-5 rounded-xl bg-accent hover:bg-accent-strong text-on-accent font-bold">
                                Cất {ids.length} từ vào bộ sưu tập
                            </button>
                        </div>
                    ) : (
                        <p className="flex items-center gap-1.5 text-sm text-accent">
                            <Check className="w-4 h-4" /> Đã cất {saved} từ. Gặp một từ ngoài app là lúc nó bắt đầu thành của bạn.
                        </p>
                    )}
                </div>
            )}
        </section>
    );
}

const SHOWN = 5;

function CollectionSection() {
    useContentVersion();
    const sightings = useLexicaStore((s) => s.sightings);
    const [place, setPlace] = useState<PlaceId | null>(null);
    const [all, setAll] = useState(false);
    const map = useMemo(() => placeMap(sightings, wordId).filter((m) => m.sightings > 0), [sightings]);
    const items = useMemo(() => collection(place ? sightings.filter((s) => s.place === place) : sightings, wordId), [sightings, place]);
    const words = useMemo(() => collection(sightings, wordId).length, [sightings]);
    const most = Math.max(1, ...map.map((m) => m.sightings));
    const shown = all ? items : items.slice(0, SHOWN);

    return (
        <section id="spot-collection" className="scroll-mt-4 space-y-3">
            <div className="px-1 flex items-baseline justify-between gap-2">
                <h2 className="flex items-center gap-2 font-semibold text-ink">
                    <Library className="w-4 h-4 text-accent" /> Bộ sưu tập
                </h2>
                {sightings.length > 0 && (
                    <p className="text-sm text-muted">
                        <b className="text-ink">{words}</b> từ · {sightings.length} lần gặp
                    </p>
                )}
            </div>

            {sightings.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-line-strong p-6 text-center">
                    <p className="font-medium text-ink">Chưa có từ nào</p>
                    <p className="mt-1 text-sm text-muted">Mỗi từ bạn bắt gặp ngoài đời sẽ nằm ở đây, kèm câu bạn gặp nó và nơi bạn gặp.</p>
                </div>
            ) : (
                <>
                    <div data-testid="place-map" className="rounded-2xl border border-line bg-surface p-4 space-y-2">
                        <p className="text-xs text-muted">Bạn hay gặp từ ở đâu · bấm để lọc</p>
                        {map.map((m) => (
                            <button
                                key={m.place}
                                type="button"
                                onClick={() => setPlace(place === m.place ? null : m.place)}
                                aria-pressed={place === m.place}
                                className={`w-full flex items-center gap-3 rounded-lg px-2 py-1.5 text-left ${place === m.place ? 'bg-accent/10' : 'hover:bg-surface-2/60'}`}
                            >
                                <span className="w-32 shrink-0 text-sm text-ink truncate">{placeLabel(m.place)}</span>
                                <span className="flex-1 h-2 rounded-full bg-surface-2 overflow-hidden">
                                    <span className="block h-full rounded-full bg-accent/80" style={{ width: `${(m.sightings / most) * 100}%` }} />
                                </span>
                                <span className="w-12 shrink-0 text-right text-xs text-muted tabular-nums">{m.words} từ</span>
                            </button>
                        ))}
                    </div>
                    <ul data-testid="collection" className="space-y-2">
                        {shown.map((c) => {
                            const card = getCard(c.cardId);
                            if (!card) return null;
                            return (
                                <li key={c.cardId} className="rounded-2xl border border-line bg-surface p-4">
                                    <div className="flex items-baseline justify-between gap-2">
                                        <b className="text-ink lowercase">{card.word}</b>
                                        <span className="text-xs text-muted shrink-0">
                                            {c.count > 1 ? `${c.count} lần · ` : ''}
                                            {c.places.map(placeLabel).join(', ')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted">{card.translationHint}</p>
                                    {c.snippets.map((s) => (
                                        <p key={s} className="mt-2 rounded-lg bg-bg px-3 py-2 text-sm italic text-ink-2">
                                            “{s}”
                                        </p>
                                    ))}
                                </li>
                            );
                        })}
                    </ul>
                    {items.length > SHOWN && (
                        <button type="button" onClick={() => setAll(!all)} className="w-full h-10 rounded-xl border border-line text-sm text-muted hover:text-ink">
                            {all ? 'Thu gọn' : `Xem cả ${items.length} từ`}
                        </button>
                    )}
                </>
            )}
        </section>
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
