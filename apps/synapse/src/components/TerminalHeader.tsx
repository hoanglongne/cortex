"use client";

import {
  Heart,
  RefreshCcw,
  Terminal,
  Activity,
  Cpu,
  Trophy,
  AlertTriangle
} from "lucide-react";

export function TerminalHeader(props: {
  currentStage: number;
  maxStages: number;
  score: number;
  lives: number;
  integrity: number;
  isGameOver: boolean;
  isMissionClear: boolean;
  accent: "green" | "amber";
  accentClass: string;
  onToggleAccent: () => void;
  onRestart: () => void;
}) {
  const borderClass = "border border-[color:var(--terminal-border)]";

  return (
    <div className="flex flex-col border-b border-[color:var(--terminal-border)] bg-[#0f0f0f]">
      <div className="flex flex-col md:flex-row md:items-center justify-between px-4 py-3 gap-4">
        <div className="flex items-center gap-4">
          <div className={`p-2 border ${props.accent === 'green' ? 'border-[#3dff7a]/30' : 'border-[#ffb020]/30'} bg-black`}>
            <Terminal className={`h-5 w-5 ${props.accentClass}`} />
          </div>
          <div className="flex flex-col">
            <div className="text-[14px] font-black tracking-[0.3em] uppercase text-white flex items-center gap-2">
              SYNAPSE <span className={`text-[10px] px-1 border ${props.accentClass} opacity-50`}>v2.5</span>
            </div>
            <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
              Neural Link Established // Phrasal Reflex
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={props.onToggleAccent}
            className={`${borderClass} px-3 py-1 text-[10px] font-bold text-white/70 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2`}
          >
            <div className={`w-2 h-2 rounded-full ${props.accent === 'green' ? 'bg-[#3dff7a]' : 'bg-[#ffb020]'} shadow-[0_0_8px_currentColor]`}></div>
            {props.accent === "green" ? "GREEN_MODE" : "AMBER_MODE"}
          </button>

          <div className={`${borderClass} px-3 py-1 text-[10px] font-bold text-white/70 flex items-center gap-2 bg-black/40`}>
            <Cpu className="h-3 w-3 opacity-50" />
            STAGE {props.currentStage}/{props.maxStages}
          </div>

          <div className={`${borderClass} px-3 py-1 text-[10px] font-bold text-white/70 flex items-center gap-2 bg-black/40`}>
            <Trophy className="h-3 w-3 opacity-50" />
            SCORE {props.score}
          </div>

          <div className={`${borderClass} flex items-center gap-2 px-3 py-1 text-[10px] font-bold text-white/70 bg-black/40`}>
            <Heart className={`h-3 w-3 ${props.lives > 1 ? props.accentClass : 'text-[color:var(--terminal-danger)] animate-pulse'}`} fill="currentColor" fillOpacity={0.2} />
            LIVES {props.lives}
          </div>

          {props.isGameOver ? (
            <div
              className={`${borderClass} px-3 py-1 text-[10px] font-black text-[color:var(--terminal-danger)] bg-red-500/10 border-red-500/50 flex items-center gap-2`}
            >
              <AlertTriangle className="h-3 w-3" />
              MISSION_FAILED
            </div>
          ) : null}

          {props.isMissionClear ? (
            <div
              className={`${borderClass} px-3 py-1 text-[10px] text-[#3dff7a] font-black animate-pulse bg-[#3dff7a]/10 border-[#3dff7a]/50 uppercase tracking-widest`}
            >
              MISSION_CLEAR
            </div>
          ) : null}

          <button
            type="button"
            onClick={props.onRestart}
            className={`${borderClass} flex items-center gap-2 px-3 py-1 text-[10px] font-bold text-white/70 hover:text-white hover:bg-white/5 transition-all group`}
          >
            <RefreshCcw className="h-3 w-3 group-hover:rotate-180 transition-transform duration-500" />
            REBOOT_SYSTEM
          </button>
        </div>
      </div>
      
      {/* System Integrity Bar */}
      <div className="h-1.5 w-full bg-white/5 flex relative overflow-hidden">
        <div 
          className={`h-full transition-all duration-700 ease-out relative z-10 ${props.integrity > 40 ? (props.accent === 'green' ? 'bg-[#3dff7a]' : 'bg-[#ffb020]') : 'bg-red-500 animate-pulse'}`}
          style={{ width: `${props.integrity}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="text-[8px] font-bold tracking-[0.5em] text-white/20 uppercase">System_Integrity_Matrix</div>
        </div>
      </div>
    </div>
  );
}
