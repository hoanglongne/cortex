'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { Check, ThumbsDown, ThumbsUp, Volume2, X } from 'lucide-react';
import { compileRules, findHits, type DialHit } from '../lib/dial/match';
import { DIAL_RULES } from '../lib/dial/allRules';
import { pickHits } from '../lib/dial/level';
import { hitText, INTENSITIES, INTENSITY, MODE_LABEL, MODES, ruleKey, type DialIntensity, type DialMode } from '../lib/dial/prefs';
import { VOCAB_DATABASE } from '../data/vocabCards';
import { exampleHtml, tipFacts } from '../lib/dial/tipCard';
import { TOPICS, topicOf } from '../lib/engagement/collection';
import { TOPIC_BLOCK } from '../lib/brand';
import { playText } from '../lib/audio/AudioService';
import { useLexicaStore } from '../store/lexicaStore';
import { dialRank } from '../lib/dial/review';
import { SEEN_MIN_MS, seenWeight } from '../lib/learner/dialSignal';

const INDEX = compileRules(DIAL_RULES);
const CARDS = new Map(VOCAB_DATABASE.map((c) => [c.id, c]));

/**
 * Hits of every paragraph, and which to show, with one density across the
 * whole text. Words the learner marked as known (#163) and hits hidden after
 * a 👎 never show. `cap` is the intensity's per-page cap (#161).
 */
export function useDialParagraphs(paras: string[], level: number, priority?: ReadonlySet<string> | ReadonlyMap<string, number>, cap = Infinity, hidden: ReadonlySet<string> = NONE) {
    const known = useLexicaStore((s) => s.dialKnown);
    return useMemo(() => {
        const hits = paras.map((p) => findHits(p, INDEX).filter((h) => !known?.[h.cardId] && !hidden.has(ruleKey(h.cardId, h.vi))));
        const flat = hits.flat();
        const shown = pickHits(flat, level, priority, cap);
        let k = 0;
        return { hits, shown: hits.map((hs) => hs.map(() => shown.has(k++))), total: flat.length };
    }, [paras, level, priority, cap, hidden, known]);
}
const NONE: ReadonlySet<string> = new Set();

/**
 * One paragraph with the shown hits as buttons (#162): the English word
 * (replace), the Vietnamese phrase underlined with the English hidden until
 * tapped (highlight), or the phrase with the English in brackets (both).
 * Only visible English carries data-dial-card, so "seen" counts only then.
 */
export function DialParagraph({ text, hits, shown, onOpen, mode = 'replace' }: { text: string; hits: DialHit[]; shown: boolean[]; onOpen: (h: DialHit) => void; mode?: DialMode }) {
    const out: ReactNode[] = [];
    let last = 0;
    const src = text.normalize('NFC');
    hits.forEach((h, i) => {
        if (!shown[i]) return;
        out.push(src.slice(last, h.start));
        const t = hitText(mode, src.slice(h.start, h.end), h.en);
        out.push(
            <button
                key={i}
                {...(t.hiddenEn ? {} : { 'data-dial-card': h.cardId })}
                onClick={() => onOpen(h)}
                className={t.hiddenEn ? 'text-ink underline decoration-accent decoration-dotted decoration-2 underline-offset-4' : 'lx-sticker mx-0.5 inline-block bg-accent px-2 py-0 font-semibold leading-snug text-on-accent [box-decoration-break:clone]'}
            >
                {t.text}
            </button>,
        );
        last = h.end;
    });
    out.push(src.slice(last));
    return <>{out}</>;
}

/** Bottom sheet with the original phrase, meaning and sound of a tapped word, and "Đã thuộc" / 👍 / 👎 (#163). */
export function DialSheet({ hit, onClose, effect = 'none', onKnown, onVote }: { hit: DialHit | null; onClose: () => void; effect?: 'due' | 'queued' | 'none'; onKnown?: (h: DialHit) => void; onVote?: (h: DialHit, v: 'up' | 'down') => void }) {
    const [vote, setVote] = useState<{ hit: DialHit; v: 'up' | 'down' } | null>(null);
    if (!hit) return null;
    const voted = vote?.hit === hit ? vote.v : null;
    const setVoted = (v: 'up' | 'down') => setVote({ hit, v });
    const card = CARDS.get(hit.cardId);
    const topic = card ? topicOf(card) : null;
    const facts = card && topic ? tipFacts(card, { label: TOPICS.find((t) => t.id === topic)!.label, color: TOPIC_BLOCK[topic] }) : null;
    const act = 'h-9 px-3 rounded-lg border text-sm flex items-center gap-1.5';
    return (
        <div className="fixed inset-x-0 bottom-0 z-40 p-4 max-w-2xl mx-auto" role="dialog" aria-label={`Nghĩa của ${hit.en}`}>
            <div className="lx-hard max-h-[82vh] overflow-y-auto rounded-[22px] bg-surface p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        {facts && (
                            <div className="mb-2 flex flex-wrap gap-1.5">
                                <span className="lx-sticker whitespace-nowrap px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--on-block)]" style={{ background: facts.tc }}>{facts.tl}</span>
                                {facts.lv && <span className="lx-sticker whitespace-nowrap bg-surface px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ink-2">{facts.lv}</span>}
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <span className="font-display text-3xl font-extrabold leading-none lowercase">{hit.en}</span>
                            <button onClick={() => void playText(hit.en, 'en')} aria-label="Nghe phát âm" className="lx-hard lx-press flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent"><Volume2 className="w-5 h-5" /></button>
                        </div>
                        {facts?.ipa && <p className="mt-1 font-mono text-sm text-muted">/{facts.ipa}/</p>}
                        <p className="mt-3 text-xs text-muted">Trong bài: <b className="text-ink">{hit.vi}</b></p>
                        {facts && <p className="text-base font-bold text-ink">{facts.hint}</p>}
                        {facts && facts.col.length > 0 && (
                            <div className="mt-3">
                                <p className="mb-1.5 whitespace-nowrap font-mono text-[10px] font-bold uppercase tracking-wider text-muted">Cụm hay gặp</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {facts.col.map((p) => (
                                        <button key={p} onClick={() => void playText(p, 'en')} className="lx-soft whitespace-nowrap rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-semibold text-ink">{p}</button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {facts?.ex && (
                            <div className="mt-3">
                                <p className="mb-1.5 whitespace-nowrap font-mono text-[10px] font-bold uppercase tracking-wider text-muted">Ví dụ</p>
                                <p data-prose className="text-sm leading-relaxed text-ink-2 [&_mark]:rounded-md [&_mark]:bg-accent [&_mark]:px-1 [&_mark]:font-bold [&_mark]:lowercase [&_mark]:text-on-accent" dangerouslySetInnerHTML={{ __html: exampleHtml(facts.ex, facts.w) }} />
                            </div>
                        )}
                        {facts && facts.pt.length > 0 && (
                            <div className="mt-3">
                                <p className="mb-1.5 whitespace-nowrap font-mono text-[10px] font-bold uppercase tracking-wider text-muted">Cấu tạo từ</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {facts.pt.map(([t, m]) => (
                                        <span key={t} className="inline-flex items-baseline gap-1.5 whitespace-nowrap rounded-xl bg-surface-2 px-2.5 py-1 text-xs text-muted"><b className="font-mono text-ink">{t}</b>{m}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {effect === 'due' && <p className="text-xs text-accent mt-3">Từ này sẽ vào lượt ôn tới.</p>}
                        {effect === 'queued' && <p className="text-xs text-accent mt-3">Từ này sẽ vào bộ thẻ học tiếp theo.</p>}
                    </div>
                    <button onClick={onClose} aria-label="Đóng" className="p-1 text-muted"><X className="w-5 h-5" /></button>
                </div>
                {(onKnown || onVote) && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
                        {onKnown && (
                            <button onClick={() => onKnown(hit)} className={`${act} border-line text-ink`} data-testid="dial-known">
                                <Check className="w-4 h-4" /> Đã thuộc
                            </button>
                        )}
                        {onVote && (
                            <>
                                <span className="ml-auto text-xs text-muted">Thay chỗ này</span>
                                <button onClick={() => { setVoted('up'); onVote(hit, 'up'); }} aria-pressed={voted === 'up'} aria-label="Thay hay" className={`${act} ${voted === 'up' ? '!border-ink bg-ink text-bg' : 'border-line text-ink-2'}`}>
                                    <ThumbsUp className="w-4 h-4" />
                                </button>
                                <button onClick={() => { setVoted('down'); onVote(hit, 'down'); }} aria-pressed={voted === 'down'} aria-label="Thay sai chỗ" className={`${act} ${voted === 'down' ? 'border-warning text-warning' : 'border-line text-ink-2'}`}>
                                    <ThumbsDown className="w-4 h-4" />
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

/** Intensity (#161) and display mode (#162). */
export function DialControls({ intensity, mode, onChange, total, estimate }: { intensity: DialIntensity; mode: DialMode; onChange: (p: { intensity?: DialIntensity; mode?: DialMode }) => void; total?: number; estimate?: string }) {
    const seg = (on: boolean) => `flex-1 min-w-0 h-9 px-1 whitespace-nowrap rounded-lg border text-xs sm:text-sm ${on ? 'border-ink bg-ink text-bg font-bold' : 'border-line text-ink-2'}`;
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <span className="w-[4.5rem] shrink-0 whitespace-nowrap text-xs sm:text-sm text-muted">Cường độ</span>
                {INTENSITIES.map((k) => (
                    <button key={k} onClick={() => onChange({ intensity: k })} aria-pressed={intensity === k} className={seg(intensity === k)}>
                        {INTENSITY[k].label}
                    </button>
                ))}
            </div>
            <div className="flex items-center gap-2">
                <span className="w-[4.5rem] shrink-0 whitespace-nowrap text-xs sm:text-sm text-muted">Cách hiện</span>
                {MODES.map((m) => (
                    <button key={m} onClick={() => onChange({ mode: m })} aria-pressed={mode === m} className={seg(mode === m)}>
                        {MODE_LABEL[m]}
                    </button>
                ))}
            </div>
            {estimate && <p className="text-xs text-muted">{estimate}</p>}
            {total !== undefined && <p className="text-xs text-muted">{total === 0 ? 'Chưa có từ nào khớp trong đoạn này' : `${total} chỗ có thể đổi · chạm vào từ để xem nghĩa`}</p>}
        </div>
    );
}

/** The level slider. */
export function DialSlider({ level, onChange, total }: { level: number; onChange: (v: number) => void; total?: number }) {
    return (
        <div>
            <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-muted">Mức tiếng Anh</span>
                <span className="font-mono text-accent">{level}%</span>
            </div>
            <input type="range" min={0} max={100} step={10} value={level} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[var(--color-accent)]" aria-label="Mức tiếng Anh" />
            {total !== undefined && <p className="mt-1 text-xs text-muted">{total === 0 ? 'Chưa có từ nào khớp trong đoạn này' : `${total} chỗ có thể đổi · chạm vào từ để xem nghĩa`}</p>}
        </div>
    );
}

/**
 * The tapped word, and what the tap will do to the review schedule: a tap
 * means the learner did not recall the word (a learned word becomes due, a
 * new one is queued to learn). The tap is applied when the sheet closes, so
 * "Đã thuộc" can replace it (#163). 👎 hides that hit on this page.
 */
export function useDialSheet() {
    const [open, setOpenState] = useState<DialHit | null>(null);
    const [hidden, setHidden] = useState<ReadonlySet<string>>(NONE);
    const pending = useRef<string | null>(null);
    const flush = () => {
        if (pending.current) useLexicaStore.getState().dialTap(pending.current);
        pending.current = null;
    };
    const preview = (id: string): 'due' | 'queued' | 'none' => {
        const p = useLexicaStore.getState().cardProgress[id];
        return p ? (p.nextReviewAt > Date.now() ? 'due' : 'none') : 'queued';
    };
    const [effect, setEffect] = useState<'due' | 'queued' | 'none'>('none');
    useEffect(() => () => flush(), []);
    const setOpen = (h: DialHit | null) => {
        flush();
        setOpenState(h);
        if (h) {
            pending.current = h.cardId;
            setEffect(preview(h.cardId));
        }
    };
    const close = () => {
        flush();
        setOpenState(null);
    };
    const onKnown = (h: DialHit) => {
        pending.current = null;
        useLexicaStore.getState().markDialKnown(h.cardId, true);
        setOpenState(null);
    };
    const onVote = (h: DialHit, v: 'up' | 'down') => {
        useLexicaStore.getState().rateDialRule(ruleKey(h.cardId, h.vi), v);
        if (v === 'down') {
            pending.current = null;
            setHidden((s) => new Set([...s, ruleKey(h.cardId, h.vi)]));
            setOpenState(null);
        }
    };
    return { open, setOpen, effect, close, onKnown, onVote, hidden };
}

/** Due words first, then other learned words. */
export function useDialRank() {
    const progress = useLexicaStore((s) => s.cardProgress);
    return useMemo(() => dialRank(progress), [progress]);
}

/**
 * "Seen" signal (issue #142): a swapped word that stays on screen for a moment
 * without a tap. Logged once per word per page, with a small weight that the
 * weekly check calibrates; it never changes a memory by itself.
 */
export function useDialSeen(root: RefObject<HTMLElement | null>, active: boolean) {
    const done = useRef(new Set<string>());
    useEffect(() => {
        const el = root.current;
        if (!active || !el || typeof IntersectionObserver === 'undefined') return;
        const timers = new Map<Element, ReturnType<typeof setTimeout>>();
        const io = new IntersectionObserver((entries) => {
            for (const en of entries) {
                const id = (en.target as HTMLElement).dataset.dialCard;
                if (!id || done.current.has(id)) continue;
                if (en.isIntersecting && document.visibilityState === 'visible') {
                    if (timers.has(en.target)) continue;
                    timers.set(en.target, setTimeout(() => {
                        timers.delete(en.target);
                        if (done.current.has(id)) return;
                        done.current.add(id);
                        const { learner, recordEvidence } = useLexicaStore.getState();
                        recordEvidence({ cardId: id, facet: 'recog', source: 'dial', outcome: 'seen', weight: seenWeight(learner?.dial), at: Date.now() });
                    }, SEEN_MIN_MS));
                } else {
                    clearTimeout(timers.get(en.target));
                    timers.delete(en.target);
                }
            }
        }, { threshold: 0.9 });
        const watch = () => el.querySelectorAll('[data-dial-card]').forEach((b) => io.observe(b));
        watch();
        const mo = new MutationObserver(() => { io.disconnect(); watch(); });
        mo.observe(el, { childList: true, subtree: true });
        return () => { io.disconnect(); mo.disconnect(); timers.forEach(clearTimeout); };
    }, [root, active]);
}
