"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState, Notice } from "@/components/ui/card";
import { FlowShell } from "@/components/ui/shell";
import { useCallHistory } from "@/hooks/useCallHistory";

interface PartnersScreenProps {
  onBack: () => void;
}

type CallSession = ReturnType<typeof useCallHistory>["sessions"][number];

interface PartnerGroup {
  id: string;
  name: string;
  band: string;
  avatarUrl: string | null;
  count: number;
  lastDate: string;
  wantsAgain: boolean;
}

function groupByPartner(sessions: CallSession[]): PartnerGroup[] {
  const map = new Map<string, PartnerGroup>();
  for (const s of sessions) {
    const existing = map.get(s.partner.id);
    const wants = s.peerFeedback?.wouldMatchAgain === true;
    if (!existing) {
      map.set(s.partner.id, {
        id: s.partner.id,
        name: s.partner.name,
        band: s.partner.band,
        avatarUrl: s.partner.avatarUrl,
        count: 1,
        lastDate: s.date,
        wantsAgain: wants,
      });
    } else {
      existing.count += 1;
      existing.wantsAgain = existing.wantsAgain || wants;
      if (new Date(s.date) > new Date(existing.lastDate)) {
        existing.lastDate = s.date;
        existing.name = s.partner.name;
        existing.band = s.partner.band;
        existing.avatarUrl = s.partner.avatarUrl;
      }
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime()
  );
}

export default function PartnersScreen({ onBack }: PartnersScreenProps) {
  const { sessions, error, isLoading, refresh } = useCallHistory();
  const partners = useMemo(() => groupByPartner(sessions), [sessions]);

  return (
    <FlowShell title="Bạn luyện cùng" onBack={onBack}>
      {isLoading ? (
        <div className="space-y-2" aria-busy>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-[var(--radius-card)] bg-surface" />
          ))}
        </div>
      ) : error ? (
        <Notice tone="error">
          <div className="flex items-center justify-between gap-3">
            <span>Không tải được danh sách.</span>
            <Button variant="secondary" size="sm" onClick={() => refresh()}>
              Thử lại
            </Button>
          </div>
        </Notice>
      ) : partners.length === 0 ? (
        <EmptyState title="Chưa luyện với ai">Vào phòng thi để được ghép với một người thật.</EmptyState>
      ) : (
        <ul className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-surface">
          {partners.map((p) => (
            <li key={p.id} className="px-4 py-3.5">
              <div className="flex items-baseline justify-between gap-3">
                <p className="min-w-0 truncate text-ink">{p.name}</p>
                <span className="shrink-0 font-mono text-xs tabular text-muted">Band {p.band}</span>
              </div>
              <p className="mt-0.5 text-xs text-muted">
                <span className="font-mono tabular">{p.count}</span> buổi · gần nhất{" "}
                {new Date(p.lastDate).toLocaleDateString("vi-VN")}
                {p.wantsAgain && <span className="text-ink-2"> · muốn luyện lại với bạn</span>}
              </p>
            </li>
          ))}
        </ul>
      )}
    </FlowShell>
  );
}
