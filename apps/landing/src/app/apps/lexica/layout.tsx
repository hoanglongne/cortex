import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Lexica — Tái Kết Nối Bộ Nhớ Từ Vựng | CORTEX HUB",
    description:
        "Từ vựng không phải để học. Nó để nhớ dưới áp lực. Lexica rèn luyện hồi tưởng qua thử nghiệm căng thẳng theo khoảng cách.",
};

export default function LexicaLayout({ children }: { children: React.ReactNode }) {
    return children;
}
