import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Shell from "./components/Shell";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Lexica Studio",
  description: "Biên tập Trend Drop cho Lexica",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#0E0F11" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-bg text-ink">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
