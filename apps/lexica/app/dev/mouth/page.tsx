'use client';

import { MouthHint } from '../../components/pron/SoundTips';
import { GUIDED_PHONES } from '../../lib/pronunciation/steps';

/** Every sound's mouth picture and steps on one page, for reviewing the content (issue #152). */
export default function MouthDevPage() {
    return (
        <main className="mx-auto max-w-2xl p-4 space-y-4">
            <h1 className="text-lg font-semibold text-ink">Hướng dẫn phát âm theo âm</h1>
            {GUIDED_PHONES.map((p) => (
                <section key={p} data-testid={`guide-${p}`} className="rounded-xl bg-surface-2 p-3">
                    <p className="mb-2 font-mono text-xs text-subtle">{p}</p>
                    <MouthHint phone={p} tip={null} />
                </section>
            ))}
        </main>
    );
}
