'use client';

import { MouthHint } from '../../components/pron/SoundTips';
import { GUIDED_PHONES } from '../../lib/pronunciation/steps';
import { SOUND_PAIRS } from '../../lib/pronunciation/compare';
import MouthCompare from '../../components/pron/MouthCompare';
import SelfCheckCard from '../../components/pron/SelfCheckCard';

/** Every sound's mouth picture and steps on one page, for reviewing the content (issue #152). */
export default function MouthDevPage() {
    return (
        <main className="mx-auto max-w-2xl p-4 space-y-4">
            <h1 className="text-lg font-semibold text-ink">Hướng dẫn phát âm theo âm</h1>
            <h2 className="text-base font-semibold text-ink">Cặp dễ nhầm</h2>
            {SOUND_PAIRS.map((x) => (
                <div key={x.a + x.b} data-testid={`pair-${x.a}-${x.b}`}>
                    <MouthCompare pair={x} />
                </div>
            ))}
            <h2 className="text-base font-semibold text-ink">Từng âm</h2>
            {GUIDED_PHONES.map((p) => (
                <section key={p} data-testid={`guide-${p}`} className="rounded-xl bg-surface-2 p-3">
                    <p className="mb-2 font-mono text-xs text-subtle">{p}</p>
                    <MouthHint phone={p} tip={null} />
                    <div className="mt-2"><SelfCheckCard phone={p} /></div>
                </section>
            ))}
        </main>
    );
}
