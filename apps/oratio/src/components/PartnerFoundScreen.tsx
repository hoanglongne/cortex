"use client";

import { Loader2 } from "lucide-react";
import { useCharacterEnabled } from "@/lib/client/theme";
import { Button } from "@/components/ui/button";
import { Card, Label, Notice } from "@/components/ui/card";
import { CharacterSays } from "@/components/ui/character";
import { FlowShell } from "@/components/ui/shell";

interface PartnerFoundScreenProps {
  partner: { name: string; band: string; country?: string | null };
  onStartCall: () => void;
  onDecline: () => void;
  /** Getting the call token; the Ready button waits */
  isStarting?: boolean;
  /** Why the last attempt to join failed, if it did */
  error?: string | null;
}

export default function PartnerFoundScreen({ partner, onStartCall, onDecline, isStarting = false, error }: PartnerFoundScreenProps) {
  const { enabled: characterOn } = useCharacterEnabled();

  return (
    <FlowShell title="Đã ghép được">
      <div className="mx-auto flex max-w-md flex-col gap-5 pt-2 animate-enter">
        <CharacterSays mood="happy" size={110} enabled={characterOn} className="justify-center">
          Có người luyện cùng bạn rồi.
        </CharacterSays>

        <Card className="text-center md:p-6">
          <Label>Bạn luyện cùng</Label>
          <h1 className="mt-2 break-words text-[32px] font-extrabold leading-tight tracking-[-0.035em] text-ink">{partner.name}</h1>
          <p className="mt-2 text-muted">
            Band <span className="text-xl font-extrabold text-ink tabular">{partner.band}</span>
            {partner.country ? <span className="text-subtle"> · {partner.country}</span> : null}
          </p>
        </Card>

        <p className="text-center text-sm text-muted">Buổi luyện chỉ dùng âm thanh. Trình duyệt sẽ xin quyền dùng micro khi vào phòng.</p>

        {error && <Notice tone="error">{error}</Notice>}

        <div className="space-y-2">
          <Button variant="primary" size="lg" block onClick={onStartCall} disabled={isStarting}>
            {isStarting && <Loader2 className="animate-spin" />}
            {isStarting ? "Đang vào phòng…" : "Sẵn sàng"}
          </Button>
          <Button variant="ghost" block onClick={onDecline} disabled={isStarting}>
            Tìm bạn khác
          </Button>
        </div>
      </div>
    </FlowShell>
  );
}
