import type { RequestedMode } from "../domain/client-factory.ts";

export interface ParsedAssessArgs {
  moduleId: string;
  mode: RequestedMode;
}

export class InvalidAssessCommandError extends Error {
  constructor(rawText: string) {
    super(`Unrecognized /legacy command: "${rawText}"`);
    this.name = "InvalidAssessCommandError";
  }
}

const MODE_FLAGS: Record<string, RequestedMode> = {
  "--agent": "agent",
  "--fixture": "fixture"
};

/**
 * Parses /legacy command text into a moduleId + requested mode.
 *
 * Accepted forms:
 *   "assess claims-batch"
 *   "assess claims-batch --agent"
 *   "assess claims-batch --fixture"
 *   "demo"                          (alias for "assess claims-batch")
 *   "demo --agent" / "demo --fixture"
 *
 * Mode flag is optional; omitted = "auto" (resolved later by client-factory).
 */
export const parseAssessArgs = (rawText: string | undefined): ParsedAssessArgs => {
  const normalized = rawText?.trim().toLowerCase().replace(/\s+/g, " ") ?? "";
  const tokens = normalized.split(" ").filter(Boolean);

  if (tokens.length === 0) {
    throw new InvalidAssessCommandError(rawText ?? "");
  }

  let mode: RequestedMode = "auto";
  const positional: string[] = [];

  for (const token of tokens) {
    if (token in MODE_FLAGS) {
      mode = MODE_FLAGS[token];
    } else {
      positional.push(token);
    }
  }

  // "demo" alias
  if (positional.length === 1 && positional[0] === "demo") {
    return { moduleId: "claims-batch", mode };
  }

  // "assess <module-id>"
  if (positional.length === 2 && positional[0] === "assess") {
    return { moduleId: positional[1], mode };
  }

  throw new InvalidAssessCommandError(rawText ?? "");
};