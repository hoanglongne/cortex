'use client';

import { useState } from 'react';
import type { ContentCard } from '../lib/content/pack';
import { checkWritten, insertWord, MAX_WRITTEN, sentenceOptions, type MySentence } from '../lib/engagement/mySentence';

/**
 * "Câu của bạn": pick the sentence that fits you (no typing), or write one in
 * Vietnamese with the word. Nothing is graded; the only rule is that the word
 * is in it, with a one-tap insert.
 */
export default function MySentencePanel({
    card,
    onSave,
    onLater,
}: {
    card: ContentCard;
    onSave: (text: string, kind: MySentence['kind']) => void;
    onLater: () => void;
}) {
    const options = sentenceOptions(card);
    const canPick = options.length >= 2;
    const [writing, setWriting] = useState(!canPick);
    const [text, setText] = useState('');
    const [problem, setProblem] = useState<string | null>(null);
    const word = card.word.toUpperCase();

    const save = () => {
        const check = checkWritten(text, card.word);
        if (check.ok) return onSave(check.text, 'written');
        setProblem(check.reason === 'no_word' ? `Câu cần có từ ${word}.` : check.reason === 'too_short' ? 'Viết thêm vài chữ nữa nhé.' : `Câu hơi dài, rút gọn còn dưới ${MAX_WRITTEN} ký tự nhé.`);
    };

    return (
        <div className="space-y-2">
            {!writing ? (
                <>
                    <p className="text-sm text-ink">Câu nào giống bạn nhất?</p>
                    <p className="font-mono text-[11px] text-muted">Lần sau gặp {word}, bạn sẽ thấy câu này.</p>
                    {options.map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => onSave(s, 'picked')}
                            className="w-full text-left rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink-2 hover:border-accent/50 hover:text-ink transition-colors"
                        >
                            {s}
                        </button>
                    ))}
                    <div className="flex items-center justify-between pt-1">
                        <button type="button" onClick={() => setWriting(true)} className="font-mono text-[11px] text-accent hover:underline">
                            Hoặc tự viết
                        </button>
                        <button type="button" onClick={onLater} className="font-mono text-[11px] text-muted hover:text-ink">
                            Để sau
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <p className="text-sm text-ink">Kể một chuyện của bạn có {word}</p>
                    <p className="font-mono text-[11px] text-muted">Viết tiếng Việt, chèn từ vào là được. Không ai chấm điểm.</p>
                    <textarea
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value);
                            setProblem(null);
                        }}
                        rows={3}
                        maxLength={MAX_WRITTEN + 40}
                        placeholder={options[0] ? `Ví dụ: ${options[0]}` : `Ví dụ: Hôm nay mình thấy ${word} khi…`}
                        className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink placeholder:text-subtle focus:outline-none focus:border-accent/50"
                    />
                    {problem && <p className="text-xs text-warning">{problem}</p>}
                    <div className="flex flex-wrap items-center gap-2">
                        <button type="button" onClick={() => setText(insertWord(text, card.word))} className="h-9 rounded-lg border border-line px-3 text-xs text-ink hover:bg-surface-3">
                            + chèn {word}
                        </button>
                        <button type="button" onClick={save} className="h-9 rounded-lg bg-accent px-4 text-xs font-bold text-on-accent hover:bg-accent-strong">
                            Lưu câu
                        </button>
                        <span className="ml-auto flex gap-3">
                            {canPick && (
                                <button type="button" onClick={() => setWriting(false)} className="font-mono text-[11px] text-muted hover:text-ink">
                                    Chọn câu có sẵn
                                </button>
                            )}
                            <button type="button" onClick={onLater} className="font-mono text-[11px] text-muted hover:text-ink">
                                Để sau
                            </button>
                        </span>
                    </div>
                </>
            )}
        </div>
    );
}
