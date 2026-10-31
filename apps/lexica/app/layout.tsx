import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import CloudSync from "./components/CloudSync";
import ClassSync from "./components/ClassSync";
import EngagementSync from "./components/EngagementSync";
import ContentLoader from "./components/ContentLoader";
import HydrationGate from "./components/HydrationGate";
import AppNav, { DesktopNav } from "./components/AppNav";
import BuddySync from "./components/BuddySync";

// Design system fonts (docs/DESIGN_SYSTEM.md). Vietnamese subset is required:
// without it, accented letters fall back to the system font.
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
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-bg text-ink overflow-x-hidden" suppressHydrationWarning>
        <AuthProvider>
          <CloudSync />
          <ClassSync />
          <BuddySync />
          <EngagementSync />
          <ContentLoader />
          <HydrationGate>
            <DesktopNav />
            {children}
            <AppNav />
          </HydrationGate>
        </AuthProvider>
      </body>
    </html>
  );
}
