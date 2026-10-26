import type { Metadata } from 'next';
import { Be_Vietnam_Pro, JetBrains_Mono, Lora } from 'next/font/google';
import './globals.css';
import { SessionProvider } from './lib/session';

const sans = Be_Vietnam_Pro({ variable: '--font-be-vietnam', subsets: ['latin', 'vietnamese'], weight: ['400', '500', '600', '700'] });
const serif = Lora({ variable: '--font-lora', subsets: ['latin', 'vietnamese'], weight: ['500', '600'], style: ['normal', 'italic'] });
const mono = JetBrains_Mono({ variable: '--font-jetbrains-mono', subsets: ['latin', 'vietnamese'], weight: ['400', '500'] });

export const metadata: Metadata = {
    title: 'Cortex cho lớp',
    description: 'Giữ nhịp cho lớp học từ vựng: giao bài, theo dõi, khen và nhắc đúng lúc.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="vi" suppressHydrationWarning>
            <head>
                {/* The chosen theme before first paint, so a dark page never flashes light. */}
                <script dangerouslySetInnerHTML={{ __html: "try{var t=localStorage.getItem('teach-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}" }} />
            </head>
            <body className={`${sans.variable} ${serif.variable} ${mono.variable} antialiased`}>
                <SessionProvider>{children}</SessionProvider>
            </body>
        </html>
    );
}
