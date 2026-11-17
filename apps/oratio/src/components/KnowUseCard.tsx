"use client";

import { useEffect, useMemo, useState } from "react";
import { Share2 } from "lucide-react";
import { getLexicaWords, type MyAnswer } from "@/actions/answers";
import { Button } from "@/components/ui/button";
import { Card, Label, Pill } from "@/components/ui/card";
import { knowUse, MIN_MINUTES, upgradesFor } from "@/lib/know-use";
import type { Tab } from "@/components/ui/shell";

/**
 * Khoảng cách Biết – Dùng (issue #137): Lexica words learned vs said in
 * recorded answers. Counts only; no speech leaves the device.
 */
export default function KnowUseCard({ answers, onTab }: { answers: MyAnswer[]; onTab: (tab: Tab) => void }) {
  const [learnedWords, setLearnedWords] = useState<string[] | null>(null);
  useEffect(() => {
    getLexicaWords().then((w) => setLearnedWords(w.all), () => setLearnedWords([]));
  }, []);

  const data = useMemo(() => (learnedWords ? knowUse(learnedWords, answers) : null), [learnedWords, answers]);
  const said = useMemo(() => new Set(answers.flatMap((a) => a.lexicaWords.map((w) => w.trim().toLowerCase()))), [answers]);
  const upgrades = useMemo(() => (learnedWords ? upgradesFor(answers, learnedWords, said) : []), [answers, learnedWords, said]);
  const [copied, setCopied] = useState(false);

  if (!data || data.learned === 0) return null;
  const pct = Math.round(data.rate * 100);
  const share = async () => {
    const text = `Biết ${data.learned} · Dùng ${data.used} từ tiếng Anh. Mình đang kéo khoảng cách này lại với Lexica và Oratio.`;
    try {
      if (navigator.share) await navigator.share({ text });
      else { await navigator.clipboard.writeText(text); setCopied(true); }
    } catch { /* cancelled */ }
  };

  return (
    <Card data-testid="know-use">
      <Label>Biết – Dùng</Label>
      {data.minutes < MIN_MINUTES ? (
        <p className="mt-2 text-sm text-muted">
          Nói thêm khoảng {Math.ceil(MIN_MINUTES - data.minutes)} phút ở tab Luyện để xem bạn đã dùng được bao nhiêu trong {data.learned} từ đã học ở Lexica.
        </p>
      ) : (
        <>
          <p className="mt-2 text-ink">
            Bạn đã học <b className="tabular">{data.learned}</b> từ. Trong <span className="tabular">{Math.round(data.minutes)}</span> phút nói gần đây, bạn đã dùng{" "}
            <b className="tabular text-voice">{data.used}</b> từ trong số đó.
          </p>
          <div className="mt-3 h-2 rounded-full bg-surface-2 overflow-hidden" aria-label={`Tỉ lệ dùng được ${pct}%`}>
            <div className="h-full bg-voice" style={{ width: `${Math.max(2, pct)}%` }} />
          </div>
          <p className="mt-1 text-xs text-muted">Tỉ lệ dùng được: {pct}%{data.weeks.length > 1 ? ` · tuần trước ${Math.round(data.weeks[data.weeks.length - 2].rate * 100)}%` : ""}</p>

          {upgrades.length > 0 && (
            <div className="mt-4 space-y-2">
              {upgrades.map((u) => (
                <p key={u.plain} className="text-sm text-ink-2">
                  Bạn nói <b>{u.plain}</b> trong {u.count} câu trả lời. Bạn đã học{" "}
                  {u.options.map((o, i) => (
                    <span key={o}>{i > 0 && (i === u.options.length - 1 ? " và " : ", ")}<b className="text-ink">{o}</b></span>
                  ))}{" "}
                  nhưng chưa dùng.
                </p>
              ))}
            </div>
          )}

          {data.unused.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-muted">Từ đã học, chưa nói lần nào (thử dùng ở câu tới):</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {data.unused.slice(0, 12).map((w) => <Pill key={w}>{w}</Pill>)}
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" variant="primary" onClick={() => onTab("practice")}>Nói một câu với từ mới</Button>
            <Button size="sm" variant="secondary" onClick={() => void share()}>
              <Share2 className="h-4 w-4" /> {copied ? "Đã chép" : `Biết ${data.learned} · Dùng ${data.used}`}
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
