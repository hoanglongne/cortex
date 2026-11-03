'use client';

import { useMemo, useState } from 'react';
import { getAllCards } from '../lib/content/repository';
import { useLexicaStore } from '../store/lexicaStore';
import { capture } from '../lib/productAnalytics';
import { checkFormalRewrite, passed, wordCount } from '../lib/writing/checks';
import { CheckList, Panel, Privacy, SelfCheck, useDraft } from './shared';

/** W2: say the same sentence more formally, then compare with the options of the card's upgrade module. */
export default function W2() {
    const progress = useLexicaStore((s) => s.cardProgress);
    const pool = useMemo(() => {
        const withModule = getAllCards().filter((c) => c.upgradeModule?.academicOptions?.length);
        // Words the learner already met first: they know what the sentence means.
        const mine = withModule.filter((c) => progress[c.id]);
        return mine.length >= 5 ? mine : withModule;
    }, [progress]);
    const [at, setAt] = useState(0);
    const card = pool[at % Math.max(pool.length, 1)];
    const [text, setText] = useDraft(`w2:${card?.id ?? ''}`);
    const [result, setResult] = useState<ReturnType<typeof checkFormalRewrite> | null>(null);
    const [shown, setShown] = useState(false);

    if (!card?.upgradeModule) return <p className="text-sm text-muted">Chưa có thẻ nào có bài nâng cấp câu.</p>;
    const m = card.upgradeModule;
    const options = m.academicOptions;

    const check = () => {
        const r = checkFormalRewrite({ original: m.simpleSentence, rewrite: text, options: options.map((o) => o.text) });
        setResult(r);
        capture('practice_completed', { mode: 'write_w2', words: wordCount(text), checks: passed(r), of: r.length }, { track: 'writing' });
    };
    const next = () => {
        setAt((i) => i + 1);
        setResult(null);
        setShown(false);
    };

    return (
        <Panel title="Viết lại câu cho trang trọng hơn" hint="Giữ nguyên ý, đổi cách nói như trong bài viết học thuật.">
            <div className="rounded-xl bg-surface-2 p-3 text-sm">
                <p className="text-xs uppercase text-subtle">Câu thân mật</p>
                <p className="mt-1 text-base text-ink">{m.simpleSentence}</p>
                <p className="mt-1 text-xs text-muted">
                    Cụm cần nâng cấp: <b className="text-ink-2">{m.targetSlot}</b> (thẻ <span lang="en">{card.word}</span>)
                </p>
            </div>
            <label className="block">
                <span className="text-sm font-medium text-ink">Câu của bạn</span>
                <textarea
                    className="mt-1 w-full rounded-xl border border-line bg-bg p-3 text-sm text-ink"
                    rows={3}
                    value={text}
                    onChange={(e) => {
                        setText(e.target.value);
                        setResult(null);
                    }}
                    placeholder="Viết lại cả câu bằng tiếng Anh…"
                    lang="en"
                />
            </label>
            <div className="flex flex-wrap gap-2">
                <button onClick={check} disabled={text.trim().length === 0} className="h-10 rounded-xl bg-accent px-4 text-sm font-bold text-on-accent disabled:opacity-40">
                    Kiểm tra
                </button>
                <button onClick={() => setShown((v) => !v)} className="h-10 rounded-xl border border-line px-4 text-sm text-ink-2 hover:bg-surface-2">
                    {shown ? 'Ẩn gợi ý' : 'Xem gợi ý'}
                </button>
                <button onClick={next} className="h-10 rounded-xl px-3 text-sm text-muted hover:text-ink">
                    Câu khác
                </button>
            </div>
            {result && (
                <div className="space-y-3 border-t border-line pt-3">
                    <p className="text-sm font-semibold text-ink">
                        {passed(result)}/{result.length} mục đạt
                    </p>
                    <CheckList checks={result} />
                    <SelfCheck items={['Nghĩa của câu vẫn giữ nguyên', 'Đọc lên nghe tự nhiên, không gượng', 'Ngữ pháp đúng sau khi đổi cụm (số ít/số nhiều, giới từ)']} />
                </div>
            )}
            {shown && (
                <div className="space-y-2 border-t border-line pt-3">
                    <p className="text-sm font-semibold text-ink">Các cách nâng cấp</p>
                    {options.map((o) => (
                        <div key={o.text} className="rounded-lg bg-surface-2 p-3 text-sm">
                            <p className="font-semibold text-ink" lang="en">
                                {o.text} <span className="ml-2 font-mono text-[11px] font-normal text-subtle">trang trọng {o.formalityScore}/10</span>
                            </p>
                            <p className="text-xs text-muted">{o.nuance}</p>
                        </div>
                    ))}
                </div>
            )}
            <Privacy />
        </Panel>
    );
}
