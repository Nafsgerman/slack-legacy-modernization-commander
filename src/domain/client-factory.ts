import type { LegacyAnalysisClient } from "./types.ts";
import { deterministicLegacyAnalysisClient } from "./orchestrator.ts";

export async function createLegacyAnalysisClient(): Promise<LegacyAnalysisClient> {
  if (process.env["ANTHROPIC_API_KEY"]) {
    const { ClaudeLegacyAnalysisClient } = await import("../agent/claude-client.ts");
    return new ClaudeLegacyAnalysisClient();
  }
  return deterministicLegacyAnalysisClient;
}