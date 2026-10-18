import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Oratio — Luyện IELTS Speaking Với Người Học Thật | CORTEX HUB",
    description:
        "Ghép cặp với người học thật, thi thử IELTS Speaking Part 1–2–3 qua cuộc gọi thoại, đổi vai giám khảo và thí sinh, chấm nhau theo 4 tiêu chí IELTS.",
};

export default function OratioLayout({ children }: { children: React.ReactNode }) {
    return children;
}
