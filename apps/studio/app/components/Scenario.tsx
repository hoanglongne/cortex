/** Renders a scenario with its upper-case target word highlighted, like Lexica's card. */
export default function Scenario({ text, className = '' }: { text: string; className?: string }) {
    // Unicode-aware boundaries: Vietnamese capitals (Ấ, Ư…) are letters too.
    const parts = text.split(/((?<!\p{L})[A-Z][A-Z'-]*[A-Z](?!\p{L}))/gu);
    return (
        <p className={`leading-relaxed text-ink-2 ${className}`}>
            {parts.map((part, i) =>
                i % 2 === 1 && part.length > 3 ? (
                    <mark key={i} className="bg-accent text-on-accent px-1 lowercase">
                        {part}
                    </mark>
                ) : (
                    <span key={i}>{part}</span>
                ),
            )}
        </p>
    );
}
