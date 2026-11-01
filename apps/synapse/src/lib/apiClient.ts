import type { ScenarioRequest, StoryArcRequest, SynapseScenario, StoryArc } from "./synapseTypes";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function parseJsonSafe<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError(text || "Invalid JSON response", res.status);
  }
}

function readKept(key: string): StoryArc | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as StoryArc) : null;
  } catch {
    return null;
  }
}

function keep(key: string, arc: StoryArc) {
  try {
    localStorage.setItem(key, JSON.stringify(arc));
  } catch {
    // Private mode or full: the mission still plays online.
  }
}

export const apiClient = {
  async fetchScenario(payload: ScenarioRequest): Promise<SynapseScenario> {
    const res = await fetch("/api/scenario", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await parseJsonSafe<{ error?: string }>(res);
      throw new ApiError(data.error || "Failed to fetch scenario", res.status);
    }

    return parseJsonSafe<SynapseScenario>(res);
  },

  /**
   * A mission's scenes. Written (not AI) missions are kept on the device after
   * they load, so a mission played once can be played again with no network.
   */
  async fetchStoryArc(payload: StoryArcRequest): Promise<StoryArc> {
    const key = `synapse-arc-v1:${payload.loreId}:${payload.missionId}`;
    let res: Response;
    try {
      res = await fetch("/api/story-arc", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      const kept = readKept(key);
      if (kept) return kept;
      throw e;
    }

    if (!res.ok) {
      const kept = readKept(key);
      if (kept) return kept;
      const data = await parseJsonSafe<{ error?: string }>(res);
      throw new ApiError(data.error || "Failed to fetch story arc", res.status);
    }

    const arc = await parseJsonSafe<StoryArc>(res);
    // Only written scenes carry an id; an AI arc is different every time and is not kept
    if (arc.stages.every((s) => s.sceneId)) keep(key, arc);
    return arc;
  },

  /** "Ôn bằng truyện": up to three scenes for the phrases the player misses. */
  async fetchReview(phrases: string[], seen: string[]): Promise<StoryArc> {
    const res = await fetch("/api/review", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ phrases, seen }),
    });
    if (!res.ok) {
      const data = await parseJsonSafe<{ error?: string }>(res);
      throw new ApiError(data.error || "Không dựng được bài ôn", res.status);
    }
    return parseJsonSafe<StoryArc>(res);
  },

  /** "Báo cảnh có vấn đề". */
  async reportScene(missionId: string, stage: number, note: string): Promise<void> {
    await fetch("/api/report", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ missionId, stage, note }),
    });
  },
};
