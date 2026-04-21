import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Solilo — Loại Bỏ Lo Âu Khi Nói | CORTEX HUB",
    description:
        "Dừng suy nghĩ quá nhiều. Bắt đầu nói. Solilo loại bỏ lo âu khi nói thông qua các bài tập lặp lại độc thoại cưỡng bức. Trụ cột tâm lý của hệ sinh thái CORTEX.",
};

export default function SoliloLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
