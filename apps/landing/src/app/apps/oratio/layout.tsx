import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Oratio — Xây Dựng Lưu Loát Tranh Luận | CORTEX HUB",
    description:
        "Tranh luận không phải để thắng. Để trôi chảy dưới áp lực. Oratio rèn luyện tư duy qua thời gian bó buộc.",
};

export default function OratioLayout({ children }: { children: React.ReactNode }) {
    return children;
}
