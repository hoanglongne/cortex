import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dialecta — Huấn Luyện Giải Mã Giọng Nói | CORTEX HUB",
    description:
        "Giọng không phải để nhận ra. Chúng để giải mã thời gian thực. Dialecta rèn luyện tai qua đa dạng vùng miền.",
};

export default function DialectaLayout({ children }: { children: React.ReactNode }) {
    return children;
}
