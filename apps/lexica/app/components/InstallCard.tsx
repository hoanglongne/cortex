'use client';

import { useState } from 'react';
import { Download, Share } from 'lucide-react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

const DISMISSED_KEY = 'lexica-install-prompt-dismissed';

/**
 * "Cài Lexica" after the first session (docs/LEXICA_DIRECTION.md): asked
 * once the learner has seen what a day looks like, not on the first screen.
 */
export default function InstallCard() {
    const { isInstallable, isIOS, isStandalone, promptInstall } = useInstallPrompt();
    const [hidden, setHidden] = useState(() => {
        try {
            return localStorage.getItem(DISMISSED_KEY) === 'true';
        } catch {
            return false;
        }
    });
    if (isStandalone || hidden || (!isInstallable && !isIOS)) return null;
    const dismiss = () => {
        setHidden(true);
        try {
            localStorage.setItem(DISMISSED_KEY, 'true');
        } catch {
            // Private mode: it may be offered again.
        }
    };
    return (
        <div data-testid="install-card" className="rounded-2xl border border-accent/30 bg-accent/5 p-4">
            <p className="font-semibold text-ink">Cài Lexica lên màn hình chính</p>
            <p className="mt-1 text-sm text-muted">Mở bằng một chạm mỗi ngày, chạy cả khi mạng yếu.</p>
            {isIOS ? (
                <p className="mt-3 flex items-center gap-1.5 text-sm text-ink-2">
                    Bấm <Share className="w-4 h-4" /> Chia sẻ rồi chọn &ldquo;Thêm vào MH chính&rdquo;.
                </p>
            ) : (
                <button
                    onClick={() => void promptInstall().then((o) => o === 'accepted' && dismiss())}
                    className="mt-3 h-10 px-4 rounded-xl bg-accent text-on-accent font-bold flex items-center gap-2"
                >
                    <Download className="w-4 h-4" /> Cài app
                </button>
            )}
            <button onClick={dismiss} className="mt-2 text-xs text-muted underline">
                Để sau
            </button>
        </div>
    );
}
