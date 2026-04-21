import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Syntaxis — Cắt Câu Thành Mẫu Để Khoan | CORTEX HUB",
    description:
        "Câu phức không để đọc. Để phân tích thành cây cú pháp. Syntaxis rèn luyện nhận mẫu qua khoan lặp lại.",
};

export default function SyntaxisLayout({ children }: { children: React.ReactNode }) {
    return children;
}
