'use client';

import { useState } from 'react';
import { Copy } from 'lucide-react';

/** A class code with a copy button. */
export default function ClassCode({ code }: { code: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button
            type="button"
            onClick={(e) => {
                e.preventDefault();
                void navigator.clipboard?.writeText(code).then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                });
            }}
            title="Chép mã lớp"
            className="h-9 px-3 rounded-lg border border-line bg-bg font-mono tracking-widest text-ink flex items-center gap-1.5 hover:border-accent"
        >
            {code}
            <Copy className="w-3.5 h-3.5 text-muted" />
            {copied && <span className="text-[10px] text-accent">đã chép</span>}
        </button>
    );
}
