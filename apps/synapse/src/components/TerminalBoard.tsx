"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ActionLog } from "@cortex/types";
import { apiClient } from "../lib/apiClient";
import type { SynapseChoice, SynapseScenario } from "../lib/synapseTypes";
import { useTypewriter } from "../hooks/useTypewriter";
import { TerminalHeader } from "./TerminalHeader";
import { TerminalOptions } from "./TerminalOptions";
import { TerminalOutput, type TerminalMode } from "./TerminalOutput";

function makeId() {
  return Math.random().toString(36).slice(2);
}

function nowIso() {
  return new Date().toISOString();
}

function toActionLog(
  sessionId: string,
  actionType: string,
  metadata: Record<string, unknown>,
): ActionLog {
  return {
    id: makeId(),
    userId: sessionId,
    appSource: "synapse",
    actionType,
    metadata,
    timestamp: new Date(),
  };
}

export function TerminalBoard(props: { 
  initialLoreId?: string; 
  initialMissionId?: string;
  onExit?: () => void 
}) {
  const [sessionId, setSessionId] = useState<string>(makeId());
  const [currentStage, setCurrentStage] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [integrity, setIntegrity] = useState(100);
  const [loreId] = useState(props.initialLoreId || "cyberpunk-01");
  const [missionId] = useState(props.initialMissionId);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isMissionClear, setIsMissionClear] = useState(false);
  const [mode, setMode] = useState<TerminalMode>("idle");
  const maxStages = 5;
  const [scenario, setScenario] = useState<SynapseScenario | null>(null);
  const [selected, setSelected] = useState<SynapseChoice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionHistory, setSessionHistory] = useState<ActionLog[]>([]);
  const [pastStages, setPastStages] = useState<
    Array<{ scenario: SynapseScenario; selected: SynapseChoice }>
  >([]);
  const [accent, setAccent] = useState<"green" | "amber">("green");

  const historyRef = useRef<ActionLog[]>([]);

  useEffect(() => {
    historyRef.current = sessionHistory;
  }, [sessionHistory]);

  const accentClass =
    accent === "green" ? "text-[#3dff7a]" : "text-[#ffb020]";
  const borderClass = "border border-[color:var(--terminal-border)]";

  const narrativeText = useMemo(() => scenario?.narrative || "", [scenario]);
  const outcomeText = useMemo(() => selected?.outcome || "", [selected]);

  const narrativeTw = useTypewriter(narrativeText, {
    cps: 70,
    enabled: mode === "narrative",
  });
  const outcomeTw = useTypewriter(outcomeText, {
    cps: 70,
    enabled: mode === "outcome",
  });

  async function loadScenario(stage: number) {
    setError(null);
    setScenario(null); // Clear previous scenario immediately to avoid duplication
    setMode("loading");

    try {
      const s = await apiClient.fetchScenario({
        sessionId,
        stage,
        loreId,
        missionId,
        sessionHistory: historyRef.current,
      });

      setScenario(s);
      setSelected(null);
      setMode("narrative");
    } catch (e) {
      setMode("idle");
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function onStart() {
    const newSessionId = makeId();
    setSessionId(newSessionId);
    setCurrentStage(1);
    setScore(0);
    setLives(3);
    setIntegrity(100);
    setIsGameOver(false);
    setIsMissionClear(false);
    setScenario(null);
    setSelected(null);
    setError(null);
    setPastStages([]);
    setSessionHistory([
      {
        id: makeId(),
        userId: newSessionId,
        appSource: "synapse",
        actionType: "START_SESSION",
        metadata: { at: nowIso() },
        timestamp: new Date(),
      },
    ]);

    try {
      setMode("loading");
      const s = await apiClient.fetchScenario({
        sessionId: newSessionId,
        stage: 1,
        loreId,
        missionId,
      });
      setScenario(s);
      setMode("narrative");
    } catch (e) {
      setMode("idle");
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  function onChoose(choice: SynapseChoice) {
    if (!scenario) return;
    if (isGameOver) return;
    if (!narrativeTw.done) return;

    setSelected(choice);
    setMode("outcome");

    setSessionHistory((h) =>
      h.concat(
        toActionLog(sessionId, "CHOOSE_PARTICLE", {
          missionCode: scenario.missionCode,
          baseVerb: scenario.baseVerb,
          particle: choice.particle,
          isCorrect: choice.isCorrect,
          narrative: scenario.narrative,
          outcome: choice.outcome,
          at: nowIso(),
        }),
      ),
    );

    if (choice.isCorrect) {
      setScore((s) => s + 10);
      
      // Apply gameplay effects from correct choices
      if (choice.effect === 'restore_life') {
        setLives((l) => Math.min(3, l + 1));
      } else if (choice.effect === 'integrity_boost') {
        setIntegrity((i) => Math.min(100, i + 20));
      }
    } else {
      setScore((s) => Math.max(0, s - 10));
      setIntegrity((i) => Math.max(0, i - 25)); // Mistake reduces system integrity
      
      const nextLives = lives - 1;
      setLives(nextLives);
      if (nextLives <= 0) {
        setIsGameOver(true);
      }
    }
  }

  async function onContinue() {
    if (!scenario) return;
    if (!selected?.isCorrect) return;
    if (!outcomeTw.done) return;

    setPastStages((prev) => [...prev, { scenario, selected }]);
    
    if (currentStage >= maxStages) {
      setIsMissionClear(true);
      setMode("idle");
      return;
    }

    const nextStage = currentStage + 1;
    setCurrentStage(nextStage);
    try {
      await loadScenario(nextStage);
    } catch (e) {
      setMode("idle");
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function onRetry() {
    if (!scenario) return;
    if (isGameOver) return;
    
    // Attempt to reload the current stage
    try {
      await loadScenario(currentStage);
    } catch (e) {
      setMode("idle");
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  function onRestart() {
    if (props.onExit) {
      props.onExit();
      return;
    }
    void onStart();
  }

  return (
    <div className="flex-1 w-full relative overflow-hidden bg-[#0a0a0a]">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#3dff7a 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>

      <div className="mx-auto w-full max-w-[1400px] px-2 md:px-4 py-2 md:py-4 relative z-10">
        <div
          className={`${borderClass} bg-[#0b0b0b]/90 backdrop-blur-sm shadow-[0_0_50px_rgba(0,0,0,0.7)]`}
          style={{ boxShadow: "0 0 0 1px rgba(61,255,122,0.1) inset" }}
        >
          <TerminalHeader
            currentStage={currentStage}
            maxStages={maxStages}
            score={score}
            lives={lives}
            integrity={integrity}
            isGameOver={isGameOver}
            isMissionClear={isMissionClear}
            accent={accent}
            accentClass={accentClass}
            onToggleAccent={() =>
              setAccent((a) => (a === "green" ? "amber" : "green"))
            }
            onRestart={onRestart}
          />

          <div className="grid grid-cols-1 xl:grid-cols-12">
            <TerminalOutput
              mode={mode}
              accentClass={accentClass}
              borderClass={borderClass}
              scenario={scenario}
              selected={selected}
              narrativeText={narrativeText}
              narrativeTyped={narrativeTw.text}
              narrativeDone={narrativeTw.done}
              outcomeText={outcomeText}
              outcomeTyped={outcomeTw.text}
              outcomeDone={outcomeTw.done}
              error={error}
              onStart={onStart}
              pastStages={pastStages}
            />

            <div className="xl:col-span-3 bg-black/20">
              <div className="px-4 py-6 space-y-6">
                <TerminalOptions
                  mode={mode}
                  accentClass={accentClass}
                  borderClass={borderClass}
                  scenario={scenario}
                  narrativeDone={narrativeTw.done}
                  selected={selected}
                  isGameOver={isGameOver}
                  outcomeDone={outcomeTw.done}
                  onChoose={onChoose}
                  onContinue={onContinue}
                  onRetry={onRetry}
                  onRestart={onRestart}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
