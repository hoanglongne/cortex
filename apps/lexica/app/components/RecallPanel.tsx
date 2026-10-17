'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, X } from 'lucide-react';
import { matchesTyped, optionLabels, typeHint, type RecallCheck } from '../lib/engagement/recall';
import { useSoundEffects } from '../hooks/useSoundEffects';

/**
 * The check that turns a swipe into "Đã nhớ": pick the meaning, pick the
 * missing word, or type it. Shows the right answer for a moment either way.
 */
export default function RecallPanel({
    check,
    word,
    meaning,
    aid,
    nextIn,
    onAnswer,
}: {
    check: RecallCheck;
    word: string;
    meaning: string;
    /** Memory aid shown after a wrong answer (hard.ts mnemonic). */
    aid?: string | null;
    /** When a right answer brings the word back, e.g. "8 ngày" (lib/srs.ts). */
    nextIn?: string;
    onAnswer: (correct: boolean) => void;
}) {
    const [picked, setPicked] = useState<string | null>(null);
    const [typed, setTyped] = useState('');
    const [result, setResult] = useState<boolean | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { quizCorrect, quizWrong } = useSoundEffects();

    const finish = (correct: boolean) => {
        if (result !== null) return;
        setResult(correct);
        if (correct) quizCorrect();
        else quizWrong();
        setTimeout(() => onAnswer(correct), correct ? 700 : aid ? 2600 : 1700);
    };

    const pick = (option: string) => {
        if (result !== null) return;
        setPicked(option);
        finish(option === check.answer);
    };

    // 1-4 picks an option on a keyboard; the typing check focuses its input.
    useEffect(() => {
        if (check.kind === 'type') {
            inputRef.current?.focus();
            return;
        }
        const onKey = (e: KeyboardEvent) => {
            const i = Number(e.key) - 1;
            if (i >= 0 && i < check.options.length) {
                e.preventDefault();
                pick(check.options[i]);
            }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- one listener per check
    }, [check]);

    if (check.kind === 'type') {
        return (
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    if (typed.trim()) finish(matchesTyped(typed, word));
                }}
                // Tall enough for a wrong-answer verdict with a memory aid
                className="relative min-h-40 flex flex-col justify-end gap-2"
            >
                <p className="font-mono text-xs text-muted">{typeHint(word)} · {word.length} chữ cái</p>
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        value={typed}
                        onChange={(e) => setTyped(e.target.value)}
                        disabled={result !== null}
                        autoCapitalize="none"
                        autoCorrect="off"
                        autoComplete="off"
                        spellCheck={false}
                        placeholder="Gõ từ tiếng Anh"
                        aria-label="Gõ từ còn thiếu"
                        className={`flex-1 min-w-0 h-12 rounded-xl bg-surface-2 border px-4 text-base text-ink outline-none ${result === null ? 'border-line-strong focus:border-accent' : result ? 'border-accent' : 'border-danger'}`}
                    />
                    <button
                        type="submit"
                        disabled={result !== null || !typed.trim()}
                        className="h-12 px-5 shrink-0 rounded-xl bg-accent text-on-accent font-bold disabled:opacity-40"
                    >
                        Kiểm tra
                    </button>
                </div>
                {result !== null && <Verdict correct={result} word={word} meaning={meaning} aid={aid} nextIn={nextIn} />}
                {/* Kept (hidden) after answering so the verdict has the same room */}
                <button type="button" onClick={() => finish(false)} disabled={result !== null} className={`w-full text-center font-mono text-[11px] text-subtle hover:text-ink py-1 ${result !== null ? 'invisible' : ''}`}>
                    Chịu, cho xem đáp án
                </button>
            </form>
        );
    }

    // Meanings are cut to one line; the full text stays the answer key.
    const labels = check.kind === 'meaning' ? optionLabels(check.options) : check.options;

    return (
        <div className="relative space-y-1.5">
            {check.options.map((option, i) => {
                const isAnswer = option === check.answer;
                let cls = 'bg-surface-2 border-line-strong text-ink hover:border-accent/60 active:scale-[0.99]';
                if (result !== null && isAnswer) cls = 'bg-accent/15 border-accent text-ink';
                else if (result !== null && option === picked) cls = 'bg-danger/15 border-danger text-ink';
                else if (result !== null) cls = 'bg-surface-2/40 border-line text-subtle';
                return (
                    <button
                        key={option}
                        onClick={() => pick(option)}
                        disabled={result !== null}
                        title={labels[i] !== option ? option : undefined}
                        className={`w-full h-11 px-3 rounded-xl border text-left text-sm flex items-center gap-2.5 transition ${cls} ${check.kind === 'cloze' ? 'font-bold lowercase' : ''}`}
                    >
                        <span className="font-mono text-[10px] text-subtle w-3 shrink-0 hidden sm:inline">{i + 1}</span>
                        <span className="truncate flex-1 min-w-0">{labels[i]}</span>
                        {result !== null && isAnswer && <Check className="w-4 h-4 text-accent shrink-0" />}
                        {result !== null && option === picked && !isAnswer && <X className="w-4 h-4 text-danger shrink-0" />}
                    </button>
                );
            })}
            {result !== null && <Verdict correct={result} word={word} meaning={meaning} aid={aid} nextIn={nextIn} />}
        </div>
    );
}

/**
 * Sits on top of the options (or the input) instead of below them, so a long
 * meaning or memory aid never pushes the panel past the bottom of the card.
 */
function Verdict({ correct, word, meaning, aid, nextIn }: { correct: boolean; word: string; meaning: string; aid?: string | null; nextIn?: string }) {
    return (
        <div
            role="status"
            data-testid="recall-verdict"
            className={`absolute inset-0 overflow-y-auto flex flex-col justify-center rounded-xl border bg-surface px-4 py-2 ${correct ? 'border-accent/60' : 'border-danger/50'}`}
        >
            <VerdictText correct={correct} word={word} meaning={meaning} aid={aid} nextIn={nextIn} />
        </div>
    );
}

function VerdictText({ correct, word, meaning, aid, nextIn }: { correct: boolean; word: string; meaning: string; aid?: string | null; nextIn?: string }) {
    return correct ? (
        <p className="text-sm text-accent font-medium">
            Chuẩn rồi.
            {nextIn && <span className="ml-1.5 font-mono text-[11px] text-muted">{nextIn === 'mai' ? 'Mai ôn lại' : `Ôn lại sau ${nextIn}`}</span>}
        </p>
    ) : (
        <p className="text-sm text-ink-2">
            <span className="font-bold text-ink lowercase">{word}</span> · {meaning}
            {aid && <span className="block font-mono text-[11px] text-warning mt-0.5">Mẹo nhớ: {aid}</span>}
            <span className="block font-mono text-[11px] text-muted mt-0.5">Tính là chưa nhớ, sẽ ôn lại sớm.</span>
        </p>
    );
}
