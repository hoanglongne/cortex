import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import ScrollToTop from "@/components/ScrollToTop";
import EcosystemRewardListener from "@/components/EcosystemRewardListener";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "CORTEX HUB — Language Tech Ecosystem",
  description:
    "The Adobe of EdTech. Surgical tools for specific linguistic weaknesses. No bloated apps — just pure functions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0f0f0f] text-white">
        <ScrollToTop />
        <EcosystemRewardListener />
        {children}
      </body>
    </html>
  );
}
