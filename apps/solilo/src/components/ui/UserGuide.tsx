'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';

const GUIDE_KEY = 'solilo-guide-seen';

interface UserGuideProps {
    onClose?: () => void;
}

export function UserGuide({ onClose }: UserGuideProps) {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Check if user has seen the guide before
        const hasSeenGuide = typeof window !== 'undefined'
            ? localStorage.getItem(GUIDE_KEY) === 'true'
            : false;

        if (!hasSeenGuide) {
            // Small delay to let the page load first
            setTimeout(() => setIsOpen(true), 500);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        if (typeof window !== 'undefined') {
            localStorage.setItem(GUIDE_KEY, 'true');
        }
        onClose?.();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm z-40 panel-enter"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
                <div
                    className="pointer-events-auto w-full max-w-2xl bg-white dark:bg-surface border border-gray-200 dark:border-surface-light rounded-2xl shadow-2xl overflow-hidden panel-enter"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-accent/5 dark:bg-accent/10 border-b border-gray-200 dark:border-accent/20 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-mono text-xl text-accent uppercase tracking-wider">
                                {t.guideWelcome}
                            </h2>
                            <button
                                onClick={handleClose}
                                className="text-gray-500 dark:text-muted hover:text-gray-800 dark:hover:text-foreground transition-colors"
                                aria-label="Close guide"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-6 space-y-5 max-h-[70vh] overflow-y-auto">
                        <p className="text-gray-800 dark:text-gray-100 leading-relaxed">
                            {t.guideIntro}
                        </p>

                        <div className="space-y-4">
                            {/* Step 1 */}
                            <div className="flex gap-4">
                                <div className="shrink-0 w-8 h-8 rounded-full bg-accent/10 dark:bg-accent/20 text-accent flex items-center justify-center font-mono text-sm font-bold">
                                    1
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-mono text-sm uppercase tracking-wide text-accent mb-1">
                                        {t.guideStep1Title}
                                    </h3>
                                    <p className="text-sm text-gray-800 dark:text-gray-100 leading-relaxed">
                                        {t.guideStep1Desc}
                                    </p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex gap-4">
                                <div className="shrink-0 w-8 h-8 rounded-full bg-accent/10 dark:bg-accent/20 text-accent flex items-center justify-center font-mono text-sm font-bold">
                                    2
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-mono text-sm uppercase tracking-wide text-accent mb-1">
                                        {t.guideStep2Title}
                                    </h3>
                                    <p className="text-sm text-gray-800 dark:text-gray-100 leading-relaxed">
                                        {t.guideStep2Desc}
                                    </p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="flex gap-4">
                                <div className="shrink-0 w-8 h-8 rounded-full bg-accent/10 dark:bg-accent/20 text-accent flex items-center justify-center font-mono text-sm font-bold">
                                    3
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-mono text-sm uppercase tracking-wide text-accent mb-1">
                                        {t.guideStep3Title}
                                    </h3>
                                    <p className="text-sm text-gray-800 dark:text-gray-100 leading-relaxed">
                                        {t.guideStep3Desc}
                                    </p>
                                    <p className="text-xs text-muted mt-2">
                                        {t.guideStep3Tip}
                                    </p>
                                </div>
                            </div>

                            {/* Step 4 */}
                            <div className="flex gap-4">
                                <div className="shrink-0 w-8 h-8 rounded-full bg-accent/10 dark:bg-accent/20 text-accent flex items-center justify-center font-mono text-sm font-bold">
                                    4
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-mono text-sm uppercase tracking-wide text-accent mb-1">
                                        {t.guideStep4Title}
                                    </h3>
                                    <p className="text-sm text-gray-800 dark:text-gray-100 leading-relaxed">
                                        {t.guideStep4Desc}
                                    </p>
                                    <p className="text-xs text-muted mt-2">
                                        {t.guideStep4Tip}
                                    </p>
                                </div>
                            </div>

                            {/* Step 5 */}
                            <div className="flex gap-4">
                                <div className="shrink-0 w-8 h-8 rounded-full bg-accent/10 dark:bg-accent/20 text-accent flex items-center justify-center font-mono text-sm font-bold">
                                    5
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-mono text-sm uppercase tracking-wide text-accent mb-1">
                                        {t.guideStep5Title}
                                    </h3>
                                    <p className="text-sm text-gray-800 dark:text-gray-100 leading-relaxed">
                                        {t.guideStep5Desc}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="mt-6 p-4 bg-gray-50 dark:bg-accent/5 border border-gray-200 dark:border-accent/20 rounded-lg">
                            <h3 className="font-mono text-xs uppercase tracking-wide text-accent mb-2">
                                {t.guideTipsTitle}
                            </h3>
                            <ul className="text-xs text-gray-800 dark:text-gray-100 space-y-1 list-disc list-inside">
                                <li>{t.guideTip1}</li>
                                <li>{t.guideTip2}</li>
                                <li>{t.guideTip3}</li>
                                <li>{t.guideTip4}</li>
                            </ul>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 dark:border-surface-light px-6 py-4 flex justify-end gap-3">
                        <button
                            onClick={handleClose}
                            className="px-6 py-2 bg-accent text-background font-mono text-sm uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity"
                        >
                            {t.guideGotIt}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
