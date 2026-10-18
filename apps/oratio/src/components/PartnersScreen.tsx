"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState, Notice, Pill } from "@/components/ui/card";
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
      <h1 className="mb-5 text-[28px] font-extrabold tracking-[-0.035em] text-ink">Bạn luyện cùng</h1>
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
            <li key={p.id} className="flex items-center gap-3 px-4 py-3.5">
              <span
                aria-hidden
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-voice-soft text-sm font-extrabold text-voice"
              >
                {p.name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-ink">{p.name}</p>
                <p className="mt-0.5 text-[13px] text-subtle">
                  <span className="tabular">{p.count}</span> buổi · gần nhất {new Date(p.lastDate).toLocaleDateString("vi-VN")}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-xs font-bold tabular text-muted">Band {p.band}</span>
                {p.wantsAgain && <Pill tone="good">Muốn luyện lại</Pill>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </FlowShell>
  );
}
