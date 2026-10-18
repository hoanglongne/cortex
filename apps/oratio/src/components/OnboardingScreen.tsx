"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useCharacterEnabled } from "@/lib/client/theme";
import type { Profile } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Label, Notice, Segments } from "@/components/ui/card";
import { Character, CharacterSays } from "@/components/ui/character";
import { FlowShell } from "@/components/ui/shell";
import { cn } from "@/lib/utils";

interface OnboardingScreenProps {
  profile: Profile | null;
  onDone: (start: "solo" | "exam") => void;
  onProfileUpdated?: () => void;
}

type Confidence = "shaky" | "hesitant" | "ready";

const CONFIDENCE: { id: Confidence; title: string; detail: string }[] = [
  { id: "shaky", title: "Run lắm, hay bị đứng hình", detail: "Bắt đầu bằng tập một mình, chưa cần gặp ai" },
  { id: "hesitant", title: "Nói được nhưng hay ngập ngừng", detail: "Tập nói cho trôi, rồi thử thi với người thật" },
  { id: "ready", title: "Khá tự tin, muốn thi thử thật", detail: "Vào thẳng Phòng thi với người thật" },
];

const BANDS = [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5];

const START_COPY: Record<Confidence, string> = {
  shaky: "Mình nghĩ mình nên tập một mình trước nhé. Không ai nghe, bạn nói sai cũng không sao.",
  hesitant: "Tập một mình vài câu cho ấm giọng, rồi vào Phòng thi khi bạn thấy ổn.",
  ready: "Bạn có thể vào Phòng thi ngay. Nếu muốn khởi động, tập một mình vài câu trước cũng hay.",
};

/**
 * First-run flow: how confident are you, which band do you aim for, where do
 * you want to start. Only the band is saved (to the profile); confidence just
 * picks the wording.
 */
export default function OnboardingScreen({ profile, onDone, onProfileUpdated }: OnboardingScreenProps) {
  const { enabled: characterOn } = useCharacterEnabled();
  const [step, setStep] = useState(0);
  const [confidence, setConfidence] = useState<Confidence | null>(null);
  const [band, setBand] = useState<number>(() => {
    const current = Number(profile?.target_band);
    return BANDS.includes(current) ? current : 6.5;
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const saveBand = async () => {
    setSaveError(null);
    if (!profile) return;
    setSaving(true);
    try {
      // The generated Database type has no Update shape for profiles, so the builder is typed loosely (as MeScreen does)
      const profiles = getSupabaseClient().from("profiles") as unknown as {
        update: (values: { target_band: number }) => { eq: (column: string, value: string) => PromiseLike<{ error: unknown }> };
      };
      const { error } = await profiles.update({ target_band: band }).eq("id", profile.id);
      if (error) setSaveError("Chưa lưu được band mục tiêu. Bạn vẫn tiếp tục được, đổi lại sau ở mục Tôi.");
      else onProfileUpdated?.();
    } catch {
      setSaveError("Chưa lưu được band mục tiêu. Bạn vẫn tiếp tục được, đổi lại sau ở mục Tôi.");
    } finally {
      setSaving(false);
    }
  };

  const next = async () => {
    if (step === 1) await saveBand();
    setStep((s) => s + 1);
  };

  const footer =
    step === 0 ? (
      <Button variant="primary" size="lg" block disabled={!confidence} onClick={next}>
        Tiếp tục
      </Button>
    ) : step === 1 ? (
      <Button variant="primary" size="lg" block disabled={saving} onClick={next}>
        {saving ? "Đang lưu…" : "Tiếp tục"}
      </Button>
    ) : (
      <div className="space-y-2">
        <Button variant="primary" size="lg" block onClick={() => onDone("solo")}>
          Tập một mình trước
        </Button>
        <Button variant="secondary" size="lg" block onClick={() => onDone("exam")}>
          Vào phòng thi
        </Button>
      </div>
    );

  return (
    <FlowShell
      onBack={step > 0 ? () => setStep(step - 1) : undefined}
      backLabel="Bước trước"
      progress={<Segments total={3} done={step} current={step} label={`Bước ${step + 1} trên 3`} />}
      footer={footer}
    >
      {step === 0 && (
        <div className="animate-enter">
          <CharacterSays mood="nervous" enabled={characterOn} className="mt-2">
            Mình cũng hồi hộp mỗi lần nói tiếng Anh đó. Nói thật đi, bạn thấy thế nào?
          </CharacterSays>
          <div className="mt-6 space-y-2.5" role="group" aria-label="Mức tự tin khi nói tiếng Anh">
            {CONFIDENCE.map((c) => {
              const on = confidence === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setConfidence(c.id)}
                  aria-pressed={on}
                  className={cn(
                    "w-full rounded-[16px] border-2 px-4 py-3 text-left transition-colors",
                    on ? "border-voice bg-voice-soft" : "border-line-strong bg-surface hover:bg-surface-2"
                  )}
                >
                  <span className="block text-base font-bold text-ink">{c.title}</span>
                  <span className="mt-0.5 block text-[13px] text-subtle">{c.detail}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="animate-enter">
          <h1 className="mt-2 text-[28px] font-extrabold tracking-[-0.035em] text-ink">Bạn muốn đạt band mấy?</h1>
          <p className="mt-2 text-sm text-muted">Chọn mục tiêu cho phần Speaking. Đổi lại lúc nào cũng được ở mục Tôi.</p>
          <Label className="mt-6">Band mục tiêu</Label>
          <div className="mt-2 grid grid-cols-4 gap-2" role="group" aria-label="Band mục tiêu">
            {BANDS.map((b) => {
              const on = band === b;
              return (
                <button
                  key={b}
                  onClick={() => setBand(b)}
                  aria-pressed={on}
                  className={cn(
                    "h-14 rounded-[12px] border-2 text-lg font-extrabold tabular transition-colors",
                    on ? "border-ink bg-ink text-bg" : "border-line-strong bg-surface text-ink hover:bg-surface-2"
                  )}
                >
                  {b.toFixed(1)}
                </button>
              );
            })}
          </div>
          {saveError && (
            <Notice tone="error" className="mt-4">
              {saveError}
            </Notice>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="animate-enter">
          {characterOn && (
            <div className="mt-2 flex justify-center">
              <Character mood="happy" size={120} decorative />
            </div>
          )}
          <h1 className="mt-4 text-center text-[28px] font-extrabold tracking-[-0.035em] text-ink">Bắt đầu từ đâu?</h1>
          <p className="mx-auto mt-2 max-w-sm text-center text-[15px] text-muted">
            Mục tiêu <span className="font-extrabold text-ink tabular">{band.toFixed(1)}</span>. {START_COPY[confidence ?? "hesitant"]}
          </p>
          {saveError && (
            <Notice tone="error" className="mt-4">
              {saveError}
            </Notice>
          )}
          <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-subtle">
            <Check className="size-3.5" aria-hidden /> Bạn có thể đổi cách luyện bất cứ lúc nào
          </p>
        </div>
      )}
    </FlowShell>
  );
}
