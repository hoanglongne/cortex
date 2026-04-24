/**
 * LEXICA Analytics Module
 *
 * Thin event-tracking layer. Currently logs to console.
 * To wire to a real provider (Plausible, Mixpanel, Umami):
 *   1. Replace the `send` function body below.
 *   2. No call-site changes needed.
 */

export type LexicaEvent =
    | 'swipe'
    | 'voice_success'
    | 'voice_fail'
    | 'voice_hit'
    | 'story_open'
    | 'story_finish'
    | 'oratio_cta_click'
    | 'level_selected'
    | 'test_completed'
    | 'deck_complete'
    | 'energy_depleted';

interface EventProps {
    [key: string]: string | number | boolean | null | undefined;
}

function send(event: LexicaEvent, props?: EventProps): void {
    if (process.env.NODE_ENV === 'development') {
        console.log(`[analytics] ${event}`, props ?? {});
    }

    // CORTEX Integration: Send to Central API
    const API_URL = process.env.NEXT_PUBLIC_CORTEX_API_URL || 'http://localhost:3001';
    
    let userId = ''; 
    
    if (typeof window !== 'undefined') {
        userId = localStorage.getItem('cortex_user_id') || '';
    }

    if (!userId) {
        if (process.env.NODE_ENV === 'development') {
            console.warn('[Cortex] No userId found, skipping log');
        }
        return;
    }

    // Map Lexica events to Cortex ActionLogs
    let actionType = 'ACTIVITY';
    if (event === 'swipe' && props?.direction === 'right') actionType = 'LEARN_VOCABULARY';
    if (event === 'story_finish') actionType = 'COMPLETE_STORY';
    if (event === 'test_completed') actionType = 'COMPLETE_TEST';

    // Get word from cardId (assuming cardId is the word itself or contains it)
    // In Lexica, cardId is usually the word or a slug
    const word = props?.cardId as string || props?.word as string || '';

    // Only send relevant events to Cortex
    if (['LEARN_VOCABULARY', 'COMPLETE_STORY', 'COMPLETE_TEST'].includes(actionType)) {
        console.log(`[Cortex] Sending ${actionType} for user ${userId}...`);
        fetch(`${API_URL}/actions/log`, {
            method: 'POST',
            mode: 'cors', // Explicitly set CORS
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                appSource: 'lexica',
                actionType,
                metadata: {
                    ...props,
                    words: actionType === 'LEARN_VOCABULARY' && word ? [word] : []
                }
            })
        })
        .then(res => {
            if (!res.ok) console.error('[Cortex] API returned error:', res.status);
            else console.log('[Cortex] Log sent successfully');
        })
        .catch(err => console.error('[Cortex] Failed to send log:', err));
    }
}

export const analytics = {
    swipe(direction: 'left' | 'right', cardId: string, source: 'manual' | 'voice' | 'quiz', word?: string) {
        send('swipe', { direction, cardId, source, word });
    },

    voiceSuccess(word: string, attempts: number) {
        send('voice_success', { word, attempts });
    },

    voiceFail(word: string, spokenWord: string) {
        send('voice_fail', { word, spokenWord });
    },

    voiceHit(word: string, hitNumber: number) {
        send('voice_hit', { word, hitNumber });
    },

    storyOpen(storyId: string) {
        send('story_open', { storyId });
    },

    storyFinish(storyId: string) {
        send('story_finish', { storyId });
    },

    oratioCTAClick(storyId: string) {
        send('oratio_cta_click', { storyId });
    },

    levelSelected(level: string) {
        send('level_selected', { level });
    },

    testCompleted(score: number, recommendedLevel: string) {
        send('test_completed', { score, recommendedLevel });
    },

    deckComplete(wordsLearned: number) {
        send('deck_complete', { wordsLearned });
    },

    energyDepleted() {
        send('energy_depleted', {});
    },
};
