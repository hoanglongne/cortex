import type { RatingCriterion } from '@/types';
import type { Translations } from '@/lib/translations';

export interface BandGuide {
    range: string;
    description: string;
    examples: string;
}

export interface CriterionRubric {
    key: RatingCriterion;
    label: string;
    question: string;
    guides: BandGuide[];
}

export function getRubricData(t: Translations): CriterionRubric[] {
    return [
        {
            key: 'fluency',
            label: t.fluency,
            question: t.rubricFluencyQuestion,
            guides: [
                {
                    range: '1–3',
                    description: t.rubricFluency1_3Desc,
                    examples: t.rubricFluency1_3Examples,
                },
                {
                    range: '4–5',
                    description: t.rubricFluency4_5Desc,
                    examples: t.rubricFluency4_5Examples,
                },
                {
                    range: '6–7',
                    description: t.rubricFluency6_7Desc,
                    examples: t.rubricFluency6_7Examples,
                },
                {
                    range: '8–9',
                    description: t.rubricFluency8_9Desc,
                    examples: t.rubricFluency8_9Examples,
                },
            ],
        },
        {
            key: 'lexical',
            label: t.lexical,
            question: t.rubricLexicalQuestion,
            guides: [
                {
                    range: '1–3',
                    description: t.rubricLexical1_3Desc,
                    examples: t.rubricLexical1_3Examples,
                },
                {
                    range: '4–5',
                    description: t.rubricLexical4_5Desc,
                    examples: t.rubricLexical4_5Examples,
                },
                {
                    range: '6–7',
                    description: t.rubricLexical6_7Desc,
                    examples: t.rubricLexical6_7Examples,
                },
                {
                    range: '8–9',
                    description: t.rubricLexical8_9Desc,
                    examples: t.rubricLexical8_9Examples,
                },
            ],
        },
        {
            key: 'grammar',
            label: t.grammar,
            question: t.rubricGrammarQuestion,
            guides: [
                {
                    range: '1–3',
                    description: t.rubricGrammar1_3Desc,
                    examples: t.rubricGrammar1_3Examples,
                },
                {
                    range: '4–5',
                    description: t.rubricGrammar4_5Desc,
                    examples: t.rubricGrammar4_5Examples,
                },
                {
                    range: '6–7',
                    description: t.rubricGrammar6_7Desc,
                    examples: t.rubricGrammar6_7Examples,
                },
                {
                    range: '8–9',
                    description: t.rubricGrammar8_9Desc,
                    examples: t.rubricGrammar8_9Examples,
                },
            ],
        },
        {
            key: 'pronunciation',
            label: t.pronunciation,
            question: t.rubricPronunciationQuestion,
            guides: [
                {
                    range: '1–3',
                    description: t.rubricPronunciation1_3Desc,
                    examples: t.rubricPronunciation1_3Examples,
                },
                {
                    range: '4–5',
                    description: t.rubricPronunciation4_5Desc,
                    examples: t.rubricPronunciation4_5Examples,
                },
                {
                    range: '6–7',
                    description: t.rubricPronunciation6_7Desc,
                    examples: t.rubricPronunciation6_7Examples,
                },
                {
                    range: '8–9',
                    description: t.rubricPronunciation8_9Desc,
                    examples: t.rubricPronunciation8_9Examples,
                },
            ],
        },
    ];
}
