import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import CloudSync from "./components/CloudSync";
import HydrationGate from "./components/HydrationGate";

// Design system fonts (docs/DESIGN_SYSTEM.md). Vietnamese subset is required:
// without it, accented letters fall back to the system font.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "LEXICA - IELTS Vocabulary Swiper",
  description: "Master IELTS vocabulary through addictive swipe-based micro-learning. The fastest way to level up your English.",
  keywords: ["IELTS", "vocabulary", "English learning", "flashcards", "education"],
  authors: [{ name: "ORATIO" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LEXICA",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0E0F11",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-ink overflow-x-hidden" suppressHydrationWarning>
        <AuthProvider>
          <CloudSync />
          <HydrationGate>{children}</HydrationGate>
        </AuthProvider>
      </body>
    </html>
  );
}
