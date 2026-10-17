import { notFound } from 'next/navigation';
import CardFitFixture from './CardFitFixture';

/**
 * Dev-only fixture for the card-fit E2E check (docs/LEXICA_FEEDBACK_TASKS.md
 * T1): the longest sentence, meanings and memory aid in the deck, on one card.
 */
export default function CardFitPage() {
    if (process.env.NODE_ENV === 'production') notFound();
    return <CardFitFixture />;
}
