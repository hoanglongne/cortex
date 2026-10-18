"use client";

import { useMemo } from "react";
import { ArrowLeft, Loader2, Repeat } from "lucide-react";
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
    <div className="min-h-screen bg-[#050505]">
      <div className="max-w-3xl mx-auto px-4 py-6 pb-12">
        <header className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            aria-label="Quay lại"
            className="p-2 -ml-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-400" aria-hidden="true" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-[#fffcff]">Bạn luyện cùng</h1>
            <p className="text-sm text-zinc-400">Những người bạn đã luyện với</p>
          </div>
        </header>

        {isLoading ? (
          <div className="py-16 flex items-center justify-center gap-2 text-sm text-zinc-400">
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            <span>Đang tải...</span>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
            <p className="text-sm text-red-400 mb-4">Không tải được danh sách. Vui lòng thử lại.</p>
            <button
              onClick={() => refresh()}
              className="px-4 py-2 rounded-lg bg-zinc-800 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : partners.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-zinc-400">Chưa luyện với ai. Ghép cặp để bắt đầu.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {partners.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-900/60 border border-white/10"
              >
                {p.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.avatarUrl}
                    alt=""
                    className="w-11 h-11 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div
                    className="w-11 h-11 rounded-full bg-gradient-to-br from-[#80c0f4] to-[#add5f5] flex items-center justify-center text-[#050505] font-semibold shrink-0"
                    aria-hidden="true"
                  >
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="text-sm font-semibold text-[#fffcff] truncate">{p.name}</p>
                    <span className="text-xs text-[#80c0f4]">Band {p.band}</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {p.count} buổi cùng nhau · gần nhất{" "}
                    {new Date(p.lastDate).toLocaleDateString("vi-VN")}
                  </p>
                  {p.wantsAgain && (
                    <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
                      <Repeat className="w-3 h-3" aria-hidden="true" />
                      Muốn luyện lại với bạn
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
