'use client';

import TopicIcon from './TopicIcon';
import { TOPIC_BLOCK, tiltOf } from '../../lib/brand';
import { TOPICS, topicOf } from '../../lib/engagement/collection';

export interface FanCard { id: string; word: string; scenario?: string }

/**
 * Up to three word cards fanned out (direction B): each in its topic's
 * colour with the topic icon and the word. Decorative, so it never takes
 * taps; the button below it is the action. Fixed tilts, no motion.
 */
export default function WordFan({ cards, className = '' }: { cards: FanCard[]; className?: string }) {
    const shown = cards.slice(0, 3);
    if (shown.length === 0) return null;
    // data-prose: the tilted cards make one-line words report several line boxes to the wrap scan.
    return (
        <div aria-hidden data-prose className={`relative mx-auto h-[190px] w-full max-w-[340px] ${className}`}>
            {shown.map((c, i) => {
                const topic = topicOf(c);
                const left = shown.length === 1 ? 50 : 24 + (i * 52) / (shown.length - 1);
                return (
                    <div
                        key={c.id}
                        className="lx-hard absolute top-2 flex h-[168px] w-[124px] flex-col justify-between rounded-[18px] p-3 text-[var(--on-block)]"
                        style={{ left: `${left}%`, background: TOPIC_BLOCK[topic], transform: `translateX(-50%) rotate(${tiltOf(i)}deg)`, zIndex: i }}
                    >
                        <span className="font-mono text-[9px] font-bold uppercase tracking-wider whitespace-nowrap">{TOPICS.find((t) => t.id === topic)?.label}</span>
                        <TopicIcon topic={topic} className="h-9 w-9" />
                        <span className={`font-extrabold leading-none tracking-tight lowercase whitespace-nowrap overflow-hidden text-ellipsis ${c.word.length > 9 ? 'text-base' : 'text-xl'}`}>{c.word}</span>
                    </div>
                );
            })}
        </div>
    );
}
