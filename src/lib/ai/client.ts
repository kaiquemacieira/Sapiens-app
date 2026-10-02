import type { AiQuestionKind, AiRegionResponse } from "./types";
import {
  aiCacheKey,
  getCachedAi,
  setCachedAi,
} from "@/lib/offline/cache";

export async function askAboutRegion(params: {
  ra: number;
  dec: number;
  radius: number;
  objectName?: string | null;
  objectId?: string | null;
  question?: string;
  kind?: AiQuestionKind;
}): Promise<AiRegionResponse> {
  const key = aiCacheKey({
    ra: params.ra,
    dec: params.dec,
    radius: params.radius,
    kind: params.kind ?? "summary",
    question: params.question ?? "",
    objectName: params.objectName,
  });

  try {
    const res = await fetch("/api/ai/region", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || body.message || `HTTP ${res.status}`);
    }
    const data = (await res.json()) as AiRegionResponse;
    await setCachedAi(key, data);
    return data;
  } catch (err) {
    const cached = await getCachedAi(key);
    if (cached) return cached;
    throw err;
  }
}
