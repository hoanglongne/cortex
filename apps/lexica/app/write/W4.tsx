'use client';

import { useState } from 'react';
import LineChart from '../components/writing/LineChart';
import { capture } from '../lib/productAnalytics';
import { makeChart, chartFacts, CHART_COUNT } from '../lib/writing/chart';
import { checkTask1, passed, wordCount } from '../lib/writing/checks';
import HandIn from './HandIn';
import { CheckList, Panel, Privacy, SelfCheck, useDraft } from './shared';

/** A starting chart that changes each day, so two days do not give the same one. */
const daySeed = () => Math.floor(Date.now() / 86_400_000) % CHART_COUNT;

/** W4: describe a chart made by the program (IELTS Task 1 style), then check the text against what is on screen. */
export default function W4() {
    const [seed, setSeed] = useState(daySeed);
    const chart = makeChart(seed);
    const [text, setText] = useDraft(`w4:${seed}`);
    const [result, setResult] = useState<ReturnType<typeof checkTask1> | null>(null);
    const n = wordCount(text);

    const check = () => {
        const r = checkTask1(text, chart);
        setResult(r);
        capture('practice_completed', { mode: 'write_w4', words: n, checks: passed(r), of: r.length }, { track: 'writing' });
    };

    return (
        <Panel title="Mô tả biểu đồ (kiểu Task 1)" hint="Viết ít nhất 150 từ, khoảng 20 phút. Nêu xu hướng chung, rồi so sánh số liệu chính. Không nêu ý kiến.">
            <LineChart chart={chart} />
            <label className="block">
                <span className="text-sm font-medium text-ink">Bài viết của bạn</span>
                <textarea
                    className="mt-1 w-full rounded-xl border border-line bg-bg p-3 text-sm text-ink"
                    rows={10}
                    lang="en"
                    value={text}
                    onChange={(e) => {
                        setText(e.target.value);
                        setResult(null);
                    }}
                    placeholder="The graph shows…"
                />
            </label>
            <div className="flex flex-wrap items-center gap-3">
                <button onClick={check} disabled={n === 0} className="h-10 rounded-xl bg-accent px-4 text-sm font-bold text-on-accent disabled:opacity-40">
                    Kiểm tra
                </button>
                <span className={`font-mono text-xs ${n >= 150 ? 'text-accent' : 'text-muted'}`}>{n}/150 từ</span>
                <button
                    onClick={() => {
                        setSeed((s) => (s + 1) % CHART_COUNT);
                        setResult(null);
                    }}
                    className="ml-auto h-10 rounded-xl px-3 text-sm text-muted hover:text-ink"
                >
                    Biểu đồ khác
                </button>
            </div>
            {result && (
                <div className="space-y-3 border-t border-line pt-3">
                    <p className="text-sm font-semibold text-ink">
                        {passed(result)}/{result.length} mục đạt
                    </p>
                    <CheckList checks={result} />
                    <SelfCheck items={['Câu tổng quan không có con số cụ thể', 'Mỗi đoạn có một ý chính (xu hướng hoặc so sánh)', 'Đơn vị và năm viết đúng như trong biểu đồ', 'Không nhầm đường này với đường khác']} />
                    <details className="text-sm">
                        <summary className="cursor-pointer text-accent">Xem các số liệu chính</summary>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-2" lang="en">
                            {chartFacts(chart).map((f) => (
                                <li key={f}>{f}</li>
                            ))}
                        </ul>
                    </details>
                </div>
            )}
            <HandIn kind="task1" prompt={`Mô tả biểu đồ: ${chart.title} (${chart.unit})`} body={text} />
            <Privacy />
        </Panel>
    );
}
