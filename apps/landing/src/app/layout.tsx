import type { Metadata } from "next";
import ScrollToTop from "@/components/ScrollToTop";
import EcosystemRewardListener from "@/components/EcosystemRewardListener";
import { SITE_URL } from "@/lib/links";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Cortex: học xong là nhớ, dạy xong là thấy",
  openGraph: { title: "Cortex: học xong là nhớ, dạy xong là thấy", description: "Người học nhớ từ lâu hơn. Thầy cô biết em nào cần giúp, ngay từ sáng.", type: "website", locale: "vi_VN" },
  description:
    "Cortex giúp người học nhớ từ vựng lâu hơn và giúp giáo viên, trung tâm biết em nào cần giúp trước khi em ấy bỏ cuộc.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-[#0f0f0f] text-white">
        <ScrollToTop />
        <EcosystemRewardListener />
        {children}
      </body>
    </html>
  );
}
