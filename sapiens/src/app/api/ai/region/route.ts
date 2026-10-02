import { NextRequest, NextResponse } from "next/server";
import { searchRegionPapers } from "@/lib/scientific/manager";
import { answerAboutRegion } from "@/lib/ai/grounded";
import type { AiQuestionKind } from "@/lib/ai/types";
import {
  rateLimit,
  clientKeyFromHeaders,
} from "@/lib/observability/rate-limit";
import { metrics } from "@/lib/observability/metrics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseNum(v: string | null, fallback: number): number {
  if (v === null || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

const KINDS: AiQuestionKind[] = [
  "summary",
  "timeline",
  "top_cited",
  "open_access",
  "custom",
];

export async function POST(req: NextRequest) {
  const rl = rateLimit({
    key: `ai:${clientKeyFromHeaders(req.headers)}`,
    limit: 15,
    windowMs: 60_000,
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Retry shortly." },
      { status: 429, headers: { "Retry-After": "45" } }
    );
  }
  metrics.inc("ai_requests");

  try {
    const body = (await req.json()) as {
      ra?: number;
      dec?: number;
      radius?: number;
      objectName?: string;
      objectId?: string;
      question?: string;
      kind?: string;
    };

    const ra = Number(body.ra);
    const dec = Number(body.dec);
    const radius = Number(body.radius ?? 0.5);

    if (!Number.isFinite(ra) || !Number.isFinite(dec)) {
      return NextResponse.json(
        { error: "ra and dec are required" },
        { status: 400 }
      );
    }

    const kind = (
      KINDS.includes(body.kind as AiQuestionKind)
        ? body.kind
        : body.question
          ? "custom"
          : "summary"
    ) as AiQuestionKind;

    // Pull a broad paper set for grounding (filters applied client-side for display)
    const papers = await searchRegionPapers(
      {
        ra,
        dec,
        radiusDeg: radius,
        objectName: body.objectName ?? null,
        objectId: body.objectId ?? null,
      },
      { page: 1, limit: 50, sort: "citations" }
    );

    const result = await answerAboutRegion(papers.records, {
      kind,
      objectName: body.objectName,
      ra,
      dec,
      question: body.question,
      preferGenerative: true,
    });

    return NextResponse.json({
      ...result,
      // expose how many unique papers grounded the answer
      sourcesBreakdown: papers.sources,
      status: papers.status,
    });
  } catch (e) {
    console.error("[api/ai/region]", e);
    return NextResponse.json(
      {
        error: "AI region query failed",
        message: e instanceof Error ? e.message : "unknown",
      },
      { status: 502 }
    );
  }
}

/** Also allow GET for simple summary links */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const ra = parseNum(sp.get("ra"), NaN);
  const dec = parseNum(sp.get("dec"), NaN);
  const radius = parseNum(sp.get("radius"), 0.5);
  const objectName = sp.get("objectName") || undefined;
  const kind = (sp.get("kind") as AiQuestionKind) || "summary";

  if (!Number.isFinite(ra) || !Number.isFinite(dec)) {
    return NextResponse.json(
      { error: "ra and dec are required" },
      { status: 400 }
    );
  }

  const papers = await searchRegionPapers(
    {
      ra,
      dec,
      radiusDeg: radius,
      objectName: objectName ?? null,
    },
    { page: 1, limit: 50, sort: "citations" }
  );

  const result = await answerAboutRegion(papers.records, {
    kind: KINDS.includes(kind) ? kind : "summary",
    objectName,
    ra,
    dec,
    preferGenerative: true,
  });

  return NextResponse.json(result);
}
