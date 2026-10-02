import { NextRequest, NextResponse } from "next/server";
import { searchRegionPapers } from "@/lib/scientific/manager";
import type { PaperSort, PaperSourceFilter } from "@/lib/scientific/types";
import {
  rateLimit,
  clientKeyFromHeaders,
} from "@/lib/observability/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseNum(v: string | null, fallback: number): number {
  if (v === null || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function parseOptionalInt(v: string | null): number | null {
  if (v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

const SORTS: PaperSort[] = [
  "citations",
  "year_desc",
  "year_asc",
  "relevance",
  "title",
];

const SOURCES: PaperSourceFilter[] = ["all", "ads", "arxiv"];

export async function GET(req: NextRequest) {
  const rl = rateLimit({
    key: `papers:${clientKeyFromHeaders(req.headers)}`,
    limit: 40,
    windowMs: 60_000,
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Retry shortly." },
      { status: 429, headers: { "Retry-After": "30" } }
    );
  }

  const sp = req.nextUrl.searchParams;
  const ra = parseNum(sp.get("ra"), NaN);
  const dec = parseNum(sp.get("dec"), NaN);
  const radius = parseNum(sp.get("radius"), 0.5);
  const page = Math.max(1, parseNum(sp.get("page"), 1));
  const limit = Math.min(50, Math.max(1, parseNum(sp.get("limit"), 20)));
  const openAccessOnly =
    sp.get("openAccess") === "1" || sp.get("openAccess") === "true";
  const preprintsOnly =
    sp.get("preprint") === "1" || sp.get("preprint") === "true";
  const yearFrom = parseOptionalInt(sp.get("yearFrom"));
  const yearTo = parseOptionalInt(sp.get("yearTo"));
  const sortParam = (sp.get("sort") ?? "citations") as PaperSort;
  const sort = SORTS.includes(sortParam) ? sortParam : "citations";
  const sourceParam = (sp.get("source") ?? "all") as PaperSourceFilter;
  const source = SOURCES.includes(sourceParam) ? sourceParam : "all";
  const objectName = sp.get("objectName") || sp.get("object") || undefined;
  const objectId = sp.get("objectId") || undefined;

  if (!Number.isFinite(ra) || !Number.isFinite(dec)) {
    return NextResponse.json(
      { error: "ra and dec are required (degrees)" },
      { status: 400 }
    );
  }

  try {
    const result = await searchRegionPapers(
      {
        ra,
        dec,
        radiusDeg: radius,
        objectName: objectName ?? null,
        objectId: objectId ?? null,
      },
      {
        page,
        limit,
        openAccessOnly,
        preprintsOnly,
        yearFrom,
        yearTo,
        source,
        sort,
      }
    );
    return NextResponse.json(result);
  } catch (e) {
    console.error("[api/sky/region/papers]", e);
    return NextResponse.json(
      {
        error: "Scientific papers search failed",
        message: e instanceof Error ? e.message : "unknown",
      },
      { status: 502 }
    );
  }
}
