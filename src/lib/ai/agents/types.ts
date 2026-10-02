/**
 * Multi-agent types — SAPIENS Phase 17
 */

import type { AiCitation } from "@/lib/ai/types";
import type { AstronomicalObject } from "@/data/objects";
import type { ScientificRecord } from "@/lib/scientific/types";

export type AgentRole =
  | "orchestrator"
  | "catalog"
  | "literature"
  | "guide"
  | "compare";

export type AgentToolName =
  | "search_catalog"
  | "lookup_object"
  | "fetch_papers"
  | "summarize_literature"
  | "suggest_related"
  | "compare_objects";

export interface AgentMessage {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  agent?: AgentRole;
  toolName?: AgentToolName;
  citations?: AiCitation[];
  objects?: Pick<AstronomicalObject, "id" | "name" | "type" | "ra" | "dec">[];
  timestamp: string;
}

export interface AgentContext {
  ra?: number;
  dec?: number;
  radius?: number;
  objectName?: string | null;
  objectId?: string | null;
  objectType?: string | null;
  locale?: "en" | "pt";
}

export interface AgentRunRequest {
  message: string;
  context?: AgentContext;
  history?: AgentMessage[];
}

export interface AgentToolResult {
  tool: AgentToolName;
  ok: boolean;
  summary: string;
  data?: unknown;
  citations?: AiCitation[];
  objects?: Pick<AstronomicalObject, "id" | "name" | "type" | "ra" | "dec">[];
  papers?: ScientificRecord[];
}

export interface AgentRunResponse {
  messages: AgentMessage[];
  answer: string;
  agentsUsed: AgentRole[];
  toolsUsed: AgentToolName[];
  citations: AiCitation[];
  objects: Pick<AstronomicalObject, "id" | "name" | "type" | "ra" | "dec">[];
  mode: "extractive" | "generative" | "agent";
  warnings: string[];
  timestamp: string;
}
