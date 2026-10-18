export const BRANCH_LABEL = { cert: 'Chứng chỉ', talk: 'Giao tiếp' } as const;

export const LEVELS = [
    { id: 'beginner', label: 'Cơ bản' },
    { id: 'intermediate', label: 'Trung cấp' },
    { id: 'advanced', label: 'Nâng cao' },
    { id: 'expert', label: 'Chuyên sâu' },
] as const;

export const levelLabel = (id: string | null | undefined) => LEVELS.find((l) => l.id === id)?.label ?? null;
