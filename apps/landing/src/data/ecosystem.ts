export type AppStatus = 'Live' | 'Development' | 'Idea';
export type Pillar = 'Biological' | 'Psychological' | 'Cognitive' | 'Combat' | 'Core';
export type LanguageFocus = 'English' | 'Multilingual';

export const pillarMap: Record<Pillar, string> = {
    Biological: 'Sinh Học',
    Psychological: 'Tâm Lý',
    Cognitive: 'Nhận Thức',
    Combat: 'Chiến Đấu',
    Core: 'Cốt Lõi',
};

export const statusMap: Record<AppStatus, string> = {
    Live: 'Trực Tuyến',
    Development: 'Đang Phát Triển',
    Idea: 'Ý Tưởng',
};

export const languageMap: Record<LanguageFocus, string> = {
    English: 'Tiếng Anh',
    Multilingual: 'Đa Ngôn Ngữ',
};

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
            'Giải quyết CHÍNH XÁC một vấn đề: Loại bỏ nỗi sợ nói tiếng Anh thông qua các bài tập lặp lại cưỡng bức.',
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
            'Giải quyết CHÍNH XÁC một vấn đề: Tái cấu trúc khả năng ghi nhớ từ vựng thông qua các bài kiểm tra áp lực lặp lại ngắt quãng.',
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
            'Giải quyết CHÍNH XÁC một vấn đề: Huấn luyện giải mã trọng âm theo thời gian thực trên các vùng miền khác nhau.',
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
            'Giải quyết CHÍNH XÁC một vấn đề: Xây dựng sự trôi chảy trong tranh luận dưới áp lực thời gian.',
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
            'Giải quyết CHÍNH XÁC một vấn đề: Rèn luyện trí nhớ cơ bắp giọng nói thông qua các vòng lặp shadowing.',
        colorAccent: '#22d3ee',
        targetLaunchDate: 'Quý 3 2026',
        language: 'English',
        upvotes: 84,
    },
    {
        id: 'syntaxis',
        name: 'Syntaxis',
        status: 'Idea',
        pillar: 'Cognitive',
        pureFunctionDesc:
            'Giải quyết CHÍNH XÁC một vấn đề: Phân tách các câu phức tạp thành các thành phần cây phân tích để luyện tập mẫu câu.',
        colorAccent: '#6366f1',
        targetLaunchDate: 'Quý 4 2026',
        language: 'English',
        upvotes: 127,
    },
    {
        id: 'visage',
        name: 'Visage',
        status: 'Idea',
        pillar: 'Biological',
        pureFunctionDesc:
            'Giải quyết CHÍNH XÁC một vấn đề: Huấn luyện tốc độ đọc và hiểu thông qua hiệu chuẩn theo dõi ánh mắt.',
        colorAccent: '#a855f7',
        targetLaunchDate: 'Quý 1 2027',
        language: 'English',
        upvotes: 63,
    },
    {
        id: 'metamorph',
        name: 'Metamorph',
        status: 'Idea',
        pillar: 'Cognitive',
        pureFunctionDesc:
            'Giải quyết CHÍNH XÁC một vấn đề: Ép buộc tạo ra các cách diễn đạt tương đương dưới các ràng buộc từ vựng nghiêm ngặt.',
        colorAccent: '#f43f5e',
        targetLaunchDate: 'Quý 2 2027',
        language: 'English',
        upvotes: 95,
    },
];
