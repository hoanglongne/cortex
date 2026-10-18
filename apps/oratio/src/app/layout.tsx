import type { Metadata } from "next";
import { Geist, Geist_Mono, Gugi } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const gugi = Gugi({
  variable: "--font-gugi",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "ORATIO – Luyện IELTS Speaking với bạn thật",
  description: "Ghép cặp với người học khác, gọi thoại và luyện IELTS Speaking theo đề thật, rồi nhận đánh giá từ bạn luyện cùng.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${gugi.variable} antialiased bg-[#050505] text-white min-h-screen`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
