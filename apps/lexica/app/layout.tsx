import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import CloudSync from "./components/CloudSync";
import ClassSync from "./components/ClassSync";
import EngagementSync from "./components/EngagementSync";
import ContentLoader from "./components/ContentLoader";
import HydrationGate from "./components/HydrationGate";
import AppNav, { DesktopNav } from "./components/AppNav";
import ErrorReporter from "./components/ErrorReporter";
import BuddySync from "./components/BuddySync";
import StudyDateBanner from "./components/StudyDateBanner";
import { DeviceVoiceBoot } from "./components/DeviceVoiceCard";

// Design system fonts (docs/DESIGN_SYSTEM.md). Vietnamese subset is required:
// without it, accented letters fall back to the system font.
const SITE = (() => {
  const own = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (own) return /^https?:\/\//i.test(own) ? own : `https://${own}`;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  return vercel ? `https://${vercel}` : "http://localhost:3000";
})();

const TITLE = "Lexica – Học từ tiếng Anh từ chính câu tiếng Việt của bạn";
const DESCRIPTION = "Mỗi ngày một phiên ngắn: hiểu, nhớ, gặp, dùng. Học từ vựng IELTS và giao tiếp qua câu chêm tiếng Việt, nghe giọng đọc, luyện nói.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: TITLE,
  description: DESCRIPTION,
  keywords: ["IELTS", "từ vựng tiếng Anh", "học từ vựng", "flashcard", "luyện nói"],
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Lexica",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Lexica: học từ tiếng Anh từ chính câu tiếng Việt của bạn" }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/og.png"] },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Lexica",
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
      lang="vi"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-bg text-ink overflow-x-hidden" suppressHydrationWarning>
        <AuthProvider>
          <ErrorReporter />
          <CloudSync />
          <ClassSync />
          <BuddySync />
          <StudyDateBanner />
          <DeviceVoiceBoot />
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
