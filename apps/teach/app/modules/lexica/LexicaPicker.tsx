'use client';

import { useMemo, useState } from 'react';
import { Check, Eye, EyeOff } from 'lucide-react';
import { inputClass } from '../../components/ui';
import { BRANCHES, browse, LEVELS, levelLabel, OWN_DECK, packsOf, toggleAll, type Filter } from './browse';
import type { IndexCard, WordIndex } from './words';

const PAGE = 60;

/**
 * "Chọn từ Lexica": browse the cards Lexica already has by branch, level and
 * Studio pack, search, pick one by one or a whole pack, preview a card's
 * sentence.
 */
export default function LexicaPicker({ words, picked, onChange, max, assigned }: { words: WordIndex; picked: string[]; onChange: (ids: string[]) => void; max: number; assigned: ReadonlySet<string> }) {
    const [f, setF] = useState<Filter>({ branch: '', level: '', pack: '', q: '' });
    const [shown, setShown] = useState(PAGE);
    const [open, setOpen] = useState<string | null>(null);
    const set = (patch: Partial<Filter>) => {
        setF((x) => ({ ...x, ...patch }));
        setShown(PAGE);
    };
    const list = useMemo(() => browse(words.cards, f), [words.cards, f]);
    const packs = useMemo(() => packsOf(words.cards, f), [words.cards, f]);
    const has = new Set(picked);
    const ids = list.map((c) => c.id);
    const allIn = ids.length > 0 && ids.every((id) => has.has(id));
    const full = picked.length >= max;
    const toggle = (id: string) => onChange(has.has(id) ? picked.filter((x) => x !== id) : full ? picked : [...picked, id]);

    return (
        <div className="space-y-3">
            <input value={f.q} onChange={(e) => set({ q: e.target.value })} placeholder="Tìm từ hoặc nghĩa" aria-label="Tìm từ trong Lexica" className={inputClass} />
            <Chips label="Nhánh" any="Mọi nhánh" value={f.branch} options={BRANCHES} onPick={(branch) => set({ branch: branch as Filter['branch'], pack: '' })} />
            <Chips label="Level" any="Mọi level" value={f.level} options={LEVELS} onPick={(level) => set({ level, pack: '' })} />
            <select value={f.pack} onChange={(e) => set({ pack: e.target.value })} aria-label="Bộ thẻ" className={inputClass}>
                <option value="">Mọi bộ thẻ</option>
                <option value={OWN_DECK}>Bộ thẻ gốc của Lexica</option>
                {packs.map((p) => (
                    <option key={p.name} value={p.name}>
                        {p.name} ({p.count})
                    </option>
                ))}
            </select>

            <div className="flex items-center justify-between gap-2 text-sm">
                <span className="text-muted">{list.length} từ</span>
                {list.length > 0 && (
                    <button onClick={() => onChange(toggleAll(picked, ids, max))} disabled={!allIn && full} className="font-medium text-accent hover:underline disabled:opacity-40">
                        {allIn ? `Bỏ chọn cả ${list.length}` : f.pack ? `Chọn cả bộ (${list.length})` : `Chọn cả ${list.length}`}
                    </button>
                )}
            </div>
            {full && <p className="text-xs text-warm">Một bài có tối đa {max} từ.</p>}

            <ul className="max-h-[26rem] divide-y divide-line overflow-y-auto rounded-xl border border-line bg-surface">
                {list.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted">Không có từ nào như vậy. Thử bỏ bớt bộ lọc, hoặc dán từ ở tab bên cạnh để Studio viết thẻ.</li>}
                {list.slice(0, shown).map((c) => (
                    <Row key={c.id} card={c} on={has.has(c.id)} given={assigned.has(c.id)} disabled={full && !has.has(c.id)} open={open === c.id} onToggle={() => toggle(c.id)} onPreview={() => setOpen(open === c.id ? null : c.id)} />
                ))}
                {shown < list.length && (
                    <li>
                        <button onClick={() => setShown((n) => n + PAGE)} className="w-full px-3 py-2.5 text-sm font-medium text-accent hover:bg-surface-2">
                            Xem thêm {Math.min(PAGE, list.length - shown)} từ
                        </button>
                    </li>
                )}
            </ul>
        </div>
    );
}

function Chips({ label, any, value, options, onPick }: { label: string; any: string; value: string; options: readonly (readonly [string, string])[]; onPick: (v: string) => void }) {
    return (
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={label}>
            {[['', any] as const, ...options].map(([id, name]) => (
                <button key={id} onClick={() => onPick(id)} aria-pressed={value === id} className={`rounded-full px-3 py-1 text-sm ${value === id ? 'bg-accent-soft font-semibold text-accent-strong' : 'border border-line text-ink-2 hover:bg-surface-2'}`}>
                    {name}
                </button>
            ))}
        </div>
    );
}

function Row({ card, on, given, disabled, open, onToggle, onPreview }: { card: IndexCard; on: boolean; given: boolean; disabled: boolean; open: boolean; onToggle: () => void; onPreview: () => void }) {
    return (
        <li className={on ? 'bg-accent-soft/50' : ''}>
            <div className="flex items-start gap-2 px-3 py-2.5">
                <button onClick={onToggle} disabled={disabled} aria-pressed={on} className="flex min-w-0 flex-1 items-start gap-3 text-left disabled:opacity-40">
                    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${on ? 'border-accent bg-accent text-on-accent' : 'border-line-strong bg-surface'}`}>{on && <Check className="h-3.5 w-3.5" />}</span>
                    <span className="min-w-0">
                        <span className="block text-ink">
                            <b className="font-semibold">{card.word.toLowerCase()}</b>
                            {card.ipa && <span className="ml-1.5 text-xs text-subtle">/{card.ipa}/</span>}
                        </span>
                        <span className="block text-sm text-muted">{card.meaning}</span>
                        <span className="mt-0.5 block text-xs text-subtle">
                            {levelLabel(card.level)}
                            {card.branch === 'talk' ? ' · Giao tiếp' : ''}
                            {card.pack ? ` · ${card.pack}` : ''}
                            {given && <span className="text-accent"> · đã giao cho lớp</span>}
                        </span>
                    </span>
                </button>
                {card.scenario && (
                    <button onClick={onPreview} aria-label={open ? 'Ẩn câu mẫu' : `Xem câu mẫu của ${card.word.toLowerCase()}`} aria-expanded={open} className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-ink">
                        {open ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                )}
            </div>
            {open && card.scenario && <p className="mx-3 mb-3 ml-11 rounded-lg bg-surface-2 px-3 py-2 text-sm text-ink-2">{card.scenario}</p>}
        </li>
    );
}
