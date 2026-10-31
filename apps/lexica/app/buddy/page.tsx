'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Check, ChevronDown, Copy, Flame, Loader2, LogOut, Pencil, Plus, Share2, Swords, Trophy, UserX, Users, Zap } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useLexicaStore } from '../store/lexicaStore';
import AuthGate from '../components/AuthGate';
import {
    acceptInvite,
    checkAndUpdateDuoStreak,
    createInviteCode,
    getMyBuddies,
    getWeek,
    inviteLink,
    lastDays,
    MAX_BUDDIES,
    nudgeText,
    removeBuddy,
    weekRanking,
    type BuddyInfo,
    type DailyActivity,
} from '../lib/buddy';
import { upsertProfile } from '../lib/auth';
import { localDate } from '../lib/engagement/ghost';
import { DUEL_GAMES, duelInbox, type DuelGame } from '../lib/duels';
import DuelsSection, { useStartDuel } from './DuelsSection';
import { CheerButtons, CheersBanner } from './TeamCard';
import { cheersToday, type CheerKind, type CheersToday } from '../lib/cheers';
import { askInbox, buddyBlock, dateList, dateStatus, giftInbox, questWeek, shiftDate, shieldsTeam, weekDates, weekStart, type Quest, type Shield } from '../lib/buddySocial';
import { capture } from '../lib/productAnalytics';
import { AsksCard, DatesCard, GiftsCard, GivePanel, QuestCard, TodayWordsCard } from './Social';

type Week = Record<string, Record<string, DailyActivity>>;

const DAY_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const weekday = (date: string) => {
    const [y, m, d] = date.split('-').map(Number);
    return DAY_SHORT[new Date(y, m - 1, d, 12).getDay()];
};

/** Shares through the phone's share sheet, or copies when there is none. Returns what happened. */
async function share(text: string, url?: string): Promise<'shared' | 'copied' | 'failed'> {
    try {
        if (navigator.share) {
            await navigator.share(url ? { text, url } : { text });
            return 'shared';
        }
        await navigator.clipboard.writeText(url ? `${text} ${url}` : text);
        return 'copied';
    } catch {
        return 'failed';
    }
}

export default function BuddyPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-bg" />}>
            <Buddy />
        </Suspense>
    );
}

/**
 * Study Buddy: up to five friends learning side by side. Each sees the
 * others' week, keeps a duo streak when both reach the day's goal, can
 * nudge a friend who has not studied yet, and a friendly weekly ranking.
 * Invites go by code or by link (/buddy?code=…).
 */
function Buddy() {
    const params = useSearchParams();
    const { user, profile, loading: authLoading, signOut, refreshProfile } = useAuth();
    const currentStreak = useLexicaStore((s) => s.currentStreak);
    const daysDone = useLexicaStore((s) => s.daysDone);
    const dailyProgress = useLexicaStore((s) => s.dailyProgress);
    const dailyGoal = useLexicaStore((s) => s.dailyGoal);

    const [buddies, setBuddies] = useState<BuddyInfo[]>([]);
    const [week, setWeek] = useState<Week>({});
    const [loading, setLoading] = useState(false);
    const [showAdd, setShowAdd] = useState(() => Boolean(params.get('code')));
    const [editingName, setEditingName] = useState(false);
    const [nameInput, setNameInput] = useState('');
    const [savingName, setSavingName] = useState(false);
    const [today] = useState(() => localDate());

    const goalMet = daysDone.includes(today) || dailyProgress >= dailyGoal;
    const duel = useStartDuel();
    const [duelGame, setDuelGame] = useState<DuelGame>('words');
    const [cheers, setCheers] = useState<CheersToday | null>(null);
    const [shields, setShields] = useState<Shield[]>([]);
    const [social, setSocial] = useState(0);
    const [tab, setTab] = useState<'friends' | 'inbox' | 'week'>('friends');
    const [waiting, setWaiting] = useState(0);

    const load = useCallback(async (userId: string) => {
        setLoading(true);
        try {
            const list = await getMyBuddies(userId);
            setBuddies(list);
            // Two weeks back: this week's monster and last week's result
            setWeek(await getWeek([userId, ...list.map((b) => b.id)], 14));
            shieldsTeam(shiftDate(weekStart(localDate()), -7)).then(setShields, () => undefined);
            capture('buddy_view', { buddies: list.length });
            for (const b of list) void checkAndUpdateDuoStreak(b.pairId, userId, b.id);
            cheersToday().then(setCheers, () => undefined);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!user) return;
        const t = setTimeout(() => void load(user.id), 0);
        return () => clearTimeout(t);
    }, [user, load]);

    // What waits for me in the inbox: gifts to take, sentences to write, duels to play, a date that is on
    useEffect(() => {
        if (!user || buddies.length === 0) return;
        let live = true;
        Promise.allSettled([giftInbox(), askInbox(), duelInbox(), dateList()]).then(([g, a, d, t]) => {
            if (!live) return;
            const gifts = g.status === 'fulfilled' ? g.value.received.filter((x) => !x.opened).length : 0;
            const asks = a.status === 'fulfilled' ? a.value.to_answer.length : 0;
            const duels = d.status === 'fulfilled' ? d.value.filter((x) => x.state === 'open' && !x.i_finished && !x.mine).length : 0;
            const dates = t.status === 'fulfilled' ? t.value.filter((x) => dateStatus(x, Date.now()) === 'open' && !x.my_in).length : 0;
            setWaiting(gifts + asks + duels + dates);
        });
        return () => {
            live = false;
        };
    }, [user, buddies.length, social]);

    const saveName = async () => {
        if (!user || !nameInput.trim()) return;
        setSavingName(true);
        await upsertProfile(user.id, nameInput.trim().slice(0, 20));
        await refreshProfile();
        setSavingName(false);
        setEditingName(false);
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-bg flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-sm bg-surface rounded-2xl p-6 border border-line space-y-6">
                    <div className="text-center space-y-2">
                        <Users className="w-10 h-10 text-accent mx-auto" />
                        <h1 className="text-xl font-bold text-ink">Study Buddy</h1>
                        <p className="text-muted text-sm">Học cùng tối đa 5 người bạn: thấy tuần học của nhau, giữ chuỗi đôi, nhắc nhau mỗi ngày.</p>
                        {params.get('code') && <p className="text-sm text-accent">Đăng nhập để nhận lời mời của bạn.</p>}
                    </div>
                    <AuthGate reason="Cần tài khoản để kết nối với bạn bè." redirectPath={`/buddy${params.get('code') ? `?code=${params.get('code')}` : ''}`} />
                    <Link href="/me" className="block text-center text-muted hover:text-ink text-sm">
                        ← Tôi
                    </Link>
                </div>
            </div>
        );
    }

    const me = { id: user.id, name: profile?.nickname ?? 'Bạn' };
    const ranking = weekRanking([me, ...buddies.map((b) => ({ id: b.id, name: b.nickname }))], week);
    const days = lastDays(7);
    const people = [me, ...buddies.map((b) => ({ id: b.id, name: b.nickname }))];
    const thisMonday = weekStart(today);
    const lastQuest = questWeek({ people, week, dates: weekDates(shiftDate(thisMonday, -7)), shields, ended: true });
    const quest: Quest = questWeek({ people, week, dates: weekDates(thisMonday), shields, me: user.id, forceToday: goalMet ? today : false, });

    return (
        <div className="min-h-screen bg-bg pb-8">
            <div className="max-w-md lg:max-w-2xl mx-auto px-4 lg:px-8 pt-6 space-y-4">
                <div className="flex items-center justify-between">
                    <Link href="/me" className="text-muted hover:text-accent text-sm">
                        ← Tôi
                    </Link>
                    <p className="text-ink font-bold">Study Buddy</p>
                    <button onClick={signOut} className="text-muted hover:text-ink" aria-label="Đăng xuất">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>

                {/* Me: name, streak, today, this week */}
                <section className={`rounded-2xl border p-4 ${goalMet ? 'border-accent/40 bg-accent/5' : 'border-line bg-surface'}`}>
                    <div className="flex items-center justify-between gap-2">
                        {editingName ? (
                            <div className="flex items-center gap-1">
                                <input
                                    autoFocus
                                    value={nameInput}
                                    onChange={(e) => setNameInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') void saveName();
                                        if (e.key === 'Escape') setEditingName(false);
                                    }}
                                    maxLength={20}
                                    aria-label="Tên hiển thị"
                                    className="w-36 h-9 px-2 bg-surface-2 border border-accent rounded-lg text-ink text-sm outline-none"
                                />
                                <button onClick={() => void saveName()} disabled={savingName || !nameInput.trim()} className="p-2 text-accent disabled:opacity-40" aria-label="Lưu tên">
                                    {savingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => {
                                    setNameInput(profile?.nickname ?? '');
                                    setEditingName(true);
                                }}
                                className="flex items-center gap-1.5 font-semibold text-ink hover:text-accent"
                            >
                                {profile?.nickname ?? 'Đặt tên để bạn bè nhận ra'} <Pencil className="w-3.5 h-3.5 text-muted" />
                            </button>
                        )}
                        <span className="flex items-center gap-1 text-sm text-ink-2">
                            <Flame className={`w-4 h-4 ${currentStreak > 0 ? 'text-warning' : 'text-subtle'}`} /> {currentStreak} ngày
                        </span>
                    </div>
                    <p className="mt-1 text-sm text-muted">{goalMet ? 'Hôm nay bạn đã đạt mục tiêu. Bạn bè sẽ thấy điều đó.' : 'Xong phiên Hôm nay là đạt mục tiêu ngày, giữ chuỗi đôi với bạn bè.'}</p>
                    <WeekDots days={days} acts={week[user.id]} today={today} forceToday={goalMet} />
                </section>

                {/* One thing at a time: the friends, what waits in the inbox, the week */}
                <nav className="flex gap-1 rounded-xl border border-line bg-surface p-1" role="tablist" aria-label="Buddy">
                    {([['friends', 'Bạn học'], ['inbox', 'Hộp thư'], ['week', 'Tuần này']] as const).map(([id, label]) => (
                        <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`h-9 flex-1 rounded-lg text-sm font-semibold ${tab === id ? 'bg-accent/12 text-accent' : 'text-ink-2'}`}>
                            {label}
                            {id === 'inbox' && waiting > 0 && <span className="ml-1.5 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-on-accent">{waiting}</span>}
                        </button>
                    ))}
                </nav>

                {tab === 'inbox' && (
                    <div className="space-y-4">
                        <CheersBanner cheers={cheers} />
                        {buddies.length > 0 && <DuelsSection reloadKey={buddies.length + social} startError={duel.error} />}
                        {buddies.length > 0 && <GiftsCard reloadKey={buddies.length + social} />}
                        {buddies.length > 0 && <AsksCard reloadKey={buddies.length + social} />}
                        <DatesCard buddies={buddies} reloadKey={buddies.length} />
                        {buddies.length > 0 && <TodayWordsCard reloadKey={buddies.length + social} />}
                    </div>
                )}

                {tab === 'week' && (
                    <div className="space-y-4">
                        <QuestCard quest={quest} last={lastQuest.members.length > 1 && lastQuest.damage > 0 ? lastQuest : null} meId={user.id} today={today} days={weekDates(thisMonday)} onShield={() => void load(user.id)} />
                {/* Weekly ranking, only with friends */}
                {buddies.length > 0 && (
                    <section className="rounded-2xl border border-line bg-surface p-4">
                        <h2 className="flex items-center gap-2 font-semibold text-ink">
                            <Trophy className="w-4 h-4 text-warning" /> Tuần này
                        </h2>
                        <ol className="mt-2 space-y-1.5">
                            {ranking.map((r, i) => (
                                <li key={r.id} className={`flex items-center gap-3 rounded-lg px-2 py-1.5 ${r.id === user.id ? 'bg-accent/10' : ''}`}>
                                    <span className="w-5 font-mono text-sm text-muted">{i + 1}</span>
                                    <span className="flex-1 truncate text-sm text-ink">{r.id === user.id ? `${r.name} (bạn)` : r.name}</span>
                                    <span className="text-xs text-muted tabular-nums">
                                        {r.days}/7 ngày · {r.words} từ
                                    </span>
                                </li>
                            ))}
                        </ol>
                    </section>
                )}

                    </div>
                )}

                {tab === 'friends' && (
                    <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-ink font-semibold">
                        Bạn học ({buddies.length}/{MAX_BUDDIES})
                    </h2>
                    {buddies.length < MAX_BUDDIES && (
                        <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-1 text-accent text-sm">
                            <Plus className="w-4 h-4" /> Thêm bạn
                        </button>
                    )}
                </div>

                <AnimatePresence>
                    {showAdd && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                            <AddBuddy userId={user.id} initialCode={params.get('code') ?? ''} onAdded={() => void load(user.id)} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {loading && buddies.length === 0 ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 text-accent animate-spin" />
                    </div>
                ) : buddies.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-line-strong p-6 text-center space-y-2">
                        <Users className="w-8 h-8 text-subtle mx-auto" />
                        <p className="text-ink text-sm">Chưa có bạn học nào</p>
                        <p className="text-muted text-xs">Bấm “Thêm bạn”, gửi link mời qua Zalo hoặc Messenger. Bạn ấy mở link là kết nối.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="flex items-center gap-1.5 text-xs" role="group" aria-label="Chọn game thách đấu">
                            <span className="text-muted mr-1">Thách đấu bằng</span>
                            {DUEL_GAMES.map((g) => (
                                <button key={g.id} onClick={() => setDuelGame(g.id)} aria-pressed={duelGame === g.id} className={`h-8 px-3 rounded-lg border font-medium ${duelGame === g.id ? 'bg-accent/12 border-accent/40 text-accent' : 'bg-surface-2/40 border-line-strong/50 text-ink-2'}`}>
                                    {g.label}
                                </button>
                            ))}
                        </div>
                        {buddies.map((b) => (
                            <BuddyCard
                                key={b.id}
                                buddy={b}
                                days={days}
                                week={week[b.id]}
                                today={today}
                                myGoalMet={goalMet}
                                onGift={() => setSocial((n) => n + 1)}
                                onDuel={() => void duel.start(b, duelGame)}
                                cheerSent={cheers?.sent[b.id]}
                                onCheer={(k) => setCheers((c) => ({ received: c?.received ?? [], sent: { ...(c?.sent ?? {}), [b.id]: k } }))}
                                duelBusy={duel.busy === b.id}
                                onBlock={async () => {
                                    await buddyBlock(b.id).catch(() => undefined);
                                    setBuddies((list) => list.filter((x) => x.pairId !== b.pairId));
                                }}
                                onRemove={async () => {
                                    await removeBuddy(b.pairId);
                                    setBuddies((list) => list.filter((x) => x.pairId !== b.pairId));
                                }}
                            />
                        ))}
                    </div>
                )}
                    </div>
                )}
            </div>
        </div>
    );
}

/** Seven days, oldest first: filled when the person studied that day. */
function WeekDots({ days, acts, today, forceToday = false }: { days: string[]; acts: Record<string, DailyActivity> | undefined; today: string; forceToday?: boolean }) {
    return (
        <ol className="mt-3 grid grid-cols-7 gap-1.5" aria-label="7 ngày qua">
            {days.map((d) => {
                const a = acts?.[d];
                const studied = Boolean(a && (a.words_swiped > 0 || a.goal_met)) || (d === today && forceToday);
                const met = Boolean(a?.goal_met) || (d === today && forceToday);
                return (
                    <li key={d} className="flex flex-col items-center gap-1" title={`${weekday(d)} ${Number(d.slice(8))}/${Number(d.slice(5, 7))}: ${met ? 'đạt mục tiêu' : studied ? 'có học' : 'chưa học'}`}>
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center ${met ? 'bg-accent text-on-accent' : studied ? 'bg-accent/30' : 'bg-surface-2'} ${d === today ? 'ring-1 ring-ink-2' : ''}`}>
                            {met && <Check className="w-3.5 h-3.5" />}
                        </span>
                        <span className={`text-[10px] ${d === today ? 'text-ink' : 'text-subtle'}`}>{d === today ? 'Nay' : weekday(d)}</span>
                    </li>
                );
            })}
        </ol>
    );
}

function AddBuddy({ userId, initialCode, onAdded }: { userId: string; initialCode: string; onAdded: () => void }) {
    const [code, setCode] = useState<string | null>(null);
    const [shared, setShared] = useState('');
    const [joinCode, setJoinCode] = useState(initialCode.toUpperCase().slice(0, 6));
    const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
    const [error, setError] = useState('');

    const create = async () => setCode(await createInviteCode(userId));
    const send = async () => {
        if (!code) return;
        const r = await share('Học từ vựng tiếng Anh cùng mình trên Lexica nhé! Mở link để thành bạn học:', inviteLink(code, window.location.origin));
        setShared(r === 'copied' ? 'Đã chép link, dán vào tin nhắn cho bạn nhé.' : r === 'shared' ? 'Đã gửi.' : 'Không gửi được, chép mã ở trên nhé.');
    };
    const join = async () => {
        if (joinCode.length < 6) return;
        setStatus('loading');
        const r = await acceptInvite(joinCode, userId);
        if (r.success) {
            setStatus('success');
            setJoinCode('');
            onAdded();
        } else {
            setStatus('error');
            setError(r.error ?? 'Có lỗi, thử lại nhé.');
        }
    };

    return (
        <div className="rounded-2xl border border-line bg-surface p-4 space-y-4">
            <div className="space-y-2">
                <p className="text-sm text-ink-2">Mời một người bạn</p>
                {code ? (
                    <>
                        <div className="flex gap-2">
                            <div className="flex-1 h-11 rounded-lg bg-surface-2 text-ink font-mono text-lg tracking-widest flex items-center justify-center">{code}</div>
                            <button onClick={() => void navigator.clipboard.writeText(code)} className="h-11 px-3 rounded-lg border border-line text-ink" aria-label="Chép mã">
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>
                        <button onClick={() => void send()} className="w-full h-11 rounded-xl bg-accent text-on-accent font-bold flex items-center justify-center gap-2">
                            <Share2 className="w-4 h-4" /> Gửi link mời
                        </button>
                        <p className="text-xs text-muted text-center">{shared || 'Mã và link dùng được trong 48 giờ, cho một người.'}</p>
                    </>
                ) : (
                    <button onClick={() => void create()} className="w-full h-11 rounded-xl bg-surface-2 hover:bg-surface-3 text-ink text-sm">
                        Tạo link mời
                    </button>
                )}
            </div>
            <div className="border-t border-line" />
            <div className="space-y-2">
                <p className="text-sm text-ink-2">Có mã từ bạn bè?</p>
                <div className="flex gap-2">
                    <input
                        value={joinCode}
                        onChange={(e) => {
                            setJoinCode(e.target.value.toUpperCase());
                            setStatus('idle');
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && void join()}
                        placeholder="ABC123"
                        maxLength={6}
                        aria-label="Mã mời"
                        className="flex-1 h-11 px-4 bg-surface-2 border border-line-strong rounded-lg text-ink font-mono text-center text-lg tracking-widest outline-none focus:border-accent uppercase"
                    />
                    <button onClick={() => void join()} disabled={joinCode.length < 6 || status === 'loading'} className="h-11 px-4 rounded-lg bg-accent text-on-accent font-bold disabled:opacity-40">
                        {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Kết bạn'}
                    </button>
                </div>
                {status === 'error' && <p className="text-danger text-xs">{error}</p>}
                {status === 'success' && <p className="text-accent text-xs">Đã kết nối! Từ giờ hai bạn thấy tuần học của nhau.</p>}
            </div>
        </div>
    );
}

function BuddyCard({ buddy, days, week, today, myGoalMet, onGift, onDuel, duelBusy, cheerSent, onCheer, onBlock, onRemove }: { buddy: BuddyInfo; days: string[]; week: Record<string, DailyActivity> | undefined; today: string; myGoalMet: boolean; onGift: () => void; onDuel: () => void; duelBusy: boolean; cheerSent: CheerKind | undefined; onCheer: (kind: CheerKind) => void; onBlock: () => void; onRemove: () => void }) {
    const [confirm, setConfirm] = useState(false);
    const [more, setMore] = useState(false);
    const [nudged, setNudged] = useState('');
    const buddyMet = Boolean(buddy.today?.goal_met);
    const studied = Boolean(buddy.today && (buddy.today.words_swiped > 0 || buddy.today.goal_met));
    const both = myGoalMet && buddyMet;

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`rounded-2xl border p-4 ${both ? 'border-accent/40 bg-accent/5' : 'border-line bg-surface'}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="font-semibold text-ink truncate">{buddy.nickname}</p>
                    <p className="mt-0.5 flex items-center gap-3 text-xs text-muted">
                        <span className="flex items-center gap-0.5">
                            <Flame className="w-3 h-3 text-warning" /> {buddy.today?.streak ?? 0} ngày
                        </span>
                        <span className={`flex items-center gap-0.5 ${both ? 'text-accent' : ''}`} title="Số ngày cả hai cùng đạt mục tiêu liên tiếp">
                            <Zap className="w-3 h-3" /> chuỗi đôi {buddy.duoStreak}
                        </span>
                    </p>
                </div>
                <span className={`text-xs font-medium ${buddyMet ? 'text-accent' : studied ? 'text-ink-2' : 'text-muted'}`}>{buddyMet ? 'Đạt mục tiêu' : studied ? 'Đang học' : 'Chưa học hôm nay'}</span>
            </div>
            <WeekDots days={days} acts={week} today={today} />
            {both && <p className="mt-3 text-center text-xs font-medium text-accent">Cả hai đều đạt mục tiêu hôm nay: chuỗi đôi +1</p>}
            <div className="mt-3 flex items-center justify-between gap-2">
                <button onClick={onDuel} disabled={duelBusy} className="h-9 px-3 rounded-lg bg-accent text-on-accent text-sm font-bold flex items-center gap-1.5 disabled:opacity-50">
                    {duelBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Swords className="w-4 h-4" />} Thách đấu
                </button>
                <CheerButtons buddyId={buddy.id} sent={cheerSent} onSent={onCheer} />
            </div>
            <button onClick={() => setMore((v) => !v)} aria-expanded={more} className="mt-2 flex items-center gap-1 text-xs text-muted hover:text-ink">
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${more ? 'rotate-180' : ''}`} /> {more ? 'Thu gọn' : 'Tặng từ, đố bạn, nhắc, xoá'}
            </button>
            {more && (
                <div className="mt-1">
                    <GivePanel buddy={buddy} onDone={onGift} />
                    <div className="mt-3 flex items-center justify-between gap-2">
                        {!studied ? (
                            <button
                                onClick={async () => {
                                    const r = await share(nudgeText(buddy.nickname, window.location.origin));
                                    setNudged(r === 'copied' ? 'Đã chép lời nhắc' : r === 'shared' ? 'Đã nhắc' : '');
                                }}
                                className="h-9 px-3 rounded-lg border border-line text-sm text-ink flex items-center gap-1.5 hover:border-line-strong"
                            >
                                <Bell className="w-4 h-4" /> {nudged || 'Nhắc bạn học'}
                            </button>
                        ) : (
                            <span />
                        )}
                        {confirm ? (
                            <span className="flex gap-3 text-xs">
                                <button onClick={() => setConfirm(false)} className="text-muted">
                                    Huỷ
                                </button>
                                <button onClick={onBlock} className="text-muted" title="Gỡ bạn và không cho kết bạn lại">
                                    Chặn
                                </button>
                                <button onClick={onRemove} className="text-danger flex items-center gap-1">
                                    <UserX className="w-3 h-3" /> Xoá bạn này
                                </button>
                            </span>
                        ) : (
                            <button onClick={() => setConfirm(true)} className="text-xs text-subtle hover:text-muted">
                                Xoá hoặc chặn
                            </button>
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
