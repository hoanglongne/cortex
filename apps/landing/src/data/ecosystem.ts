export type AppStatus = 'Live' | 'Development' | 'Idea';
export type Pillar = 'Biological' | 'Psychological' | 'Cognitive' | 'Combat' | 'Core';
export type LanguageFocus = 'English' | 'Multilingual';

export interface EcosystemApp {
    id: string;
    name: string;
    status: AppStatus;
    pillar: Pillar;
    pureFunctionDesc: string;
    colorAccent: string;
    targetLaunchDate?: string;
    language: LanguageFocus;
    upvotes?: number;
    href?: string;
}

export const ecosystemApps: EcosystemApp[] = [
    // ── Live Apps ──────────────────────────────────────────────
    {
        id: 'solilo',
        name: 'Solilo',
        status: 'Live',
        pillar: 'Psychological',
        pureFunctionDesc:
            'Solves EXACTLY one problem: Eliminating speaking anxiety through forced solo repetition drills.',
        colorAccent: '#0089ff',
        language: 'English',
        href: '/apps/solilo',
    },
    {
        id: 'lexica',
        name: 'Lexica',
        status: 'Live',
        pillar: 'Biological',
        pureFunctionDesc:
            'Solves EXACTLY one problem: Rewiring vocabulary recall through spaced-repetition stress tests.',
        colorAccent: '#0089ff',
        language: 'English',
        href: '/apps/lexica',
    },
    {
        id: 'dialecta',
        name: 'Dialecta',
        status: 'Live',
        pillar: 'Cognitive',
        pureFunctionDesc:
            'Solves EXACTLY one problem: Training real-time accent decoding across regional dialects.',
        colorAccent: '#0096ff',
        language: 'English',
        href: '/apps/dialecta',
    },
    {
        id: 'oratio',
        name: 'Oratio',
        status: 'Live',
        pillar: 'Combat',
        pureFunctionDesc:
            'Solves EXACTLY one problem: Building argumentative fluency under timed pressure.',
        colorAccent: '#0007cd',
        language: 'English',
        href: '/apps/oratio',
    },

    // ── Ideas ──────────────────────────────────────────────────
    {
        id: 'echo',
        name: 'Echo',
        status: 'Idea',
        pillar: 'Biological',
        pureFunctionDesc:
            'Solves EXACTLY one problem: Conditioning vocal muscle memory through shadowing loops.',
        colorAccent: '#22d3ee',
        targetLaunchDate: 'Q3 2026',
        language: 'English',
        upvotes: 84,
    },
    {
        id: 'syntaxis',
        name: 'Syntaxis',
        status: 'Idea',
        pillar: 'Cognitive',
        pureFunctionDesc:
            'Solves EXACTLY one problem: Slicing complex sentences into parse-tree components for pattern drilling.',
        colorAccent: '#6366f1',
        targetLaunchDate: 'Q4 2026',
        language: 'English',
        upvotes: 127,
    },
    {
        id: 'visage',
        name: 'Visage',
        status: 'Idea',
        pillar: 'Biological',
        pureFunctionDesc:
            'Solves EXACTLY one problem: Training reading speed and comprehension via eye-tracking calibration.',
        colorAccent: '#a855f7',
        targetLaunchDate: 'Q1 2027',
        language: 'English',
        upvotes: 63,
    },
    {
        id: 'metamorph',
        name: 'Metamorph',
        status: 'Idea',
        pillar: 'Cognitive',
        pureFunctionDesc:
            'Solves EXACTLY one problem: Forcing paraphrase generation under strict lexical constraints.',
        colorAccent: '#f43f5e',
        targetLaunchDate: 'Q2 2027',
        language: 'English',
        upvotes: 95,
    },
];
