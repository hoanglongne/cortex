import type { Metadata } from 'next';
import { Be_Vietnam_Pro, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { SessionProvider } from './lib/session';

const sans = Be_Vietnam_Pro({ variable: '--font-be-vietnam', subsets: ['latin', 'vietnamese'], weight: ['400', '500', '600', '700'] });
const mono = JetBrains_Mono({ variable: '--font-jetbrains-mono', subsets: ['latin', 'vietnamese'], weight: ['400', '500'] });

export const metadata: Metadata = {
    title: 'Lexica cho lớp',
    description: 'Giữ nhịp cho lớp học từ vựng: giao bài, theo dõi, khen và nhắc đúng lúc.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="vi" suppressHydrationWarning>
            <head>
                {/* The chosen theme before first paint, so a dark page never flashes light. */}
                <script dangerouslySetInnerHTML={{ __html: "try{var t=localStorage.getItem('teach-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}" }} />
            </head>
            <body className={`${sans.variable} ${mono.variable} antialiased`}>
                <SessionProvider>{children}</SessionProvider>
            </body>
        </html>
    );
}
