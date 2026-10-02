import { NextRequest, NextResponse } from "next/server";
import { searchRegionCount } from "@/lib/scientific/manager";
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

export async function GET(req: NextRequest) {
  const rl = rateLimit({
    key: `region:${clientKeyFromHeaders(req.headers)}`,
    limit: 60,
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
  const objectName = sp.get("objectName") || sp.get("object") || undefined;
  const objectId = sp.get("objectId") || undefined;

  if (!Number.isFinite(ra) || !Number.isFinite(dec)) {
    return NextResponse.json(
      { error: "ra and dec are required (degrees)" },
      { status: 400 }
    );
  }
  if (ra < 0 || ra > 360 || dec < -90 || dec > 90) {
    return NextResponse.json(
      { error: "ra must be [0,360], dec must be [-90,90]" },
      { status: 400 }
    );
  }
  if (radius <= 0 || radius > 30) {
    return NextResponse.json(
      { error: "radius must be in (0, 30] degrees" },
      { status: 400 }
    );
  }

  try {
    const result = await searchRegionCount({
      ra,
      dec,
      radiusDeg: radius,
      objectName: objectName ?? null,
      objectId: objectId ?? null,
    });
    return NextResponse.json(result, {
      headers: {
        "X-RateLimit-Remaining": String(rl.remaining),
        "Cache-Control": result.cached
          ? "public, s-maxage=300, stale-while-revalidate=600"
          : "private, no-store",
      },
    });
  } catch (e) {
    console.error("[api/sky/region]", e);
    return NextResponse.json(
      {
        error: "Scientific search failed",
        message: e instanceof Error ? e.message : "unknown",
      },
      { status: 502 }
    );
  }
}
