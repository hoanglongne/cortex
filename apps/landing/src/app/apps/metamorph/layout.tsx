import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Metamorph — Buộc Paraphrase Dưới Giới Hạn | CORTEX HUB",
    description:
        "Paraphrase không phải để dễ. Để chính xác dưới bó buộc. Metamorph rèn luyện linh hoạt qua giới hạn từ vựng.",
};

export default function MetamorphLayout({ children }: { children: React.ReactNode }) {
    return children;
}
