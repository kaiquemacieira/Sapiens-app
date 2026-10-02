import type { AgentRunRequest, AgentRunResponse } from "./agents/types";
import {
  aiCacheKey,
  getCachedAi,
  setCachedAi,
} from "@/lib/offline/cache";
import type { AiRegionResponse } from "./types";

export async function runAgentClient(
  req: AgentRunRequest
): Promise<AgentRunResponse> {
  const ctx = req.context ?? {};
  const cacheKey = aiCacheKey({
    ra: ctx.ra ?? 0,
    dec: ctx.dec ?? 0,
    radius: ctx.radius ?? 0.5,
    kind: "agent",
    question: req.message,
    objectName: ctx.objectName,
  });

  try {
    const res = await fetch("/api/ai/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `HTTP ${res.status}`);
    }
    const data = (await res.json()) as AgentRunResponse;
    // Store a slim AI-compatible cache entry for offline
    const slim: AiRegionResponse = {
      answer: data.answer,
      kind: "custom",
      mode: data.mode === "generative" ? "generative" : "extractive",
      paperCount: data.citations.length,
      citations: data.citations,
      warnings: data.warnings,
      timestamp: data.timestamp,
    };
    await setCachedAi(cacheKey, slim);
    return data;
  } catch (err) {
    const cached = await getCachedAi(cacheKey);
    if (cached) {
      return {
        messages: [],
        answer: cached.answer,
        agentsUsed: ["orchestrator"],
        toolsUsed: [],
        citations: cached.citations,
        objects: [],
        mode: "agent",
        warnings: [
          ...(cached.warnings || []),
          "Served from offline AI cache.",
        ],
        timestamp: cached.timestamp,
      };
    }
    throw err;
  }
}
