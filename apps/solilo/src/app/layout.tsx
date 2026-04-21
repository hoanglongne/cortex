import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "SOLILO — IELTS Speaking Simulator",
  description: "Hardcore IELTS Speaking Part 2 practice. No excuses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${ibmPlexMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-gray-800 dark:text-gray-100" suppressHydrationWarning>
        <LanguageProvider>
          <ThemeProvider>
            {children}
            <div className="fixed top-4 right-4 flex items-center gap-3 z-30">
              <LanguageSwitcher />
              <ThemeSwitcher />
            </div>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
