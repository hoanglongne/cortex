"use client";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative w-full border-t border-[rgba(255,255,255,0.06)] bg-[#000000] py-12 md:py-16">
            <div className="mx-auto max-w-7xl px-6">
                {/* Top Row */}
                <div className="flex flex-col gap-12 md:flex-row md:justify-between">
                    {/* Brand */}
                    <div className="max-w-sm">
                        <h3 className="font-sans text-2xl font-medium tracking-tight text-white">
                            CORTEX HUB
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-[rgba(255,255,255,0.5)]">
                            The Adobe of EdTech. Surgical tools for specific linguistic
                            weaknesses. No bloated apps — just pure functions.
                        </p>
                    </div>

                    {/* Links */}
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-3 md:gap-12">
                        {/* Products */}
                        <div>
                            <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-[rgba(255,255,255,0.5)]">
                                Products
                            </h4>
                            <ul className="mt-4 space-y-2">
                                <li>
                                    <a
                                        href="#ecosystem"
                                        className="text-sm text-[rgba(255,255,255,0.6)] transition-colors hover:text-white"
                                    >
                                        The Arsenal
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#cortex"
                                        className="text-sm text-[rgba(255,255,255,0.6)] transition-colors hover:text-white"
                                    >
                                        CORTEX
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#incubator"
                                        className="text-sm text-[rgba(255,255,255,0.6)] transition-colors hover:text-white"
                                    >
                                        Incubator
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Company */}
                        <div>
                            <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-[rgba(255,255,255,0.5)]">
                                Company
                            </h4>
                            <ul className="mt-4 space-y-2">
                                <li>
                                    <a
                                        href="#roadmap"
                                        className="text-sm text-[rgba(255,255,255,0.6)] transition-colors hover:text-white"
                                    >
                                        Roadmap
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#partnership"
                                        className="text-sm text-[rgba(255,255,255,0.6)] transition-colors hover:text-white"
                                    >
                                        Partnership
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-sm text-[rgba(255,255,255,0.6)] transition-colors hover:text-white"
                                    >
                                        About
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-[rgba(255,255,255,0.5)]">
                                Legal
                            </h4>
                            <ul className="mt-4 space-y-2">
                                <li>
                                    <a
                                        href="#"
                                        className="text-sm text-[rgba(255,255,255,0.6)] transition-colors hover:text-white"
                                    >
                                        Privacy
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-sm text-[rgba(255,255,255,0.6)] transition-colors hover:text-white"
                                    >
                                        Terms
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-sm text-[rgba(255,255,255,0.6)] transition-colors hover:text-white"
                                    >
                                        Contact
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[rgba(255,255,255,0.06)] pt-8 md:flex-row">
                    <p className="font-mono text-xs text-[rgba(255,255,255,0.4)]">
                        © {currentYear} CORTEX HUB. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <a
                            href="#"
                            className="text-[rgba(255,255,255,0.4)] transition-colors hover:text-white"
                            aria-label="GitHub"
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                        </a>
                        <a
                            href="#"
                            className="text-[rgba(255,255,255,0.4)] transition-colors hover:text-white"
                            aria-label="Twitter"
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </a>
                        <a
                            href="#"
                            className="text-[rgba(255,255,255,0.4)] transition-colors hover:text-white"
                            aria-label="LinkedIn"
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
