import { ActionLog, SynapseChoice, SynapseScenario } from "@cortex/types";

export type { SynapseChoice, SynapseScenario };

export type ScenarioRequest = {
  sessionId: string;
  stage: number;
  loreId?: string;
  missionId?: string;
  sessionHistory?: ActionLog[];
};
