/**
 * Agent tools — grounded in local catalog + scientific APIs
 */

import {
  searchObjects,
  ALL_OBJECTS,
  type AstronomicalObject,
} from "@/data/objects";
import { searchRegionPapers } from "@/lib/scientific/manager";
import { buildExtractiveAnswer } from "@/lib/ai/grounded";
import { recordToCitation } from "@/lib/ai/types";
import type { AgentContext, AgentToolResult, AgentToolName } from "./types";

function slim(o: AstronomicalObject) {
  return {
    id: o.id,
    name: o.name,
    type: o.type,
    ra: o.ra,
    dec: o.dec,
  };
}

export async function runTool(
  tool: AgentToolName,
  args: Record<string, unknown>,
  ctx: AgentContext
): Promise<AgentToolResult> {
  switch (tool) {
    case "search_catalog": {
      const q = String(args.query ?? "").trim();
      if (!q) {
        return { tool, ok: false, summary: "Empty catalog query." };
      }
      const hits = searchObjects(q, 8);
      return {
        tool,
        ok: true,
        summary:
          hits.length === 0
            ? `No catalog matches for "${q}".`
            : `Found ${hits.length} object(s) for "${q}".`,
        objects: hits.map(slim),
      };
    }

    case "lookup_object": {
      const id = String(args.objectId ?? args.name ?? "").toLowerCase();
      const obj =
        ALL_OBJECTS.find(
          (o) =>
            o.id.toLowerCase() === id ||
            o.name.toLowerCase() === id ||
            o.commonNames?.some((n) => n.toLowerCase() === id)
        ) ?? null;
      if (!obj) {
        return { tool, ok: false, summary: `Object not found: ${id}` };
      }
      return {
        tool,
        ok: true,
        summary: `${obj.name} (${obj.type}) at RA ${obj.ra.toFixed(3)}°, Dec ${obj.dec.toFixed(3)}°. ${obj.description ?? ""}`,
        objects: [slim(obj)],
        data: obj,
      };
    }

    case "fetch_papers": {
      const ra = Number(args.ra ?? ctx.ra);
      const dec = Number(args.dec ?? ctx.dec);
      const radius = Number(args.radius ?? ctx.radius ?? 0.5);
      const objectName =
        (args.objectName as string) || ctx.objectName || undefined;
      if (!Number.isFinite(ra) || !Number.isFinite(dec)) {
        return {
          tool,
          ok: false,
          summary: "Missing coordinates for literature fetch.",
        };
      }
      try {
        const result = await searchRegionPapers(
          {
            ra,
            dec,
            radiusDeg: radius,
            objectName: objectName ?? null,
          },
          { page: 1, limit: 30 }
        );
        const papers = result.records?.slice(0, 30) ?? [];
        return {
          tool,
          ok: true,
          summary: `Retrieved ${result.publicationCount} indexed works (${papers.length} loaded). Status: ${result.status}.`,
          papers,
          citations: papers.map(recordToCitation),
          data: {
            publicationCount: result.publicationCount,
            sources: result.sources,
            status: result.status,
          },
        };
      } catch (e) {
        return {
          tool,
          ok: false,
          summary: `Literature fetch failed: ${e instanceof Error ? e.message : "error"}`,
        };
      }
    }

    case "summarize_literature": {
      const papers = (args.papers as import("@/lib/scientific/types").ScientificRecord[]) ?? [];
      const kind =
        (args.kind as "summary" | "timeline" | "top_cited" | "open_access") ||
        "summary";
      const built = buildExtractiveAnswer(papers, {
        kind,
        objectName: ctx.objectName,
        ra: ctx.ra ?? 0,
        dec: ctx.dec ?? 0,
        question: String(args.question ?? ""),
      });
      return {
        tool,
        ok: true,
        summary: built.answer,
        citations: built.citations,
        papers,
      };
    }

    case "suggest_related": {
      const type = String(args.type ?? ctx.objectType ?? "");
      let pool = ALL_OBJECTS;
      if (type) pool = pool.filter((o) => o.type === type);
      // Prefer high scientific weight
      const ranked = [...pool]
        .sort(
          (a, b) => (b.scientificWeight ?? 0) - (a.scientificWeight ?? 0)
        )
        .filter((o) => o.id !== ctx.objectId)
        .slice(0, 5);
      return {
        tool,
        ok: true,
        summary:
          ranked.length === 0
            ? "No related catalog suggestions."
            : `Suggested ${ranked.length} related object(s).`,
        objects: ranked.map(slim),
      };
    }

    case "compare_objects": {
      const names = (args.names as string[]) ?? [];
      const found = names
        .map((n) =>
          ALL_OBJECTS.find(
            (o) =>
              o.name.toLowerCase() === n.toLowerCase() ||
              o.id.toLowerCase() === n.toLowerCase() ||
              o.commonNames?.some((c) => c.toLowerCase() === n.toLowerCase())
          )
        )
        .filter(Boolean) as AstronomicalObject[];
      if (found.length < 2) {
        return {
          tool,
          ok: false,
          summary: "Need at least two known catalog objects to compare.",
          objects: found.map(slim),
        };
      }
      const lines = found.map(
        (o) =>
          `• **${o.name}** (${o.type}) — RA ${o.ra.toFixed(2)}°, Dec ${o.dec.toFixed(2)}°` +
          (o.magnitude != null ? `, mag ${o.magnitude}` : "") +
          (o.description ? ` — ${o.description}` : "")
      );
      return {
        tool,
        ok: true,
        summary: `Comparison of ${found.length} catalog objects:\n${lines.join("\n")}\n\nCoordinates and descriptions are from the local SAPIENS catalog only — not a full astrophysical analysis.`,
        objects: found.map(slim),
      };
    }

    default:
      return { tool, ok: false, summary: `Unknown tool: ${tool}` };
  }
}
