export type RoadmapPhase = "2026" | "2027";

export interface RoadmapMilestone {
    id: string;
    quarter: string;
    year: 2026 | 2027;
    phase: RoadmapPhase;
    apps: string[];
    description: string;
    focus: string;
}

export const roadmapData: RoadmapMilestone[] = [
    {
        id: "q2-2026",
        quarter: "Q2",
        year: 2026,
        phase: "2026",
        apps: ["Solilo", "Lexica"],
        description: "Foundation apps launch",
        focus: "English — Psychological & Biological pillars",
    },
    {
        id: "q3-2026",
        quarter: "Q3",
        year: 2026,
        phase: "2026",
        apps: ["Dialecta", "Echo"],
        description: "Cognitive expansion",
        focus: "English — Accent decoding & Vocal conditioning",
    },
    {
        id: "q4-2026",
        quarter: "Q4",
        year: 2026,
        phase: "2026",
        apps: ["Oratio", "Syntaxis"],
        description: "Combat & Analysis training",
        focus: "English — Argumentative fluency & Syntax drilling",
    },
    {
        id: "q1-2027",
        quarter: "Q1",
        year: 2027,
        phase: "2027",
        apps: ["Visage"],
        description: "Reading comprehension revolution",
        focus: "English — Eye-tracking calibration",
    },
    {
        id: "q2-2027",
        quarter: "Q2",
        year: 2027,
        phase: "2027",
        apps: ["Metamorph"],
        description: "Advanced paraphrasing engine",
        focus: "English — Lexical constraint training",
    },
    {
        id: "q3-2027",
        quarter: "Q3",
        year: 2027,
        phase: "2027",
        apps: ["CORTEX Multilingual"],
        description: "Japanese language support",
        focus: "Multilingual — Kanji, hiragana, katakana systems",
    },
    {
        id: "q4-2027",
        quarter: "Q4",
        year: 2027,
        phase: "2027",
        apps: ["CORTEX Multilingual"],
        description: "Chinese language support",
        focus: "Multilingual — Traditional & Simplified character systems",
    },
];
