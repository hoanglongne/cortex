'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, ChevronDown, ClipboardPaste, Eye, ScanSearch } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { getAllCards, getCard, getPassages, getQuotes, sameWordIds, useContentVersion } from '../lib/content/repository';
import { localDate } from '../lib/engagement/ghost';
import { spotWords } from '../lib/journey/outside';
import { collection, huntCaught, pickHunt, placeLabel, placeMap, PLACES, snippetAround, weekOf, type PlaceId } from '../lib/journey/sightings';

/**
 * "Bắt gặp" (lib/journey/sightings.ts): learned words met outside the app.
 * One quiet page, in the order a learner meets it:
 * - Tuần này: five learned words to look out for; "Gặp rồi" asks where.
 * - Quét một đoạn: paste (or share, on Android) something met outside, see
 *   the learned words in it in any form; a sample shows how.
 * - Đã gặp: every word caught, with the sentence and where, filterable.
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

const label = 'font-mono text-[11px] uppercase tracking-wider text-subtle';
const chip = (on: boolean) => `h-8 px-3 shrink-0 rounded-full border text-xs ${on ? 'border-accent/40 bg-accent/12 text-accent' : 'border-line text-ink-2 hover:border-line-strong'}`;

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
            <div className="max-w-xl mx-auto space-y-6">
                <div>
                    <Link href="/practice" className="text-muted hover:text-accent text-sm">
                        ← Luyện
                    </Link>
                    <h1 className="mt-3 text-xl font-semibold text-ink">Bắt gặp</h1>
                    <p className="mt-1 text-sm text-muted">Gặp lại từ đã học ở ngoài app: trong tin nhắn, video, bài đọc. Mỗi lần gặp, từ lên bước Gặp.</p>
                </div>
                {hasWords ? (
                    <>
                        <HuntSection />
                        <ScanSection initial={shared} />
                        <CollectionSection />
                    </>
                ) : (
                    <p className="rounded-2xl border border-line bg-surface p-4 text-sm text-muted">Học vài từ trước đã, rồi quay lại để ý chúng ngoài đời.</p>
                )}
            </div>
        </div>
    );
}

function PlaceChips({ onPick, value = null }: { onPick: (p: PlaceId) => void; value?: PlaceId | null }) {
    return (
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Bạn gặp ở đâu">
            {PLACES.map((p) => (
                <button key={p.id} type="button" aria-pressed={value === p.id} onClick={() => onPick(p.id)} className={chip(value === p.id)}>
                    {p.label}
                </button>
            ))}
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

    // A new week (or a first visit) gets its five words.
    useEffect(() => {
        if (hunt?.week === week) return;
        const caughtBefore = new Set(sightings.map((s) => wordId(s.cardId)));
        const seed = Number(week.replace(/-/g, '')) % 997;
        const cardIds = pickHunt(journeys, wordOf, (id) => caughtBefore.has(wordId(id)), seed);
        if (cardIds.length) setHunt({ week, cardIds });
    }, [hunt?.week, week, journeys, sightings, setHunt]);

    if (!hunt || hunt.week !== week) return <div className="h-60 rounded-2xl bg-surface animate-pulse" />;

    const caught = huntCaught(hunt, sightings, wordId);
    const since = new Date(`${hunt.week}T00:00:00`).getTime();
    const placeOf = (id: string) => sightings.find((s) => wordId(s.cardId) === wordId(id) && s.at >= since)?.place;
    const [y, m, d] = today.split('-').map(Number);
    const daysLeft = 7 - ((new Date(y, m - 1, d).getDay() + 6) % 7);

    return (
        <section id="spot-hunt" data-testid="hunt" className="scroll-mt-4">
            <div className="mb-2 flex items-baseline justify-between gap-2 px-1">
                <p className={label}>Để ý tuần này</p>
                <p className="text-xs text-muted">còn {daysLeft} ngày</p>
            </div>
            <div className="rounded-2xl border border-line bg-surface overflow-hidden">
                <div className="px-4 pt-4 pb-3 flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-accent/12 text-accent flex items-center justify-center shrink-0">
                        <Eye className="w-4 h-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-ink">
                            Đã gặp <b className="text-accent">{caught.size}</b> trên {hunt.cardIds.length} từ
                        </p>
                        <div className="mt-1.5 h-1.5 rounded-full bg-surface-3 overflow-hidden">
                            <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${(caught.size / hunt.cardIds.length) * 100}%` }} />
                        </div>
                    </div>
                </div>
                <ul className="divide-y divide-line border-t border-line">
                    {hunt.cardIds.map((id) => {
                        const card = getCard(id);
                        if (!card) return null;
                        const got = caught.has(id);
                        const where = got ? placeOf(id) : undefined;
                        return (
                            <li key={id} className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${got ? 'bg-accent text-on-accent' : 'border border-line-strong'}`}>
                                        {got && <Check className="w-3.5 h-3.5" />}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className={`text-sm font-medium lowercase ${got ? 'text-ink-2' : 'text-ink'}`}>{card.word}</p>
                                        <p className="text-xs text-muted truncate">{got ? `Đã gặp${where ? ` · ${placeLabel(where)}` : ''}` : card.translationHint}</p>
                                    </div>
                                    {!got && (
                                        <button
                                            type="button"
                                            onClick={() => setOpen(open === id ? null : id)}
                                            aria-expanded={open === id}
                                            className={`h-8 px-3 shrink-0 rounded-lg border text-xs font-medium ${open === id ? 'border-accent bg-accent/12 text-accent' : 'border-accent/40 text-accent hover:bg-accent/10'}`}
                                        >
                                            Gặp rồi
                                        </button>
                                    )}
                                </div>
                                {open === id && !got && (
                                    <div className="mt-3 ml-9 space-y-2">
                                        <p className="text-xs text-muted">Ở đâu?</p>
                                        <PlaceChips
                                            onPick={(place) => {
                                                recordSightings([{ cardId: id, at: Date.now(), place }]);
                                                setOpen(null);
                                            }}
                                        />
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>
            {caught.size === hunt.cardIds.length && <p className="mt-2 px-1 text-xs text-accent">Đủ cả tuần này. Thứ Hai có 5 từ mới.</p>}
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
    const showText = text.trim() !== '' && spotted.length > 0 && !editing;

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
                return { cardId, at, place: place ?? 'other', snippet: snippetAround(text, first.start, first.end) };
            }),
        );
        setSaved(ids.length);
    };
    const link = 'text-xs text-muted hover:text-ink';
    const action = 'h-8 px-3 rounded-lg border border-accent/40 text-xs font-medium text-accent hover:bg-accent/10 flex items-center gap-1.5';

    return (
        <section id="spot-scan" className="scroll-mt-4">
            <p className={`mb-2 px-1 ${label}`}>Quét một đoạn</p>
            <div className="rounded-2xl border border-line bg-surface p-4 space-y-3">
                {!text.trim() && (
                    <p className="flex items-start gap-2 text-sm text-ink-2">
                        <ScanSearch className="w-4 h-4 mt-0.5 text-accent shrink-0" /> Đọc được gì bằng tiếng Anh? Dán vào đây, app tìm từ bạn đã học, kể cả khi đổi dạng.
                    </p>
                )}
                {showText ? (
                    <div data-testid="spot-result" className="max-h-72 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-ink-2">
                        <Highlighted text={text} spans={spotted} />
                    </div>
                ) : (
                    <textarea
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value);
                            setSaved(null);
                            setSampleUsed(false);
                        }}
                        autoFocus={editing}
                        rows={4}
                        maxLength={5000}
                        placeholder="Email, caption, lời bài hát…"
                        aria-label="Đoạn văn"
                        className="w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-subtle outline-none focus:border-accent"
                    />
                )}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    {!text.trim() && (
                        <button type="button" onClick={() => void paste()} className={action}>
                            <ClipboardPaste className="w-3.5 h-3.5" /> Dán
                        </button>
                    )}
                    {sample && !text.trim() && (
                        <button type="button" onClick={() => edit(sample, true)} className="text-xs text-muted hover:text-ink underline underline-offset-2">
                            Xem thử với đoạn mẫu
                        </button>
                    )}
                    {text.trim() && spotted.length > 0 && (
                        <button type="button" onClick={() => setEditing(!editing)} className={link}>
                            {editing ? 'Xem từ tìm được' : 'Sửa đoạn'}
                        </button>
                    )}
                    {text.trim() && (
                        <button type="button" onClick={() => edit('')} className={link}>
                            Xoá
                        </button>
                    )}
                </div>

                {text.trim() && (
                    <div className="border-t border-line pt-3">
                        {spotted.length === 0 ? (
                            <p data-testid={showText ? undefined : 'spot-result'} className="text-sm text-muted">
                                Chưa thấy từ nào bạn đã học trong đoạn này.
                            </p>
                        ) : sampleUsed ? (
                            <p className="text-sm text-muted">
                                Đoạn mẫu có {ids.length} từ của bạn: <span className="text-ink">{words.join(', ')}</span>. Đoạn bạn tự gặp mới được lưu lại.
                            </p>
                        ) : saved === null ? (
                            <div className="space-y-3">
                                <p className="text-sm text-ink-2">
                                    Tìm được {ids.length} từ: <span className="text-ink">{words.join(', ')}</span>. Bạn gặp đoạn này ở đâu?
                                </p>
                                <PlaceChips value={place} onPick={setPlace} />
                                <button onClick={save} className="h-10 px-4 rounded-xl bg-accent hover:bg-accent-strong text-on-accent text-sm font-semibold">
                                    Lưu {ids.length} từ đã gặp
                                </button>
                            </div>
                        ) : (
                            <p className="flex items-center gap-1.5 text-sm text-muted">
                                <Check className="w-4 h-4 text-accent" /> Đã lưu {saved} từ.
                            </p>
                        )}
                    </div>
                )}
            </div>
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
    const total = useMemo(() => collection(sightings, wordId).length, [sightings]);
    const shown = all ? items : items.slice(0, SHOWN);

    return (
        <section id="spot-collection" className="scroll-mt-4">
            <div className="mb-2 flex items-baseline justify-between gap-2 px-1">
                <p className={label}>Đã gặp</p>
                {total > 0 && <p className="text-xs text-muted">{total} từ</p>}
            </div>
            {sightings.length === 0 ? (
                <p className="rounded-2xl border border-line bg-surface p-4 text-sm text-muted">Chưa có từ nào. Từ bạn gặp ngoài đời sẽ nằm ở đây, kèm câu và nơi bạn gặp.</p>
            ) : (
                <>
                    {map.length > 1 && (
                        <div data-testid="place-map" className="-mx-4 px-4 mb-2 flex gap-1.5 overflow-x-auto [scrollbar-width:none]" role="group" aria-label="Lọc theo nơi gặp">
                            <button type="button" onClick={() => setPlace(null)} aria-pressed={place === null} className={chip(place === null)}>
                                Tất cả
                            </button>
                            {map.map((m) => (
                                <button key={m.place} type="button" onClick={() => setPlace(place === m.place ? null : m.place)} aria-pressed={place === m.place} className={chip(place === m.place)}>
                                    {placeLabel(m.place)} · {m.words}
                                </button>
                            ))}
                        </div>
                    )}
                    <ul data-testid="collection" className="rounded-2xl border border-line bg-surface divide-y divide-line">
                        {shown.map((c) => {
                            const card = getCard(c.cardId);
                            if (!card) return null;
                            return (
                                <li key={c.cardId} className="px-4 py-3">
                                    <div className="flex items-baseline justify-between gap-3">
                                        <p className="text-sm font-semibold text-accent lowercase">{card.word}</p>
                                        <p className="text-xs text-subtle shrink-0">
                                            {c.places.map(placeLabel).join(', ')}
                                            {c.count > 1 ? ` · ${c.count} lần` : ''}
                                        </p>
                                    </div>
                                    {c.snippets.slice(0, 1).map((s) => (
                                        <p key={s} className="mt-1.5 border-l-2 border-accent/50 pl-2.5 text-xs italic text-ink-2 line-clamp-2">
                                            “{s}”
                                        </p>
                                    ))}
                                    {c.snippets.length === 0 && <p className="text-xs text-muted truncate">{card.translationHint}</p>}
                                </li>
                            );
                        })}
                    </ul>
                    {items.length > SHOWN && (
                        <button type="button" onClick={() => setAll(!all)} className="mt-2 w-full flex items-center justify-center gap-1 text-xs text-muted hover:text-ink">
                            {all ? 'Thu gọn' : `Xem cả ${items.length} từ`} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${all ? 'rotate-180' : ''}`} />
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
            <mark key={s.start} className="rounded bg-accent/30 px-0.5 text-ink font-medium">
                {text.slice(s.start, s.end)}
            </mark>,
        );
        at = s.end;
    }
    parts.push(text.slice(at));
    return <>{parts}</>;
}
