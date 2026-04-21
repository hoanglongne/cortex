import type { CueCard } from '@/types';

export const cueCards: CueCard[] = [
    {
        id: 'part2-001',
        topic: 'Describe a book that had a major influence on you.',
        bullets: [
            'What the book was',
            'When you read it',
            'What it was about',
        ],
        followUp: 'and explain why it had such a big influence on you.',
    },
    {
        id: 'part2-002',
        topic: 'Describe a time when you helped someone.',
        bullets: [
            'Who you helped',
            'How you helped them',
            'What the result was',
        ],
        followUp: 'and explain how you felt about helping this person.',
    },
    {
        id: 'part2-003',
        topic: 'Describe a place you visited that you found very beautiful.',
        bullets: [
            'Where the place was',
            'When you went there',
            'What you did there',
        ],
        followUp: 'and explain why you thought it was beautiful.',
    },
    {
        id: 'part2-004',
        topic: 'Describe an ambition you have not yet achieved.',
        bullets: [
            'What the ambition is',
            'Why you have this ambition',
            'What you have done to try to achieve it',
        ],
        followUp: 'and explain how you would feel if you achieved it.',
    },
    {
        id: 'part2-005',
        topic: 'Describe a teacher who had a positive influence on you.',
        bullets: [
            'Who the teacher was',
            'What subject they taught',
            'How they taught it',
        ],
        followUp: 'and explain why they had such a positive influence.',
    },
    {
        id: 'part2-006',
        topic: 'Describe a piece of technology you find useful.',
        bullets: [
            'What the technology is',
            'When you started using it',
            'How often you use it',
        ],
        followUp: 'and explain why you find it useful.',
    },
    {
        id: 'part2-007',
        topic: 'Describe a skill you would like to learn.',
        bullets: [
            'What the skill is',
            'Why you want to learn it',
            'How you plan to learn it',
        ],
        followUp: 'and explain how this skill would be useful to you.',
    },
    {
        id: 'part2-008',
        topic: 'Describe a memorable event you attended.',
        bullets: [
            'What the event was',
            'Where it took place',
            'Who you went with',
        ],
        followUp: 'and explain why it was so memorable for you.',
    },
    {
        id: 'part2-009',
        topic: 'Describe a decision you made that changed your life.',
        bullets: [
            'What the decision was',
            'When you made it',
            'What happened as a result',
        ],
        followUp: 'and explain how you feel about this decision now.',
    },
    {
        id: 'part2-010',
        topic: 'Describe an item of clothing you enjoy wearing.',
        bullets: [
            'What it looks like',
            'Where you bought it',
            'How often you wear it',
        ],
        followUp: 'and explain why you enjoy wearing it.',
    },
    {
        id: 'part2-011',
        topic: 'Describe a historical building in your city or country.',
        bullets: [
            'What the building is',
            'Where it is located',
            'What it looks like',
        ],
        followUp: 'and explain why it is historically important.',
    },
    {
        id: 'part2-012',
        topic: 'Describe a time you were surprised by something.',
        bullets: [
            'What surprised you',
            'When it happened',
            'Who you were with',
        ],
        followUp: 'and explain why you found it so surprising.',
    },
];

/**
 * Pick a random cue card from the bank.
 */
export function getRandomCueCard(): CueCard {
    const idx = Math.floor(Math.random() * cueCards.length);
    return cueCards[idx];
}
