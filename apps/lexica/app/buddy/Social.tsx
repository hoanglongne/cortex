'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarClock, Eye, EyeOff, Gift, Loader2, MessageCircleQuestion, Shield, Swords, Plus } from 'lucide-react';
import { getCard, getDeckCards } from '../lib/content/repository';
import { useLexicaStore } from '../store/lexicaStore';
import { capture } from '../lib/productAnalytics';
import { localDate } from '../lib/engagement/ghost';
import { DUEL_MAX, DUEL_MIN, duelCreate, duelGameQuestions } from '../lib/duels';
import type { BuddyInfo } from '../lib/buddy';
import {
    buddyHideWords,
    buddyWordsFeed,
    cleanNote,
    dateCancel,
    dateCheckin,
    dateCreate,
    dateIcs,
    dateList,
    dateSlots,
    dateStatus,
    giftInbox,
    giftOpen,
    giftReport,
    giftSend,
    askAnswer,
    askInbox,
    askReport,
    askSend,
    ASK_MAX,
    milestone,
    rememberGift,
    teamWords,
    type AsksBox,
    GIFT_NOTE_MAX,
    noteProblem,
    questLine,
    shieldGive,
    type GiftsBox,
    type Quest,
    type StudyDate,
    type WordsFeed,
} from '../lib/buddySocial';
import { useKnownWords } from './DuelsSection';

const wordOf = (id: string) => getCard(id)?.word ?? null;
const errText = (e: unknown) => (e instanceof Error ? e.message : String(e));

/** "Hôm nay bạn học gì": the words my buddies learned today, and a switch to hide mine. */
export function TodayWordsCard({ reloadKey }: { reloadKey: number }) {
    const queueCards = useLexicaStore((s) => s.queueCards);
    const [feed, setFeed] = useState<WordsFeed | null>(null);
    const [msg, setMsg] = useState('');
    useEffect(() => {
        let live = true;
        buddyWordsFeed().then((f) => live && setFeed(f), () => live && setFeed({ hidden: false, items: [] }));
        return () => {
            live = false;
        };
    }, [reloadKey]);
    if (!feed) return null;
    const items = feed.items.filter((it) => it.words.some((id) => wordOf(id)));
    const toggle = async () => {
        const next = !feed.hidden;
        setFeed({ ...feed, hidden: next });
        try {
            await buddyHideWords(next);
        } catch (e) {
            setFeed({ ...feed });
            setMsg(errText(e));
        }
    };
    const hideSwitch = (
        <button onClick={() => void toggle()} className="flex items-center gap-1 text-xs text-muted hover:text-ink" aria-pressed={feed.hidden}>
            {feed.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} {feed.hidden ? 'Đang ẩn từ của bạn' : 'Bạn bè thấy từ của bạn'}
        </button>
    );
    // No buddy learned anything yet: just the switch, no empty card
    if (items.length === 0) return <div className="flex justify-end px-1">{hideSwitch}</div>;
    return (        <section className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex items-center justify-between gap-2">
                <h2 className="font-semibold text-ink">Hôm nay bạn học gì</h2>
                {hideSwitch}
            </div>
            {items.length === 0 ? (
                <p className="mt-2 text-sm text-muted">Chưa bạn nào học từ mới hôm nay. Khi họ học, các từ hiện ở đây và bạn học theo được.</p>
            ) : (
                <ul className="mt-2 space-y-3">
                    {items.map((it) => {
                        const words = it.words.map((id) => ({ id, w: wordOf(id) })).filter((x): x is { id: string; w: string } => Boolean(x.w));
                        return (
                            <li key={it.user_id}>
                                <p className="text-sm text-ink">
                                    <span className="font-semibold">{it.name ?? 'Bạn học'}</span> <span className="text-muted">học {words.length} từ</span>
                                </p>
                                <div className="mt-1.5 flex flex-wrap gap-1.5">
                                    {words.slice(0, 12).map((x) => (
                                        <span key={x.id} lang="en" className="rounded-lg border border-line bg-surface-2/50 px-2 py-0.5 text-sm text-ink-2">
                                            {x.w}
                                        </span>
                                    ))}
                                </div>
                                <button
                                    onClick={() => {
                                        const n = queueCards(words.map((x) => x.id));
                                        capture('buddy_learn_too', { words: words.length, queued: n });
                                        setMsg(n > 0 ? `Đã thêm ${n} từ vào hàng học của bạn.` : 'Bạn đã có hoặc đã biết các từ này rồi.');
                                    }}
                                    className="mt-2 h-8 rounded-lg border border-line px-3 text-xs font-semibold text-accent hover:border-accent/50"
                                >
                                    Mình cũng học
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
            {msg && <p className="mt-2 text-xs text-accent">{msg}</p>}
        </section>
    );
}

/** Gifts I got (open one to add the word to my learning) and what I sent. */
export function GiftsCard({ reloadKey }: { reloadKey: number }) {
    const queueCards = useLexicaStore((s) => s.queueCards);
    const [box, setBox] = useState<GiftsBox | null>(null);
    const [msg, setMsg] = useState('');
    const load = useCallback(() => giftInbox().then(setBox, () => setBox({ received: [], sent: [] })), []);
    useEffect(() => {
        const t = setTimeout(() => void load(), 0);
        return () => clearTimeout(t);
    }, [load, reloadKey]);
    if (!box || (box.received.length === 0 && box.sent.length === 0)) return null;
    const open = async (id: string, card: string, from: string | null) => {
        try {
            await giftOpen(id);
            rememberGift(card, from ?? 'bạn học');
            const n = queueCards([card]);
            capture('buddy_gift_opened', { queued: n });
            setMsg(n > 0 ? 'Đã thêm từ vào hàng học của bạn.' : 'Từ này bạn đã có rồi.');
            void load();
        } catch (e) {
            setMsg(errText(e));
        }
    };
    return (
        <section className="rounded-2xl border border-line bg-surface p-4">
            <h2 className="flex items-center gap-2 font-semibold text-ink">
                <Gift className="w-4 h-4 text-accent" /> Quà từ vựng
            </h2>
            <ul className="mt-2 divide-y divide-line">
                {box.received.slice(0, 6).map((g) => (
                    <li key={g.id} className="py-2.5">
                        <div className="flex items-center justify-between gap-3">
                            <p className="min-w-0 text-sm text-ink">
                                <span className="font-semibold">{g.from_name ?? 'Bạn học'}</span> tặng bạn từ <span lang="en" className="font-semibold text-accent">{wordOf(g.card_id) ?? '...'}</span>
                            </p>
                            <button onClick={() => void open(g.id, g.card_id, g.from_name)} className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold ${g.opened ? 'border border-line text-ink-2' : 'bg-accent text-on-accent'}`}>
                                {g.opened ? 'Thêm lại' : 'Nhận'}
                            </button>
                        </div>
                        {g.note && <p className="mt-1 text-xs text-muted">“{g.note}”</p>}
                        {g.note && (
                            <button onClick={() => void giftReport(g.id).then(load)} className="mt-1 text-[11px] text-subtle hover:text-danger">
                                Báo cáo lời nhắn
                            </button>
                        )}
                    </li>
                ))}
            </ul>
            {box.sent.length > 0 && (
                <p className="mt-2 text-xs text-muted">
                    Bạn đã tặng {box.sent.length} từ gần đây, {box.sent.filter((s) => s.opened).length} từ đã được nhận.
                </p>
            )}
            {msg && <p className="mt-1 text-xs text-accent">{msg}</p>}
        </section>
    );
}

/** Under a buddy card: give a word, or pick words to quiz the buddy with. */
export function GivePanel({ buddy, onDone }: { buddy: BuddyInfo; onDone: () => void }) {
    const router = useRouter();
    const known = useKnownWords();
    const [mode, setMode] = useState<'gift' | 'quiz' | 'ask' | null>(null);
    const [picked, setPicked] = useState<string[]>([]);
    const [note, setNote] = useState('');
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState('');
    const choices = useMemo(() => known.filter((id) => wordOf(id)).slice(0, 24), [known]);
    const pick = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : mode === 'gift' || mode === 'ask' ? [id] : p.length < DUEL_MAX - 2 ? [...p, id] : p));
    const start = (m: 'gift' | 'quiz' | 'ask') => {
        setMode(m);
        setPicked([]);
        setMsg('');
    };
    const send = async () => {
        setBusy(true);
        setMsg('');
        try {
            if (mode === 'gift') {
                await giftSend(buddy.id, picked[0], note);
                capture('buddy_gift_sent', { note: Boolean(cleanNote(note)) });
                setMsg(`Đã tặng ${wordOf(picked[0])} cho ${buddy.nickname}.`);
                setMode(null);
                onDone();
            } else if (mode === 'ask') {
                await askSend(buddy.id, picked[0]);
                capture('buddy_ask_sent', {});
                setMsg(`Đã nhờ ${buddy.nickname} đặt câu với từ ${wordOf(picked[0])}.`);
                setMode(null);
                onDone();
            } else {
                const qs = duelGameQuestions('words', picked, getDeckCards(), picked.length);
                if (qs.length < DUEL_MIN) throw new Error(`Chọn thêm từ: mới ra được ${qs.length} câu, cần ít nhất ${DUEL_MIN}.`);
                const r = await duelCreate(buddy.id, qs);
                capture('buddy_quiz_sent', { words: picked.length });
                router.push(`/buddy/duel/${r.id}`);
            }
        } catch (e) {
            setMsg(errText(e));
        } finally {
            setBusy(false);
        }
    };
    const problem = mode === 'gift' ? noteProblem(note) : null;
    const ready = mode === 'gift' || mode === 'ask' ? picked.length === 1 && !problem : picked.length >= DUEL_MIN;
    return (
        <div className="mt-2">
            <div className="flex gap-2">
                <button onClick={() => start('gift')} aria-pressed={mode === 'gift'} className={`h-9 whitespace-nowrap rounded-lg border px-2.5 text-sm flex items-center gap-1.5 ${mode === 'gift' ? 'border-accent/50 bg-accent/10 text-accent' : 'border-line text-ink-2'}`}>
                    <Gift className="w-4 h-4" /> Tặng từ
                </button>
                <button onClick={() => start('ask')} aria-pressed={mode === 'ask'} className={`h-9 whitespace-nowrap rounded-lg border px-2.5 text-sm flex items-center gap-1.5 ${mode === 'ask' ? 'border-accent/50 bg-accent/10 text-accent' : 'border-line text-ink-2'}`}>
                    <MessageCircleQuestion className="w-4 h-4" /> Nhờ đặt câu
                </button>
                <button onClick={() => start('quiz')} aria-pressed={mode === 'quiz'} className={`h-9 whitespace-nowrap rounded-lg border px-2.5 text-sm flex items-center gap-1.5 ${mode === 'quiz' ? 'border-accent/50 bg-accent/10 text-accent' : 'border-line text-ink-2'}`}>
                    <Swords className="w-4 h-4" /> Đố bạn
                </button>
            </div>
            {mode && (
                <div className="mt-2 rounded-xl border border-line bg-surface-2/40 p-3 space-y-2">
                    <p className="text-xs text-muted">{mode === 'gift' ? 'Chọn một từ bạn đã học để tặng.' : mode === 'ask' ? `Chọn một từ bạn muốn thấy ${buddy.nickname} đặt câu.` : `Chọn ${DUEL_MIN} đến ${DUEL_MAX - 2} từ để ra đề cho ${buddy.nickname}.`}</p>
                    {choices.length === 0 ? (
                        <p className="text-xs text-warning">Bạn chưa học từ nào. Học vài từ rồi quay lại nhé.</p>
                    ) : (
                        <div className="flex flex-wrap gap-1.5">
                            {choices.map((id) => (
                                <button key={id} onClick={() => pick(id)} aria-pressed={picked.includes(id)} lang="en" className={`rounded-lg border px-2 py-1 text-sm ${picked.includes(id) ? 'border-accent bg-accent/15 text-accent' : 'border-line text-ink-2'}`}>
                                    {wordOf(id)}
                                </button>
                            ))}
                        </div>
                    )}
                    {mode === 'gift' && (
                        <label className="block">
                            <span className="sr-only">Lời nhắn</span>
                            <input value={note} onChange={(e) => setNote(e.target.value.slice(0, GIFT_NOTE_MAX))} placeholder="Một dòng nhắn (không bắt buộc)" maxLength={GIFT_NOTE_MAX} className="h-9 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink" />
                            <span className="text-[11px] text-subtle">{note.length}/{GIFT_NOTE_MAX}. Không gửi đường dẫn hay email.</span>
                        </label>
                    )}
                    <button onClick={() => void send()} disabled={!ready || busy} className="h-9 w-full rounded-lg bg-accent text-sm font-bold text-on-accent disabled:opacity-40 flex items-center justify-center gap-1.5">
                        {busy && <Loader2 className="w-4 h-4 animate-spin" />} {mode === 'gift' ? 'Tặng' : mode === 'ask' ? 'Nhờ bạn ấy' : `Ra đề (${picked.length})`}
                    </button>
                    {problem && <p className="text-xs text-danger">{problem}</p>}
                </div>
            )}
            {msg && <p className={`mt-1.5 text-xs ${mode ? 'text-danger' : 'text-accent'}`}>{msg}</p>}
        </div>
    );
}

/** The week's monster: the group's damage, and who can be shielded. */
export function QuestCard({ quest, last, meId, today, days, onShield }: { quest: Quest; last: Quest | null; meId: string; today: string; days: string[]; onShield: () => void }) {
    const [msg, setMsg] = useState('');
    const [total, setTotal] = useState<number | null>(null);
    useEffect(() => {
        let live = true;
        teamWords().then((t) => live && setTotal(Number(t.total)), () => undefined);
        return () => {
            live = false;
        };
    }, [quest.members.length]);
    const ms = total === null || quest.members.length < 2 ? null : milestone(total);
    const pct = Math.round((1 - quest.left) * 100);
    const shield = async (id: string) => {
        // The latest day so far not yet covered for this person and is not shielded yet
        const m = quest.members.find((x) => x.id === id);
        const day = [...days].filter((d) => d <= today).reverse().find((d) => !m?.shielded.includes(d));
        if (!day) return;
        try {
            await shieldGive(id, day);
            capture('buddy_shield', {});
            setMsg('Đã đỡ một ngày cho bạn ấy.');
            onShield();
        } catch (e) {
            setMsg(errText(e));
        }
    };
    return (
        <section className={`rounded-2xl border p-4 ${quest.state === 'won' ? 'border-accent/40 bg-accent/5' : 'border-line bg-surface'}`}>
            <div className="flex items-center justify-between gap-2">
                <h2 className="font-semibold text-ink">Mục tiêu cả nhóm tuần này</h2>
                <span className="font-mono text-xs text-muted">{Math.min(quest.damage, quest.hp)}/{quest.hp} điểm</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Tiến độ của nhóm">
                <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-2 text-sm text-ink-2">{questLine(quest)}</p>
            {last?.state === 'won' && <p className="mt-1 text-xs text-accent">Tuần trước cả nhóm đã đạt mục tiêu.</p>}
            <ul className="mt-3 space-y-1.5">
                {quest.members.map((m) => (
                    <li key={m.id} className="flex items-center gap-3 text-sm">
                        <span className="flex-1 truncate text-ink">{m.id === meId ? `${m.name} (bạn)` : m.name}</span>
                        <span className="font-mono text-xs text-muted">{m.damage} điểm{m.shielded.length ? ` · được đỡ ${m.shielded.length} ngày` : ''}</span>
                        {m.id !== meId && quest.state === 'fighting' && (
                            <button onClick={() => void shield(m.id)} aria-label={`Đỡ một ngày cho ${m.name}`} title="Mỗi tuần bạn đỡ được một ngày cho một bạn" className="h-7 w-7 rounded-lg border border-line text-ink-2 hover:border-accent/50 flex items-center justify-center">
                                <Shield className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </li>
                ))}
            </ul>
            {ms && total !== null && (
                <p className="mt-2 text-xs text-ink-2">
                    Cùng nhau đã học <span className="font-semibold text-accent">{total}</span> từ{ms.passed ? ` (qua mốc ${ms.passed})` : ''}
                    {ms.next ? `. Còn ${ms.next - total} từ nữa tới mốc ${ms.next}.` : '.'}
                </p>
            )}
            {quest.members.length > 1 && <p className="mt-2 text-[11px] text-subtle">Mỗi ngày: tối đa 10 điểm cho từ mới, 15 điểm khi đạt mục tiêu ngày. Mỗi tuần bạn đỡ được một ngày cho một bạn (tính như ngày đó đã đạt).</p>}
            {msg && <p className="mt-1 text-xs text-accent">{msg}</p>}
        </section>
    );
}

/** Study dates: book a time with a buddy; during the window both tap "vào học". */
export function DatesCard({ buddies, reloadKey }: { buddies: BuddyInfo[]; reloadKey: number }) {
    const router = useRouter();
    const [list, setList] = useState<StudyDate[] | null>(null);
    const [adding, setAdding] = useState(false);
    const [who, setWho] = useState('');
    const [msg, setMsg] = useState('');
    const [now, setNow] = useState(() => Date.now());
    const load = useCallback(() => dateList().then(setList, () => setList([])), []);
    useEffect(() => {
        const t = setTimeout(() => void load(), 0);
        const tick = setInterval(() => setNow(Date.now()), 30_000);
        return () => {
            clearTimeout(t);
            clearInterval(tick);
        };
    }, [load, reloadKey]);
    if (!list) return null;
    const slots = dateSlots(new Date(now));
    const book = async (at: Date) => {
        const buddy = who || buddies[0]?.id;
        if (!buddy) return;
        try {
            await dateCreate(buddy, at);
            capture('buddy_date_created', {});
            setAdding(false);
            setMsg('');
            void load();
        } catch (e) {
            setMsg(errText(e));
        }
    };
    const shown = list.filter((d) => dateStatus(d, now) !== 'missed' || now - Date.parse(d.at) < 24 * 3_600_000);
    const download = (d: StudyDate) => {
        const url = URL.createObjectURL(new Blob([dateIcs(d, d.with_name ?? 'bạn học')], { type: 'text/calendar' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lexica-hoc-chung.ics';
        a.click();
        URL.revokeObjectURL(url);
    };
    return (
        <section className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-semibold text-ink">
                    <CalendarClock className="w-4 h-4 text-accent" /> Giờ học chung
                </h2>
                {buddies.length > 0 && (
                    <button onClick={() => setAdding((v) => !v)} className="flex items-center gap-1 text-sm text-accent">
                        <Plus className="w-4 h-4" /> Hẹn giờ
                    </button>
                )}
            </div>
            {adding && (
                <div className="mt-2 space-y-2 rounded-xl border border-line bg-surface-2/40 p-3">
                    {buddies.length > 1 && (
                        <select value={who || buddies[0].id} onChange={(e) => setWho(e.target.value)} aria-label="Hẹn với" className="h-9 w-full rounded-lg border border-line bg-surface px-2 text-sm text-ink">
                            {buddies.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.nickname}
                                </option>
                            ))}
                        </select>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                        {slots.map((s) => (
                            <button key={s.label} onClick={() => void book(s.at)} className="h-8 rounded-lg border border-line px-2.5 text-xs text-ink-2 hover:border-accent/50">
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {shown.length === 0 ? (
                <p className="mt-2 text-sm text-muted">{buddies.length === 0 ? 'Kết bạn rồi hẹn nhau học cùng một giờ.' : 'Chưa có hẹn. Hẹn một giờ, đến giờ cả hai vào học thì tính là học cùng nhau.'}</p>
            ) : (
                <ul className="mt-2 divide-y divide-line">
                    {shown.map((d) => {
                        const st = dateStatus(d, now);
                        const when = new Date(d.at);
                        return (
                            <li key={d.id} className="py-2.5">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="min-w-0 text-sm text-ink">
                                        <span className="font-semibold">{d.with_name ?? 'Bạn học'}</span>
                                        <span className="block text-xs text-muted">
                                            {when.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' })} {when.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ·{' '}
                                            {st === 'together' ? 'Đã học cùng nhau' : st === 'missed' ? 'Không kịp học cùng' : st === 'open' ? (d.their_in ? `${d.with_name ?? 'Bạn ấy'} đang học` : 'Đến giờ rồi') : 'Sắp tới'}
                                        </span>
                                    </p>
                                    {st === 'open' && !d.my_in && (
                                        <button
                                            onClick={async () => {
                                                try {
                                                    await dateCheckin(d.id);
                                                    capture('buddy_date_checkin', { both: Boolean(d.their_in) });
                                                    router.push('/today');
                                                } catch (e) {
                                                    setMsg(errText(e));
                                                }
                                            }}
                                            className="shrink-0 rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-on-accent"
                                        >
                                            Vào học
                                        </button>
                                    )}
                                    {st === 'soon' && (
                                        <span className="flex shrink-0 gap-3 text-xs">
                                            <button onClick={() => download(d)} className="text-accent">
                                                Thêm vào lịch
                                            </button>
                                            <button onClick={() => void dateCancel(d.id).then(load)} className="text-subtle hover:text-danger">
                                                Huỷ
                                            </button>
                                        </span>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
            {msg && <p className="mt-1 text-xs text-danger">{msg}</p>}
        </section>
    );
}

/** Words my buddies asked me to use in a sentence, and the sentences I got back for mine. */
export function AsksCard({ reloadKey }: { reloadKey: number }) {
    const [box, setBox] = useState<AsksBox | null>(null);
    const [text, setText] = useState<Record<string, string>>({});
    const [msg, setMsg] = useState('');
    const load = useCallback(() => askInbox().then(setBox, () => setBox({ to_answer: [], answers: [], waiting: 0 })), []);
    useEffect(() => {
        const t = setTimeout(() => void load(), 0);
        return () => clearTimeout(t);
    }, [load, reloadKey]);
    if (!box || (box.to_answer.length === 0 && box.answers.length === 0 && box.waiting === 0)) return null;
    const answer = async (id: string) => {
        const t = text[id] ?? '';
        const problem = noteProblem(t);
        if (problem) return setMsg(problem);
        try {
            await askAnswer(id, t);
            capture('buddy_ask_answered', {});
            setMsg('Đã gửi câu của bạn.');
            void load();
        } catch (e) {
            setMsg(errText(e));
        }
    };
    return (
        <section className="rounded-2xl border border-line bg-surface p-4">
            <h2 className="flex items-center gap-2 font-semibold text-ink">
                <MessageCircleQuestion className="w-4 h-4 text-accent" /> Đặt câu cho nhau
            </h2>
            <ul className="mt-2 divide-y divide-line">
                {box.to_answer.map((a) => (
                    <li key={a.id} className="py-2.5 space-y-1.5">
                        <p className="text-sm text-ink">
                            <span className="font-semibold">{a.from_name ?? 'Bạn học'}</span> nhờ bạn đặt một câu với từ <span lang="en" className="font-semibold text-accent">{wordOf(a.card_id) ?? '...'}</span>
                        </p>
                        <div className="flex gap-2">
                            <input value={text[a.id] ?? ''} onChange={(e) => setText({ ...text, [a.id]: e.target.value.slice(0, ASK_MAX) })} placeholder="Câu của bạn" maxLength={ASK_MAX} lang="en" aria-label="Câu của bạn" className="h-9 min-w-0 flex-1 rounded-lg border border-line bg-surface px-3 text-sm text-ink" />
                            <button onClick={() => void answer(a.id)} disabled={(text[a.id] ?? '').trim().length < 3} className="h-9 rounded-lg bg-accent px-3 text-xs font-bold text-on-accent disabled:opacity-40">
                                Gửi
                            </button>
                        </div>
                    </li>
                ))}
                {box.answers.slice(0, 5).map((a) => (
                    <li key={a.id} className="py-2.5">
                        <p className="text-xs text-muted">
                            {a.from_name ?? 'Bạn học'} đặt câu với <span lang="en">{wordOf(a.card_id) ?? '...'}</span>:
                        </p>
                        <p lang="en" className="mt-0.5 text-sm text-ink">“{a.answer}”</p>
                        <button onClick={() => void askReport(a.id).then(load)} className="mt-1 text-[11px] text-subtle hover:text-danger">
                            Báo cáo
                        </button>
                    </li>
                ))}
            </ul>
            {box.waiting > 0 && <p className="text-xs text-muted">Đang chờ {box.waiting} câu trả lời từ bạn bè.</p>}
            {msg && <p className="mt-1 text-xs text-accent">{msg}</p>}
        </section>
    );
}
