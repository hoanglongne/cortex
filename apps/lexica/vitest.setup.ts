import '@testing-library/jest-dom';

// The IELTS deck loads in a chunk of its own in the app (HydrationGate waits for it);
// tests read cards synchronously from the start, so put it in place here.
import { VOCAB_DATABASE } from './app/data/vocabCards';
import { setCoreDeck } from './app/lib/content/repository';
import { CORE_PASSAGES } from './app/data/passages';
import type { ContentCard } from './app/lib/content/pack';
setCoreDeck(VOCAB_DATABASE as unknown as ContentCard[], CORE_PASSAGES);
