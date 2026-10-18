import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Literata, Space_Grotesk } from "next/font/google";
import "./globals.css";

// Same UI fonts as Lexica (Cortex family); Literata sets spoken content
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Oratio – Phòng tập IELTS Speaking",
  description: "Luyện IELTS Speaking mỗi ngày: tự nói và nghe lại, thi thử với người học thật, được người thật chấm theo 4 tiêu chí.",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#0E0F11",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Font variables live on <html> so the theme's --font-* (defined on :root) can resolve them
    <html lang="vi" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${literata.variable}`} suppressHydrationWarning>
      <body className="min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
