"use client";

import { useState } from "react";
import { BookOpen, Check, Lightbulb, X } from "lucide-react";
import type { SynapseChoice, SynapseScenario } from "../lib/synapseTypes";
import { LEVELS, LEVEL_HINT, LEVEL_LABEL, type Level, type LevelSetting, type Progress, unlocked } from "../lib/level";
import { useTheme } from "../context/ThemeContext";

/** The player's level: automatic, or fixed by hand. */
export function LevelPicker(props: { setting: LevelSetting; level: Level; progress: Progress; onPick: (s: LevelSetting) => void }) {
  const { theme } = useTheme();
  const options: { id: LevelSetting; label: string }[] = [{ id: "auto", label: "Tự động" }, ...LEVELS.map((l) => ({ id: l as LevelSetting, label: LEVEL_LABEL[l] }))];
  return (
    <section aria-label="Cấp độ" className="space-y-2">
      <div className="flex items-center justify-between text-[11px]" style={{ color: theme.colors.textMuted }}>
        <span>
          Cấp: <b style={{ color: theme.colors.text }}>{LEVEL_LABEL[props.level]}</b>
          {props.setting === "auto" ? " (tự nâng khi đúng nhiều)" : ""}
        </span>
        <span>{unlocked(props.progress)} cụm đã mở</span>
      </div>
      <div className="grid grid-cols-4 gap-1.5" role="group">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => props.onPick(o.id)}
            aria-pressed={props.setting === o.id}
            className="h-8 text-[11px] font-semibold border transition-colors"
            style={{
              borderColor: props.setting === o.id ? theme.colors.accent : theme.colors.border,
              color: props.setting === o.id ? theme.colors.accent : theme.colors.textMuted,
              background: props.setting === o.id ? theme.colors.accentMuted : "transparent",
            }}
          >
            {o.label}
          </button>
        ))}
      </div>
      <p className="text-[10px]" style={{ color: theme.colors.textMuted }}>
        {LEVEL_HINT[props.level]}
      </p>
    </section>
  );
}

/** The scene's hint, only when asked for. */
export function Hint({ scenario }: { scenario: SynapseScenario }) {
  const { theme } = useTheme();
  const [open, setOpen] = useState<string | null>(null);
  const shown = open === scenario.missionCode + scenario.baseVerb;
  if (!scenario.technicalHint) return null;
  return (
    <div className="text-[12px]" style={{ color: theme.colors.textMuted }}>
      {shown ? (
        <p className="p-3 border" style={{ borderColor: theme.colors.border }}>
          <Lightbulb className="inline h-3.5 w-3.5 mr-1.5" />
          {scenario.technicalHint}
        </p>
      ) : (
        <button type="button" onClick={() => setOpen(scenario.missionCode + scenario.baseVerb)} className="flex items-center gap-1.5 underline underline-offset-4">
          <Lightbulb className="h-3.5 w-3.5" /> Cần gợi ý?
        </button>
      )}
    </div>
  );
}

/** "Use": no options, type the particle. */
export function TypeAnswer({ baseVerb, onSubmit }: { baseVerb: string; onSubmit: (typed: string) => void }) {
  const { theme } = useTheme();
  const [typed, setTyped] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (typed.trim()) onSubmit(typed);
      }}
      className="space-y-2"
    >
      <label className="block text-[11px]" style={{ color: theme.colors.textMuted }}>
        Gõ tiểu từ còn thiếu: <b style={{ color: theme.colors.text }}>{baseVerb} ___</b>
      </label>
      <input
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        autoFocus
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        aria-label={`Gõ tiểu từ sau ${baseVerb}`}
        className="w-full h-11 px-3 text-[14px] border bg-transparent focus:outline-none"
        style={{ borderColor: theme.colors.accent, color: theme.colors.text }}
      />
      <button type="submit" className="w-full h-10 text-[12px] font-bold uppercase tracking-wider" style={{ background: theme.colors.accent, color: theme.colors.bg }}>
        Chọn
      </button>
    </form>
  );
}

/** After a choice: all four phrases side by side, so the confusable ones are learnt together. */
export function PhraseBook({ scenario, selected }: { scenario: SynapseScenario; selected: SynapseChoice }) {
  const { theme } = useTheme();
  return (
    <section aria-label="Sổ cụm" className="space-y-2">
      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider" style={{ color: theme.colors.textMuted }}>
        <BookOpen className="h-3.5 w-3.5" /> Sổ cụm
      </p>
      <ul className="space-y-2">
        {scenario.choices.map((c) => {
          const mine = c.particle.trim().toLowerCase() === selected.particle.trim().toLowerCase();
          return (
            <li key={c.particle} className="p-3 border text-[12px]" style={{ borderColor: c.isCorrect ? theme.colors.accent : theme.colors.border, background: c.isCorrect ? theme.colors.accentMuted : "transparent" }}>
              <p className="flex items-center gap-1.5 font-bold" style={{ color: theme.colors.text }}>
                {c.isCorrect ? <Check className="h-3.5 w-3.5" style={{ color: theme.colors.accent }} /> : mine ? <X className="h-3.5 w-3.5" style={{ color: theme.colors.danger }} /> : null}
                {scenario.baseVerb} {c.particle}
                {mine && <span className="text-[10px] font-normal" style={{ color: theme.colors.textMuted }}>(bạn chọn)</span>}
              </p>
              {c.meaning && <p style={{ color: theme.colors.textMuted }}>{c.meaning}</p>}
              <p className="mt-1 italic" style={{ color: theme.colors.textMuted }}>
                {c.example ?? c.outcome}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
