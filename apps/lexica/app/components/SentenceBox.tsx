'use client';

import { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { checkSentence, type SentenceFeedback } from '../lib/content/sentenceCheck';
import { usesWord } from '../lib/journey/outside';

/**
 * A sentence of the learner's own with one word: they write, the app checks
 * it kindly (lib/content/sentenceCheck.ts), then they keep it. Used by the
 * pledge check-in and "Một câu hôm nay".
 */
export default function SentenceBox({
    word,
    meaning,
    placeholder,
    saveLabel,
    optional = false,
    onSave,
}: {
    word: string;
    meaning: string;
    placeholder: string;
    saveLabel: string;
    /** The sentence may be left empty (the pledge check-in). */
    optional?: boolean;
    onSave: (sentence: string) => void;
}) {
    const [text, setText] = useState('');
    const [busy, setBusy] = useState(false);
    const [feedback, setFeedback] = useState<SentenceFeedback | null>(null);
    const [checked, setChecked] = useState('');
    const has = text.trim().length > 0;
    const missing = has && !usesWord(text, word);

    const check = async () => {
        setBusy(true);
        setFeedback(await checkSentence(word, meaning, text.trim()));
        setChecked(text.trim());
        setBusy(false);
    };
    const fresh = checked === text.trim();

    return (
        <div className="space-y-2">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={2}
                maxLength={400}
                placeholder={placeholder}
                aria-label={placeholder}
                className="w-full rounded-xl border border-line bg-bg px-3 py-2 text-ink outline-none focus:border-accent"
            />
            {missing && <p className="text-xs text-warning">Câu chưa có “{word}” (hoặc một dạng của nó).</p>}
            {feedback && fresh && (
                <div data-testid="sentence-feedback" className="rounded-xl bg-surface-2 p-3 text-sm space-y-1">
                    <p className={feedback.uses && feedback.ok ? 'text-accent' : 'text-ink-2'}>{feedback.note}</p>
                    {feedback.better && (
                        <p className="text-ink">
                            <span className="text-muted">Tự nhiên hơn: </span>
                            {feedback.better}
                        </p>
                    )}
                </div>
            )}
            <div className="flex flex-wrap gap-2">
                {has && !missing && !fresh && (
                    <button onClick={() => void check()} disabled={busy} className="h-10 px-3 rounded-xl border border-line text-sm text-ink flex items-center gap-1.5 hover:border-line-strong disabled:opacity-50">
                        <Sparkles className="w-4 h-4" /> {busy ? 'Đang xem…' : 'Nhờ xem giúp'}
                    </button>
                )}
                <button
                    onClick={() => onSave(text.trim())}
                    disabled={!optional && (!has || missing)}
                    className="h-10 px-4 rounded-xl bg-accent text-on-accent text-sm font-bold flex items-center gap-1.5 disabled:opacity-40"
                >
                    <Check className="w-4 h-4" /> {saveLabel}
                </button>
            </div>
        </div>
    );
}
