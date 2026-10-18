"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label, Notice } from "@/components/ui/card";
import { FlowShell } from "@/components/ui/shell";

interface PartnerFoundScreenProps {
  partner: { name: string; band: string };
  onStartCall: () => void;
  onDecline: () => void;
  /** Getting the call token; the Ready button waits */
  isStarting?: boolean;
  /** Why the last attempt to join failed, if it did */
  error?: string | null;
}

export default function PartnerFoundScreen({
  partner,
  onStartCall,
  onDecline,
  isStarting = false,
  error,
}: PartnerFoundScreenProps) {
  return (
    <FlowShell>
      <div className="pt-10 animate-enter">
        <Label>Đã ghép được</Label>
        <h1 className="mt-3 break-words text-4xl font-semibold tracking-tight text-ink sm:text-5xl">{partner.name}</h1>
        <p className="mt-3 text-muted">
          Band <span className="font-mono tabular text-xl text-ink">{partner.band}</span>
        </p>

        <p className="mt-8 max-w-sm text-sm text-muted">
          Buổi luyện chỉ dùng âm thanh. Trình duyệt sẽ xin quyền dùng micro khi vào phòng.
        </p>

        {error && (
          <Notice tone="error" className="mt-6">
            {error}
          </Notice>
        )}

        <div className="mt-8 space-y-2">
          <Button variant="primary" size="lg" block onClick={onStartCall} disabled={isStarting}>
            {isStarting && <Loader2 className="animate-spin" />}
            {isStarting ? "Đang vào phòng…" : "Sẵn sàng"}
          </Button>
          <Button variant="ghost" block onClick={onDecline} disabled={isStarting}>
            Tìm bạn khác
          </Button>
        </div>
        <p className="mt-4 text-center text-xs text-subtle">Bấm khi bạn đã sẵn sàng nói.</p>
      </div>
    </FlowShell>
  );
}
