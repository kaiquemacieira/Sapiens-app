import { NextResponse } from "next/server";
import { isAdsConfigured } from "@/lib/scientific/providers/ads";
import {
  isSupabaseConfigured,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/client";
import { cacheStats } from "@/lib/scientific/cache";
import { metrics } from "@/lib/observability/metrics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const snap = metrics.snapshot();
  const body = {
    ok: true,
    service: "sapiens",
    phase: 8,
    timestamp: new Date().toISOString(),
    uptimeSec: snap.uptimeSec,
    checks: {
      adsConfigured: isAdsConfigured(),
      supabaseConfigured: isSupabaseConfigured(),
      supabaseAdminConfigured: isSupabaseAdminConfigured(),
      aiConfigured: !!(
        process.env.AI_API_KEY ||
        process.env.OPENAI_API_KEY ||
        process.env.XAI_API_KEY
      ),
    },
    cache: cacheStats(),
    metrics: snap.counters,
  };

  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
