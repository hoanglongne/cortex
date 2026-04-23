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
        description: "Ra mắt các ứng dụng nền tảng",
        focus: "Tiếng Anh — Trụ cột Tâm lý & Sinh học",
    },
    {
        id: "q3-2026",
        quarter: "Q3",
        year: 2026,
        phase: "2026",
        apps: ["Dialecta", "Echo"],
        description: "Mở rộng nhận thức",
        focus: "Tiếng Anh — Giải mã trọng âm & Điều kiện hóa giọng nói",
    },
    {
        id: "q4-2026",
        quarter: "Q4",
        year: 2026,
        phase: "2026",
        apps: ["Oratio", "Syntaxis"],
        description: "Huấn luyện chiến đấu & Phân tích",
        focus: "Tiếng Anh — Trôi chảy tranh luận & Rèn luyện cú pháp",
    },
    {
        id: "q1-2027",
        quarter: "Q1",
        year: 2027,
        phase: "2027",
        apps: ["Visage"],
        description: "Cách mạng đọc hiểu",
        focus: "Tiếng Anh — Hiệu chuẩn theo dõi ánh mắt",
    },
    {
        id: "q2-2027",
        quarter: "Q2",
        year: 2027,
        phase: "2027",
        apps: ["Metamorph"],
        description: "Công cụ diễn đạt nâng cao",
        focus: "Tiếng Anh — Huấn luyện ràng buộc từ vựng",
    },
    {
        id: "q3-2027",
        quarter: "Q3",
        year: 2027,
        phase: "2027",
        apps: ["CORTEX Multilingual"],
        description: "Hỗ trợ tiếng Nhật",
        focus: "Đa ngôn ngữ — Hệ thống Kanji, Hiragana, Katakana",
    },
    {
        id: "q4-2027",
        quarter: "Q4",
        year: 2027,
        phase: "2027",
        apps: ["CORTEX Multilingual"],
        description: "Hỗ trợ tiếng Trung",
        focus: "Đa ngôn ngữ — Hệ thống chữ Hán Phồn thể & Giản thể",
    },
];
