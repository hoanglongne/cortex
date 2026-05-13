'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share, Plus, ChevronUp } from 'lucide-react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

const DISMISSED_KEY = 'lexica-install-prompt-dismissed';

/**
 * PWA Install Prompt Component
 * 
 * - Android/Desktop: Shows "Cài App" button → triggers native install prompt
 * - iOS: Shows instructions modal (Share → Add to Home Screen)
 * - Auto-dismisses after install or manual dismiss
 * - Only shows once (persisted in localStorage)
 */
export default function InstallPWAPrompt() {
    const { isInstallable, isIOS, isAndroid, isStandalone, promptInstall } = useInstallPrompt();
    const [showPrompt, setShowPrompt] = useState(false);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);
    const [isInstalling, setIsInstalling] = useState(false);

    useEffect(() => {
        // Don't show if already installed
        if (isStandalone) {
            return;
        }

        // Check if user dismissed before
        const dismissed = localStorage.getItem(DISMISSED_KEY);
        if (dismissed === 'true') {
            return;
        }

        // Show prompt after 2 seconds (let user see the page first)
        const timer = setTimeout(() => {
            setShowPrompt(true);
        }, 2000);

        return () => clearTimeout(timer);
    }, [isStandalone]);

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem(DISMISSED_KEY, 'true');
    };

    const handleInstallAndroid = async () => {
        setIsInstalling(true);
        const outcome = await promptInstall();
        setIsInstalling(false);

        if (outcome === 'accepted') {
            // User accepted install
            setShowPrompt(false);
            localStorage.setItem(DISMISSED_KEY, 'true');
        } else if (outcome === 'dismissed') {
            // User dismissed
            setShowPrompt(false);
            localStorage.setItem(DISMISSED_KEY, 'true');
        }
        // If 'not-available', keep showing (shouldn't happen)
    };

    const handleShowIOSInstructions = () => {
        setShowIOSInstructions(true);
    };

    // Don't render anything if already installed or dismissed
    if (isStandalone || (!isInstallable && !isIOS)) {
        return null;
    }

    return (
        <>
            {/* Android/Desktop: Install Button */}
            <AnimatePresence>
                {showPrompt && isInstallable && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-20 left-4 right-4 z-40 md:left-auto md:right-6 md:max-w-sm"
                    >
                        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-4 shadow-2xl border border-cyan-400/30">
                            <button
                                onClick={handleDismiss}
                                className="absolute -top-2 -right-2 p-1.5 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors shadow-lg"
                            >
                                <X className="w-4 h-4 text-slate-200" />
                            </button>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Download className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-bold text-lg mb-1">
                                        Cài Lexica App
                                    </h3>
                                    <p className="text-white/90 text-sm mb-3">
                                        Học nhanh hơn với app! Offline, nhanh, không quảng cáo.
                                    </p>
                                    <button
                                        onClick={handleInstallAndroid}
                                        disabled={isInstalling}
                                        className="w-full px-4 py-2.5 bg-white hover:bg-slate-100 text-cyan-600 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isInstalling ? 'Đang cài...' : '🚀 Cài ngay (3 giây)'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* iOS: Install Button (opens instructions) */}
            <AnimatePresence>
                {showPrompt && isIOS && !showIOSInstructions && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-20 left-4 right-4 z-40 md:left-auto md:right-6 md:max-w-sm"
                    >
                        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-4 shadow-2xl border border-cyan-400/30">
                            <button
                                onClick={handleDismiss}
                                className="absolute -top-2 -right-2 p-1.5 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors shadow-lg"
                            >
                                <X className="w-4 h-4 text-slate-200" />
                            </button>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Download className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-bold text-lg mb-1">
                                        Cài Lexica App
                                    </h3>
                                    <p className="text-white/90 text-sm mb-3">
                                        Học nhanh hơn với app! Chỉ mất 5 giây.
                                    </p>
                                    <button
                                        onClick={handleShowIOSInstructions}
                                        className="w-full px-4 py-2.5 bg-white hover:bg-slate-100 text-cyan-600 rounded-lg font-bold transition-colors"
                                    >
                                        📱 Xem cách cài (iOS)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* iOS: Instructions Modal */}
            <AnimatePresence>
                {showIOSInstructions && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                            onClick={() => {
                                setShowIOSInstructions(false);
                                handleDismiss();
                            }}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="fixed inset-x-4 top-1/2 -translate-y-1/2 mx-auto max-w-md z-50 bg-slate-800 border border-cyan-500/30 rounded-2xl p-6"
                        >
                            <button
                                onClick={() => {
                                    setShowIOSInstructions(false);
                                    handleDismiss();
                                }}
                                className="absolute top-4 right-4 p-2 hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>

                            <div className="space-y-6">
                                {/* Header */}
                                <div className="text-center">
                                    <div className="p-3 bg-cyan-500/20 rounded-full w-fit mx-auto mb-3">
                                        <Download className="w-8 h-8 text-cyan-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-2">
                                        Cài Lexica App trên iOS
                                    </h2>
                                    <p className="text-slate-400 text-sm">
                                        Làm theo 3 bước đơn giản dưới đây (5 giây)
                                    </p>
                                </div>

                                {/* Steps */}
                                <div className="space-y-4">
                                    {/* Step 1: Tap Share */}
                                    <div className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                                        <div className="flex-shrink-0 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                                            1
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-medium mb-2">
                                                Nhấn nút <span className="text-cyan-400">Share</span>
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-blue-500 rounded-lg">
                                                    <Share className="w-5 h-5 text-white" />
                                                </div>
                                                <span className="text-slate-400 text-sm">
                                                    (Ở thanh dưới cùng Safari)
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Step 2: Add to Home Screen */}
                                    <div className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                                        <div className="flex-shrink-0 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                                            2
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-medium mb-2">
                                                Chọn <span className="text-cyan-400">"Add to Home Screen"</span>
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-slate-700 rounded-lg">
                                                    <Plus className="w-5 h-5 text-white" />
                                                </div>
                                                <span className="text-slate-400 text-sm">
                                                    (Cuộn xuống trong menu)
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Step 3: Confirm */}
                                    <div className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                                        <div className="flex-shrink-0 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                                            3
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-medium mb-1">
                                                Nhấn <span className="text-cyan-400">"Add"</span>
                                            </p>
                                            <span className="text-slate-400 text-sm">
                                                Xong! App sẽ xuất hiện trên Home Screen 🎉
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="pt-4 border-t border-slate-700">
                                    <button
                                        onClick={() => {
                                            setShowIOSInstructions(false);
                                            handleDismiss();
                                        }}
                                        className="w-full px-4 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg font-bold transition-colors"
                                    >
                                        Đã hiểu
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
