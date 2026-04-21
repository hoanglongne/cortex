import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Echo — Điều Kiện Hóa Bộ Nhớ Cơ Giọng | CORTEX HUB",
    description:
        "Shadowing không phải để bắt chước. Để điều kiện hóa cơ. Echo rèn luyện phản xạ qua vòng lặp lặp lại.",
};

export default function EchoLayout({ children }: { children: React.ReactNode }) {
    return children;
}
