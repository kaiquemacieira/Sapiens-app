import { NextRequest, NextResponse } from "next/server";
import { runAgent } from "@/lib/ai/agents/orchestrator";
import type { AgentRunRequest } from "@/lib/ai/agents/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AgentRunRequest;
    if (!body?.message || typeof body.message !== "string") {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400 }
      );
    }
    if (body.message.length > 2000) {
      return NextResponse.json(
        { error: "message too long" },
        { status: 400 }
      );
    }

    const result = await runAgent({
      message: body.message.trim(),
      context: body.context,
      history: body.history?.slice(-12),
    });

    return NextResponse.json(result);
  } catch (e) {
    console.error("[api/ai/agent]", e);
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : "Agent failed",
      },
      { status: 500 }
    );
  }
}
