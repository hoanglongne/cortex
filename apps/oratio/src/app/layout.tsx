import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import PwaRegister from "@/components/PwaRegister";
import "./globals.css";

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Oratio – Luyện IELTS Speaking",
  description: "Luyện IELTS Speaking mỗi ngày: tự nói và nghe lại, thi thử với người học thật, được người thật chấm theo 4 tiêu chí.",
  applicationName: "Oratio",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: { capable: true, title: "Oratio", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAFC" },
    { media: "(prefers-color-scheme: dark)", color: "#0E0F1A" },
  ],
};

// Sets data-theme before the first paint so there is no light/dark flash
const themeScript = `(function(){try{var t=localStorage.getItem("oratio-theme")||"system";var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light"}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={beVietnam.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen" suppressHydrationWarning>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
