"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { useInstall } from "@/lib/client/pwa";
import { cn } from "@/lib/utils";

/**
 * "Cài Oratio lên máy": a real install prompt where the browser offers one,
 * the Share > Add to Home Screen steps on iPhone, nothing once installed.
 */
export function InstallButton({ className }: { className?: string }) {
  const { state, install } = useInstall();
  const [showIos, setShowIos] = useState(false);

  if (state === "installed" || state === "unavailable") return null;

  return (
    <div className={className}>
      <button
        onClick={() => (state === "prompt" ? install() : setShowIos((v) => !v))}
        aria-expanded={state === "ios" ? showIos : undefined}
        className={cn(
          "flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] border border-dashed border-line-strong text-[13px] font-bold text-ink hover:bg-surface-2"
        )}
      >
        <Download className="size-4" /> Cài Oratio lên máy
      </button>
      {showIos && (
        <p className="mt-2 text-xs leading-relaxed text-muted">
          Trên iPhone: bấm nút Chia sẻ của Safari, chọn “Thêm vào MH chính”.
        </p>
      )}
    </div>
  );
}
