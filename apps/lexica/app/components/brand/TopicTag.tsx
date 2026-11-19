import TopicIcon from './TopicIcon';
import { TOPIC_BLOCK } from '../../lib/brand';
import { TOPICS, topicOf } from '../../lib/engagement/collection';

/** A small sticker with the card's topic colour, icon and name (direction B). */
export default function TopicTag({ scenario, className = '' }: { scenario?: string; className?: string }) {
    const topic = topicOf({ scenario });
    return (
        <span className={`lx-sticker inline-flex items-center gap-1 whitespace-nowrap px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--on-block)] ${className}`} style={{ background: TOPIC_BLOCK[topic] }}>
            <TopicIcon topic={topic} className="h-3.5 w-3.5" />
            {TOPICS.find((t) => t.id === topic)?.label}
        </span>
    );
}
