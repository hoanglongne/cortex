import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Visage — Rèn Luyện Tốc Độ Đọc Qua Eye-Tracking | CORTEX HUB",
    description:
        "Đọc không phải để hiểu. Để nhanh với hiểu. Visage rèn luyện tốc độ qua hiệu chỉnh chuyển động mắt.",
};

export default function VisageLayout({ children }: { children: React.ReactNode }) {
    return children;
}
