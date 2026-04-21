SYSTEM ARCHITECTURE & PROJECT SPECIFICATION

PROJECT: CORTEX HUB (Language Tech Ecosystem Landing Page)

1. THE PHILOSOPHY: "THE ADOBE OF EDTECH"

Concept: We are building a central hub for a suite of EdTech applications.

The "Pure Function" Rule: We DO NOT build "Super Apps". Every application in our ecosystem serves exactly ONE specific purpose (e.g., Vocal reflex, Eye-tracking, Syntax slicing). Fast, ruthless, and highly focused.

The "Glue": All apps are connected by "CORTEX", an underlying data operating system (Centralized Linguistic Profile) that shares user performance data across all apps.

Scalability: The ecosystem will scale from 4 apps to 20+ apps. Therefore, the UI MUST be completely data-driven (rendered from JSON/TypeScript objects), using scalable layouts like Bento Grids.

2. DESIGN SYSTEM & VIBE

Theme: Strict Dark Mode (bg-slate-950 or #0a0a0a), Minimalist, Brutalist.

Typography: - Headings: Bold, aggressive Sans-serif (e.g., Inter or Space Grotesk).

Tech details/Dates: Monospace (e.g., Fira Code or JetBrains Mono).

Layout: Bento Grid systems for application display. Extreme negative space. Sharp corners (no overly rounded borders).

Motion: Use framer-motion for layout transitions, grid rendering, and scroll reveals.

3. DATA ARCHITECTURE (CRITICAL)

Do NOT hardcode UI cards. Create a data/ecosystem.ts file exporting an array of objects based on this strict schema:

export type AppStatus = 'Live' | 'Development' | 'Idea';
export type Pillar = 'Biological' | 'Psychological' | 'Cognitive' | 'Combat' | 'Core';
export type LanguageFocus = 'English' | 'Multilingual';

export interface EcosystemApp {
  id: string;
  name: string;
  status: AppStatus;
  pillar: Pillar;
  pureFunctionDesc: string; // "Solves EXACTLY one problem: [desc]"
  colorAccent: string; // Hex code for glowing effects
  targetLaunchDate?: string; // e.g., "Q3 2026"
  language: LanguageFocus;
  upvotes?: number; // For ideas only
  href?: string;
}


Mock Data to include: * Live: Solilo (Psychological), Lexica (Biological), Dialecta (Cognitive), Oratio (Combat).

Ideas: Echo (Vocal conditioning), Syntaxis (Syntax slicing), Visage (Eye-tracking), Metamorph (Paraphrasing constraints).

4. PAGE SECTIONS (Top to Bottom)

A. The Manifesto (Hero Section)

Headline: "Ngừng Nhồi Nhét. Bắt Đầu Thực Chiến." (Stop Cramming. Start Combating).

Sub-headline: Explain the "Pure Function" philosophy. No bloated apps. Just surgical tools for specific linguistic weaknesses.

CTA: "Truy Cập Hệ Sinh Thái" (Enter Ecosystem - SSO Login placeholder).

Visual: A minimalist animated node graph representing CORTEX feeding data to satellite apps.

B. CORTEX: The Central Brain

Dedicated section explaining the "Glue".

Explain that CORTEX remembers your mistakes in App A and forces you to face them in App B.

C. THE ARSENAL (Live & Dev Apps)

A dynamic Bento Grid mapping over the data array where status === 'Live' || status === 'Development'.

Include a simple filter bar: [All] [Biological] [Psychological] [Cognitive].

Each card must visually pop its colorAccent on hover.

D. THE INCUBATOR (Idea Bank)

A Kanban-style board or clean list mapping over data where status === 'Idea'.

Each idea card MUST have a functional-looking (mock) "Vote" button. Encourage community driven development.

E. THE ROADMAP (2026 - 2027)

A vertical timeline detailing the 6-8 week development cycles.

Crucial UI Interaction: A Toggle Switch at the top of the roadmap:

State 1: "2026: The English Foundation"

State 2: "2027: The Multilingual Pivot" (When toggled, show timeline expanding to Japanese/Chinese support).

F. PARTNERSHIP & CUSTOM SOLUTIONS (B2B)

Message: "Don't rebuild the wheel. Let us build the engine for you."

Service Offerings (B2B Packages):

API Integration: Connect CORTEX data and our "Pure Function" mechanics directly into your existing LMS (Learning Management System).

Ecosystem Integration: White-label our existing apps (Lexica, Solilo, etc.) and adapt them exclusively for your curriculum.

Custom EdTech Development: Need a specific tool to solve a unique teaching problem? We design and build entirely new, high-performance Web/Apps from scratch, tailored specifically to your center's methodology.

Form/CTA: "Become a Partner" targeting English Centers, Educational Institutions, and Investors.

5. EXECUTION DIRECTIVES FOR AI

Act as a Senior Frontend Architect.

Initialize a Next.js App Router project with Tailwind and Framer Motion.

START by building the data/ecosystem.ts mock database based on the schema above.

Build the page section by section. DO NOT output the entire codebase at once. Ask for my review after completing the Schema & Hero Section, then proceed to the Bento Grid, etc.