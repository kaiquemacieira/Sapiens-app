/**
 * Lightweight multi-agent orchestrator — Phase 17
 * Plans tools from user intent, runs them, synthesizes grounded answer.
 * Does not invent papers or coordinates.
 */

import { runTool } from "./tools";
import type {
  AgentContext,
  AgentMessage,
  AgentRole,
  AgentRunRequest,
  AgentRunResponse,
  AgentToolName,
  AgentToolResult,
} from "./types";
import type { AiCitation } from "@/lib/ai/types";

function uid() {
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function msg(
  role: AgentMessage["role"],
  content: string,
  extra?: Partial<AgentMessage>
): AgentMessage {
  return {
    id: uid(),
    role,
    content,
    timestamp: new Date().toISOString(),
    ...extra,
  };
}

/** Very small intent router — no external LLM required for planning */
function planTools(
  text: string,
  ctx: AgentContext
): { tools: AgentToolName[]; agent: AgentRole }[] {
  const q = text.toLowerCase();
  const steps: { tools: AgentToolName[]; agent: AgentRole }[] = [];

  const wantsCompare =
    /\b(compare|versus|vs\.?|diferença|comparar)\b/.test(q) &&
    (q.includes(" and ") || q.includes(" e ") || q.includes(" vs"));
  const wantsRelated =
    /\b(related|similar|suggest|próximo|parecid|recomend)\b/.test(q);
  const wantsLit =
    /\b(paper|papers|literature|article|artigos?|ads|arxiv|publica|citação|citation|research|estudo)\b/.test(
      q
    ) ||
    /\b(what do we know|o que sabemos|timeline|most cited|open access)\b/.test(
      q
    );
  const wantsCatalog =
    /\b(find|search|where is|buscar|onde fica|show me|mostra)\b/.test(q) ||
    /\b(star|galaxy|nebula|black hole|exoplanet|estrela|galáxia)\b/.test(q);

  if (wantsCompare) {
    steps.push({ tools: ["compare_objects"], agent: "compare" });
  }

  // Extract possible object names after "compare X and Y"
  if (wantsCatalog && !wantsCompare) {
    steps.push({ tools: ["search_catalog"], agent: "catalog" });
  }

  if (ctx.objectName || ctx.objectId) {
    steps.push({ tools: ["lookup_object"], agent: "catalog" });
  }

  if (wantsLit || (!wantsCompare && !wantsCatalog && (ctx.ra != null || ctx.objectName))) {
    steps.push({
      tools: ["fetch_papers", "summarize_literature"],
      agent: "literature",
    });
  }

  if (wantsRelated || q.includes("what next") || q.includes("o que mais")) {
    steps.push({ tools: ["suggest_related"], agent: "guide" });
  }

  // Default: literature summary if sky context, else catalog search
  if (steps.length === 0) {
    if (ctx.ra != null && ctx.dec != null) {
      steps.push({
        tools: ["fetch_papers", "summarize_literature"],
        agent: "literature",
      });
    } else {
      steps.push({ tools: ["search_catalog"], agent: "catalog" });
    }
  }

  return steps;
}

function extractCompareNames(text: string): string[] {
  const m =
    text.match(/compare\s+(.+?)\s+and\s+(.+)/i) ||
    text.match(/comparar\s+(.+?)\s+e\s+(.+)/i) ||
    text.match(/(.+?)\s+vs\.?\s+(.+)/i);
  if (!m) return [];
  return [m[1].trim(), m[2].trim()].map((s) =>
    s.replace(/[?!.]+$/, "").trim()
  );
}

function extractSearchQuery(text: string): string {
  return text
    .replace(
      /\b(find|search|show me|where is|buscar|mostra|onde fica|what is|o que é)\b/gi,
      ""
    )
    .replace(/[?!.]+$/g, "")
    .trim()
    .slice(0, 80);
}

export async function runAgent(
  req: AgentRunRequest
): Promise<AgentRunResponse> {
  const ctx: AgentContext = req.context ?? {};
  const warnings: string[] = [];
  const agentsUsed: AgentRole[] = ["orchestrator"];
  const toolsUsed: AgentToolName[] = [];
  const messages: AgentMessage[] = [
    msg("user", req.message),
    msg(
      "assistant",
      "Planning tools from your question (catalog, literature, guide)…",
      { agent: "orchestrator" }
    ),
  ];

  const plan = planTools(req.message, ctx);
  const allCitations: AiCitation[] = [];
  const allObjects: AgentRunResponse["objects"] = [];
  let papers: import("@/lib/scientific/types").ScientificRecord[] = [];
  const answerParts: string[] = [];

  for (const step of plan) {
    agentsUsed.push(step.agent);
    for (const tool of step.tools) {
      toolsUsed.push(tool);
      const args: Record<string, unknown> = {};

      if (tool === "search_catalog") {
        args.query = extractSearchQuery(req.message) || ctx.objectName || "";
      }
      if (tool === "lookup_object") {
        args.objectId = ctx.objectId || ctx.objectName || "";
        args.name = ctx.objectName || "";
      }
      if (tool === "fetch_papers") {
        args.ra = ctx.ra;
        args.dec = ctx.dec;
        args.radius = ctx.radius ?? 0.5;
        args.objectName = ctx.objectName;
      }
      if (tool === "summarize_literature") {
        args.papers = papers;
        args.question = req.message;
        if (/timeline/i.test(req.message)) args.kind = "timeline";
        else if (/cited|cita/i.test(req.message)) args.kind = "top_cited";
        else if (/open access|acesso aberto/i.test(req.message))
          args.kind = "open_access";
        else args.kind = "summary";
      }
      if (tool === "suggest_related") {
        args.type = ctx.objectType;
      }
      if (tool === "compare_objects") {
        args.names = extractCompareNames(req.message);
      }

      const result: AgentToolResult = await runTool(tool, args, ctx);
      messages.push(
        msg("tool", result.summary, {
          agent: step.agent,
          toolName: tool,
          citations: result.citations,
          objects: result.objects,
        })
      );

      if (result.citations) allCitations.push(...result.citations);
      if (result.objects) allObjects.push(...result.objects);
      if (result.papers) papers = result.papers;

      if (tool === "summarize_literature" && result.ok) {
        answerParts.push(result.summary);
      } else if (tool === "compare_objects" && result.ok) {
        answerParts.push(result.summary);
      } else if (tool === "suggest_related" && result.ok && result.objects?.length) {
        answerParts.push(
          `Related catalog objects:\n` +
            result.objects
              .map((o) => `• ${o.name} (${o.type})`)
              .join("\n")
        );
      } else if (tool === "search_catalog" && result.ok && result.objects?.length) {
        answerParts.push(
          `Catalog matches:\n` +
            result.objects
              .map(
                (o) =>
                  `• ${o.name} (${o.type}) — RA ${o.ra.toFixed(2)}°, Dec ${o.dec.toFixed(2)}°`
              )
              .join("\n")
        );
      } else if (tool === "lookup_object" && result.ok) {
        answerParts.push(result.summary);
      } else if (!result.ok) {
        warnings.push(result.summary);
      }
    }
  }

  // Optional generative polish if OPENAI_API_KEY present
  let mode: AgentRunResponse["mode"] = "agent";
  let finalAnswer =
    answerParts.filter(Boolean).join("\n\n") ||
    "I could not assemble an answer from available tools. Try selecting an object on the sky or naming one in the catalog.";

  if (
    process.env.OPENAI_API_KEY &&
    papers.length > 0 &&
    answerParts.some((p) => p.length > 40)
  ) {
    try {
      const polished = await tryGenerativePolish(finalAnswer, papers.length);
      if (polished) {
        finalAnswer = polished;
        mode = "generative";
      }
    } catch {
      warnings.push("Generative polish unavailable — using extractive agent output.");
    }
  }

  finalAnswer +=
    "\n\n_Agent answers use the local catalog and retrieved ADS/arXiv records only. SAPIENS does not invent papers._";

  messages.push(
    msg("assistant", finalAnswer, {
      agent: "orchestrator",
      citations: dedupeCitations(allCitations).slice(0, 20),
      objects: dedupeObjects(allObjects).slice(0, 12),
    })
  );

  return {
    messages,
    answer: finalAnswer,
    agentsUsed: [...new Set(agentsUsed)],
    toolsUsed: [...new Set(toolsUsed)],
    citations: dedupeCitations(allCitations).slice(0, 20),
    objects: dedupeObjects(allObjects).slice(0, 12),
    mode,
    warnings,
    timestamp: new Date().toISOString(),
  };
}

function dedupeCitations(list: AiCitation[]): AiCitation[] {
  const seen = new Set<string>();
  const out: AiCitation[] = [];
  for (const c of list) {
    const k = c.doi || c.arxivId || c.adsBibcode || c.id;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(c);
  }
  return out;
}

function dedupeObjects(
  list: AgentRunResponse["objects"]
): AgentRunResponse["objects"] {
  const seen = new Set<string>();
  const out: AgentRunResponse["objects"] = [];
  for (const o of list) {
    if (seen.has(o.id)) continue;
    seen.add(o.id);
    out.push(o);
  }
  return out;
}

async function tryGenerativePolish(
  extractive: string,
  paperCount: number
): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const base = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You are SAPIENS, an astronomy literature assistant. Rewrite the provided grounded notes more clearly. Do NOT add papers, DOIs, facts, or numbers that are not in the notes. Keep citations implicit. Stay under 400 words.",
        },
        {
          role: "user",
          content: `Grounded notes (${paperCount} papers retrieved):\n\n${extractive}`,
        },
      ],
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content?.trim();
  return text || null;
}
