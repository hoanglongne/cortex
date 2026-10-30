import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono, Be_Vietnam_Pro, Lora, Patrick_Hand } from "next/font/google";
import ScrollToTop from "@/components/ScrollToTop";
import EcosystemRewardListener from "@/components/EcosystemRewardListener";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "700"],
});

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
});

const hand = Patrick_Hand({
  variable: "--font-patrick",
  subsets: ["latin", "vietnamese"],
  weight: "400",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Cortex: học xong là nhớ, dạy xong là thấy",
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
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${beVietnam.variable} ${lora.variable} ${hand.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0f0f0f] text-white">
        <ScrollToTop />
        <EcosystemRewardListener />
        {children}
      </body>
    </html>
  );
}
