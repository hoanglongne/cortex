'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { deepLinkTarget } from '../lib/native';

/**
 * Inside the packaged app only (Capacitor): hides the splash once the page has drawn,
 * opens links that point at Lexica inside the app, and says so when the phone is offline
 * (the pages are in the app, so most of it still works). Renders nothing on the web.
 */
export default function NativeShell() {
    const router = useRouter();
    const [offline, setOffline] = useState(false);

    useEffect(() => {
        let off: (() => void) | undefined;
        let cancelled = false;
        (async () => {
            const { Capacitor } = await import('@capacitor/core');
            if (!Capacitor.isNativePlatform() || cancelled) return;
            const [{ SplashScreen }, { App }, { Network }] = await Promise.all([
                import('@capacitor/splash-screen'),
                import('@capacitor/app'),
                import('@capacitor/network'),
            ]);
            await SplashScreen.hide().catch(() => {});
            const open = (url: string) => {
                const target = deepLinkTarget(url);
                if (target) router.push(target);
            };
            // The link the app was started with (a share or a lexica:// link), then the ones that arrive while it runs.
            const launch = await App.getLaunchUrl().catch(() => undefined);
            if (launch?.url) open(launch.url);
            const opened = await App.addListener('appUrlOpen', ({ url }) => open(url));
            setOffline(!(await Network.getStatus()).connected);
            const net = await Network.addListener('networkStatusChange', (s) => setOffline(!s.connected));
            off = () => {
                void opened.remove();
                void net.remove();
            };
        })().catch(() => {});
        return () => {
            cancelled = true;
            off?.();
        };
    }, [router]);

    if (!offline) return null;
    return (
        <div role="status" className="fixed inset-x-0 top-0 z-[60] bg-ink px-4 pb-1.5 pt-[calc(env(safe-area-inset-top)+6px)] text-center text-xs font-semibold text-bg">
            Đang mất mạng. Phần đã tải vẫn dùng được.
        </div>
    );
}
