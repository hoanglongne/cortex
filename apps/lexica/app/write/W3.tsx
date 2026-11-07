'use client';

import { useState } from 'react';
import { capture } from '../lib/productAnalytics';
import { FRAMES, PARTS, scrambled, type PartKey } from '../lib/writing/frames';
import { checkParagraph, passed, wordCount } from '../lib/writing/checks';
import HandIn from './HandIn';
import { CheckList, Panel, Privacy, SelfCheck, useDraft } from './shared';

/** W3: put the four parts of a model paragraph in order, then write your own in the same frame. */
export default function W3() {
    const [fi, setFi] = useState(0);
    const frame = FRAMES[fi];
    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Chủ đề">
                {FRAMES.map((f, i) => (
                    <button
                        key={f.id}
                        role="tab"
                        aria-selected={i === fi}
                        onClick={() => setFi(i)}
                        className={`h-8 rounded-full border px-3 text-sm ${i === fi ? 'border-ink bg-ink text-bg' : 'border-line text-muted hover:bg-surface-2'}`}
                    >
                        {f.topic}
                    </button>
                ))}
            </div>
            <Order key={`o-${frame.id}`} model={frame.model} />
            <Write key={`w-${frame.id}`} frameId={frame.id} />
        </div>
    );
}

/** Step 1: tap the sentences in the order of the frame. */
function Order({ model }: { model: readonly string[] }) {
    const order = scrambled(model.length);
    const [picked, setPicked] = useState<number[]>([]);
    const done = picked.length === model.length;
    const right = done && picked.every((v, i) => v === i);
    return (
        <Panel title="Bước 1. Xếp đúng thứ tự" hint="Một đoạn văn tốt đi theo bốn phần: nêu ý, giải thích, ví dụ, kết. Chạm các câu theo thứ tự đó.">
            <ol className="space-y-2">
                {picked.map((p, i) => (
                    <li key={p} className="flex gap-2 rounded-lg bg-surface-2 p-2.5 text-sm text-ink">
                        <b className="text-accent">{i + 1}</b>
                        <span lang="en">{model[p]}</span>
                    </li>
                ))}
            </ol>
            <div className="space-y-2">
                {order
                    .filter((i) => !picked.includes(i))
                    .map((i) => (
                        <button key={i} onClick={() => setPicked((p) => [...p, i])} className="block w-full rounded-lg border border-line p-2.5 text-left text-sm text-ink-2 hover:bg-surface-2" lang="en">
                            {model[i]}
                        </button>
                    ))}
            </div>
            {done && (
                <p className={`text-sm font-semibold ${right ? 'text-accent' : 'text-warning'}`}>
                    {right ? 'Đúng thứ tự: nêu ý → giải thích → ví dụ → kết.' : 'Chưa đúng. Đáp án: nêu ý → giải thích → ví dụ → kết (xếp lại bên dưới).'}
                </p>
            )}
            {done && !right && <ol className="list-decimal space-y-1 pl-5 text-sm text-ink-2">{model.map((s) => <li key={s} lang="en">{s}</li>)}</ol>}
            {picked.length > 0 && (
                <button onClick={() => setPicked([])} className="text-sm text-muted hover:text-ink">
                    Xếp lại
                </button>
            )}
        </Panel>
    );
}

/** Step 2: the learner's own paragraph, one box per part. */
function Write({ frameId }: { frameId: string }) {
    const frame = FRAMES.find((f) => f.id === frameId)!;
    const [idea, setIdea] = useDraft(`w3:${frameId}:idea`);
    const [explain, setExplain] = useDraft(`w3:${frameId}:explain`);
    const [example, setExample] = useDraft(`w3:${frameId}:example`);
    const [wrap, setWrap] = useDraft(`w3:${frameId}:wrap`);
    const values: Record<PartKey, string> = { idea, explain, example, wrap };
    const setters: Record<PartKey, (v: string) => void> = { idea: setIdea, explain: setExplain, example: setExample, wrap: setWrap };
    const [result, setResult] = useState<ReturnType<typeof checkParagraph> | null>(null);
    const total = wordCount(Object.values(values).join(' '));

    const check = () => {
        const r = checkParagraph(values);
        setResult(r);
        capture('practice_completed', { mode: 'write_w3', words: total, checks: passed(r), of: r.length, topic: frameId }, { track: 'writing' });
    };

    return (
        <Panel title="Bước 2. Viết đoạn của bạn" hint={frame.prompt}>
            {PARTS.map((p, i) => (
                <label key={p.key} className="block">
                    <span className="text-sm font-medium text-ink">
                        {i + 1}. {p.label} <span className="font-normal text-muted">· {p.hint}</span>
                    </span>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                        {frame.starters[p.key].map((s) => (
                            <button
                                type="button"
                                key={s}
                                onClick={() => {
                                    setters[p.key](values[p.key] ? values[p.key] : `${s} `);
                                    setResult(null);
                                }}
                                className="rounded-full border border-line px-2.5 py-0.5 text-xs text-ink-2 hover:bg-surface-2"
                                lang="en"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                    <textarea
                        className="mt-1.5 w-full rounded-xl border border-line bg-bg p-3 text-sm text-ink"
                        rows={2}
                        lang="en"
                        value={values[p.key]}
                        onChange={(e) => {
                            setters[p.key](e.target.value);
                            setResult(null);
                        }}
                    />
                </label>
            ))}
            <div className="flex items-center gap-3">
                <button onClick={check} disabled={total === 0} className="h-10 rounded-xl bg-accent px-4 text-sm font-bold text-on-accent disabled:opacity-40">
                    Kiểm tra
                </button>
                <span className="font-mono text-xs text-muted">{total} từ</span>
            </div>
            {result && (
                <div className="space-y-3 border-t border-line pt-3">
                    <p className="text-sm font-semibold text-ink">
                        {passed(result)}/{result.length} mục đạt
                    </p>
                    <CheckList checks={result} />
                    <SelfCheck items={['Mỗi phần chỉ có một ý, không lẫn sang phần khác', 'Ví dụ cụ thể (có người, nơi chốn hoặc con số)', 'Phần kết không thêm ý mới']} />
                    <details className="text-sm">
                        <summary className="cursor-pointer text-accent">Xem đoạn mẫu</summary>
                        <p className="mt-2 leading-relaxed text-ink-2" lang="en">
                            {frame.model.join(' ')}
                        </p>
                    </details>
                </div>
            )}
            <HandIn kind="paragraph" prompt={frame.prompt} body={PARTS.map((p) => values[p.key]).join(' ').trim()} />
            <Privacy />
        </Panel>
    );
}
