"use client";

import { AlarmClock, ChevronRight, Target, Power, Zap } from "lucide-react";
import type { SynapseChoice, SynapseScenario } from "../lib/synapseTypes";
import type { TerminalMode } from "./TerminalOutput";

export function TerminalOptions(props: {
  mode: TerminalMode;
  accentClass: string;
  borderClass: string;
  scenario: SynapseScenario | null;
  narrativeDone: boolean;
  selected: SynapseChoice | null;
  isGameOver: boolean;
  outcomeDone: boolean;
  onChoose: (choice: SynapseChoice) => void;
  onContinue: () => void;
  onRetry: () => void;
  onRestart: () => void;
}) {
  return (
    <div className={`${props.borderClass} bg-[#0a0a0a] p-4 space-y-4`}>
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="text-[12px] font-black uppercase tracking-[0.3em] text-white/80 flex items-center gap-2">
          <Target className={`h-4 w-4 ${props.accentClass}`} />
          Tactical_Options
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
          <AlarmClock className="h-3 w-3" />
          {props.mode === "loading" ? "SYNCING..." : "LIVE_FEED"}
        </div>
      </div>

      <div className="space-y-3">
        {props.scenario && props.narrativeDone && !props.selected ? (
          props.scenario.choices.map((c: SynapseChoice) => (
            <button
              key={c.particle}
              type="button"
              onClick={() => props.onChoose(c)}
              className={`${props.borderClass} w-full p-4 text-left hover:bg-white/5 transition-all group relative overflow-hidden`}
              disabled={props.isGameOver}
            >
              <div className="absolute top-0 left-0 w-1 h-0 bg-[#3dff7a] group-hover:h-full transition-all duration-300"></div>
              <div className="flex items-start gap-4">
                <div className="flex items-center gap-2 w-24 shrink-0">
                  <ChevronRight className={`h-5 w-5 ${props.accentClass} group-hover:translate-x-1 transition-transform`} />
                  <span className={`${props.accentClass} uppercase tracking-widest font-black text-[14px]`}>
                    {c.particle}
                  </span>
                </div>
                <div className="flex-1 border-l border-white/10 pl-4 leading-relaxed text-[11px] font-medium text-white/50 group-hover:text-white/80 transition-colors uppercase italic">
                  {c.meaning}
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="text-[12px] text-white/30 italic p-4 border border-dashed border-white/10 text-center">
            {props.scenario
              ? "Awaiting neural synchronization..."
              : "Execute INITIATE_DEPLOYMENT to begin."}
          </div>
        )}
      </div>

      {props.selected && props.selected.isCorrect && props.outcomeDone ? (
        <button
          type="button"
          onClick={props.onContinue}
          className={`${props.borderClass} w-full py-4 text-[14px] font-black uppercase tracking-[0.4em] text-[#0a0a0a] bg-[#3dff7a] hover:bg-white transition-all shadow-[0_0_15px_rgba(61,255,122,0.2)] flex items-center justify-center gap-2`}
        >
          CONTINUE_MISSION <ChevronRight className="h-4 w-4" />
        </button>
      ) : null}

      {props.selected && !props.selected.isCorrect && props.outcomeDone ? (
        <div className="space-y-3">
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-[12px] text-red-500 uppercase tracking-widest font-black text-center italic">
            {props.isGameOver ? "SYSTEM_WIPEOUT_DETECTED" : "CRITICAL_SYSTEM_DAMAGE"}
          </div>
          <button
            type="button"
            onClick={props.isGameOver ? props.onRestart : props.onRetry}
            className={`${props.borderClass} w-full py-4 text-[14px] font-black uppercase tracking-[0.4em] text-white bg-red-600/20 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2`}
          >
            {props.isGameOver ? <Power className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
            {props.isGameOver ? "REBOOT_SYSTEM" : "RETRY_SYNC"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

