import type { CueCard as CueCardType } from '@/types';
import { useLanguage } from '@/components/LanguageProvider';

interface CueCardProps {
    card: CueCardType;
    compact?: boolean;
}

export function CueCard({ card, compact }: CueCardProps) {
    const { t } = useLanguage();

    if (compact) {
        return (
            <p
                className="max-w-md text-center text-lg text-gray-800 dark:text-gray-200 italic"
                style={{ fontFamily: 'var(--font-serif)' }}
            >
                {card.topic}
            </p>
        );
    }

    return (
        <div className="w-full max-w-lg rounded-lg border border-surface-light bg-surface p-6 shadow-lg glow-accent transition-all duration-300 hover:border-accent/30">
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-accent/60 mb-4">
                IELTS Speaking — Part 2
            </p>
            <h2
                className="text-xl leading-relaxed mb-4 text-foreground"
                style={{ fontFamily: 'var(--font-serif)' }}
            >
                {card.topic}
            </h2>
            <div className="border-t border-surface-light pt-3 mt-3">
                <p className="text-xs text-gray-800 dark:text-gray-300 mb-2 font-mono uppercase tracking-wide">{t.youShouldSay}</p>
                <ul className="space-y-1.5 text-sm text-foreground mb-4">
                    {card.bullets.map((b, i) => (
                        <li key={i} className="flex gap-2">
                            <span className="text-accent/50 mt-0.5">›</span>
                            <span>{b}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <p
                className="text-sm italic text-foreground border-l-2 border-accent/30 pl-3"
                style={{ fontFamily: 'var(--font-serif)' }}
            >
                {card.followUp}
            </p>
        </div>
    );
}
