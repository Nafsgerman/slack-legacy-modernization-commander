import type { LegacyAnalysisClient } from "./types.ts";
import { deterministicLegacyAnalysisClient } from "./orchestrator.ts";
import { ClaudeLegacyAnalysisClient } from "../agent/claude-client.ts";

export type AnalysisMode = "fixture" | "agent";
export type RequestedMode = "auto" | AnalysisMode;

export interface ResolvedAnalysisClient {
  client: LegacyAnalysisClient;
  mode: AnalysisMode;
  model?: string;
}

const CLAUDE_MODEL = "claude-sonnet-4-6";

export class AgentModeUnavailableError extends Error {
  constructor() {
    super(
      "Agent mode requested but ANTHROPIC_API_KEY is not set. Set ANTHROPIC_API_KEY or omit --agent to use fixture mode."
    );
    this.name = "AgentModeUnavailableError";
  }
}

const hasApiKey = (): boolean => Boolean(process.env.ANTHROPIC_API_KEY);

export const createLegacyAnalysisClient = (): LegacyAnalysisClient =>
  hasApiKey() ? new ClaudeLegacyAnalysisClient() : deterministicLegacyAnalysisClient;

export const resolveAnalysisClient = (
  requested: RequestedMode = "auto"
): ResolvedAnalysisClient => {
  if (requested === "fixture") {
    return { client: deterministicLegacyAnalysisClient, mode: "fixture" };
  }

  if (requested === "agent") {
    if (!hasApiKey()) {
      throw new AgentModeUnavailableError();
    }
    return { client: new ClaudeLegacyAnalysisClient(), mode: "agent", model: CLAUDE_MODEL };
  }

  // auto
  if (hasApiKey()) {
    return { client: new ClaudeLegacyAnalysisClient(), mode: "agent", model: CLAUDE_MODEL };
  }
  return { client: deterministicLegacyAnalysisClient, mode: "fixture" };
};