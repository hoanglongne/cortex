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

  async fetchStoryArc(payload: StoryArcRequest): Promise<StoryArc> {
    const res = await fetch("/api/story-arc", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await parseJsonSafe<{ error?: string }>(res);
      throw new ApiError(data.error || "Failed to fetch story arc", res.status);
    }

    return parseJsonSafe<StoryArc>(res);
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
