import type { Confidence, RiskLevel, WorkPackagePriority } from "../domain/types.ts";

// ProposedEvidenceRef: model may claim these; application verifies them.
// NO validationStatus field — structurally absent, not just ignored.
export interface ProposedEvidenceRef {
  artifactId: string;
  startLine: number;
  endLine: number;
  // model may include a claimedExcerpt but application discards it
  claimedExcerpt?: string;
}

export interface ProposedRule {
  id: string;
  title: string;
  description: string;
  sourceEvidence: string;
  confidence: Confidence;
  proposedRefs?: ProposedEvidenceRef[];
  // any validationStatus the model tries to include is unmapped here
}

export interface ProposedDependency {
  name: string;
  type: "database" | "file" | "scheduler" | "api" | "team" | "platform";
  modernizationConcern: string;
  proposedRefs?: ProposedEvidenceRef[];
}

export interface ProposedUnknown {
  id: string;
  question: string;
  ownerRole: string;
  reason: string;
  proposedRefs?: ProposedEvidenceRef[];
}

export interface ProposedWorkPackage {
  key: string;
  title: string;
  priority: WorkPackagePriority;
  ownerRole: string;
  description: string;
  acceptanceCriteria: string[];
  proposedRefs?: ProposedEvidenceRef[];
}

// ModelProposal: what the Anthropic call returns after safe parsing.
// No validationStatus anywhere in this type tree.
export interface ModelProposal {
  assessmentId: string;
  moduleId: string;
  moduleName: string;
  language: string;
  platform: string;
  businessPurpose: string;
  modernizationRisk: {
    level: RiskLevel;
    rationale: string;
    drivers: string[];
    proposedRefs?: ProposedEvidenceRef[];
  };
  proposedRules: ProposedRule[];
  proposedDependencies: ProposedDependency[];
  proposedUnknowns: ProposedUnknown[];
  recommendedMigrationPath: string[];
  proposedWorkPackages: ProposedWorkPackage[];
  toolTrace: Array<{ tool: string; input: string; outputSummary: string }>;
}

// Safe parser — drops unknown/injected fields by construction via explicit pick
export function parseModelProposal(raw: unknown): ModelProposal {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("ModelProposal: expected object");
  }
  const r = raw as Record<string, unknown>;

  const parseRef = (x: unknown): ProposedEvidenceRef | null => {
    if (typeof x !== "object" || x === null) return null;
    const o = x as Record<string, unknown>;
    if (
      typeof o["artifactId"] !== "string" ||
      typeof o["startLine"] !== "number" ||
      typeof o["endLine"] !== "number"
    ) return null;
    // claimedExcerpt kept for transparency; validationStatus is not a field here at all
    return {
      artifactId: o["artifactId"],
      startLine: o["startLine"],
      endLine: o["endLine"],
      ...(typeof o["claimedExcerpt"] === "string" ? { claimedExcerpt: o["claimedExcerpt"] } : {}),
    };
  };

  const parseRefs = (arr: unknown): ProposedEvidenceRef[] =>
    Array.isArray(arr) ? arr.map(parseRef).filter(Boolean) as ProposedEvidenceRef[] : [];

  const parseRules = (arr: unknown): ProposedRule[] =>
    Array.isArray(arr)
      ? arr.filter((x): x is Record<string, unknown> => typeof x === "object" && x !== null).map((x) => ({
          id: String(x["id"] ?? ""),
          title: String(x["title"] ?? ""),
          description: String(x["description"] ?? ""),
          sourceEvidence: String(x["sourceEvidence"] ?? ""),
          confidence: (["low", "medium", "high"].includes(String(x["confidence"])) ? x["confidence"] : "low") as Confidence,
          proposedRefs: parseRefs(x["proposedRefs"]),
          // validationStatus is intentionally NOT mapped
        }))
      : [];

  const parseDeps = (arr: unknown): ProposedDependency[] =>
    Array.isArray(arr)
      ? arr.filter((x): x is Record<string, unknown> => typeof x === "object" && x !== null).map((x) => ({
          name: String(x["name"] ?? ""),
          type: (["database","file","scheduler","api","team","platform"].includes(String(x["type"])) ? x["type"] : "api") as ProposedDependency["type"],
          modernizationConcern: String(x["modernizationConcern"] ?? ""),
          proposedRefs: parseRefs(x["proposedRefs"]),
        }))
      : [];

  const parseUnknowns = (arr: unknown): ProposedUnknown[] =>
    Array.isArray(arr)
      ? arr.filter((x): x is Record<string, unknown> => typeof x === "object" && x !== null).map((x) => ({
          id: String(x["id"] ?? ""),
          question: String(x["question"] ?? ""),
          ownerRole: String(x["ownerRole"] ?? ""),
          reason: String(x["reason"] ?? ""),
          proposedRefs: parseRefs(x["proposedRefs"]),
        }))
      : [];

  const parseWPs = (arr: unknown): ProposedWorkPackage[] =>
    Array.isArray(arr)
      ? arr.filter((x): x is Record<string, unknown> => typeof x === "object" && x !== null).map((x) => ({
          key: String(x["key"] ?? ""),
          title: String(x["title"] ?? ""),
          priority: (["p0","p1","p2"].includes(String(x["priority"])) ? x["priority"] : "p2") as WorkPackagePriority,
          ownerRole: String(x["ownerRole"] ?? ""),
          description: String(x["description"] ?? ""),
          acceptanceCriteria: Array.isArray(x["acceptanceCriteria"]) ? x["acceptanceCriteria"].map(String) : [],
          proposedRefs: parseRefs(x["proposedRefs"]),
        }))
      : [];

  const risk = (typeof r["modernizationRisk"] === "object" && r["modernizationRisk"] !== null)
    ? r["modernizationRisk"] as Record<string, unknown>
    : {};

  return {
    assessmentId: String(r["assessmentId"] ?? `LMC-${Date.now()}`),
    moduleId: String(r["moduleId"] ?? ""),
    moduleName: String(r["moduleName"] ?? ""),
    language: String(r["language"] ?? ""),
    platform: String(r["platform"] ?? ""),
    businessPurpose: String(r["businessPurpose"] ?? ""),
    modernizationRisk: {
      level: (["low","medium","high","critical"].includes(String(risk["level"])) ? risk["level"] : "medium") as RiskLevel,
      rationale: String(risk["rationale"] ?? ""),
      drivers: Array.isArray(risk["drivers"]) ? risk["drivers"].map(String) : [],
      proposedRefs: parseRefs(risk["proposedRefs"]),
    },
    proposedRules: parseRules(r["proposedRules"]),
    proposedDependencies: parseDeps(r["proposedDependencies"]),
    proposedUnknowns: parseUnknowns(r["proposedUnknowns"]),
    recommendedMigrationPath: Array.isArray(r["recommendedMigrationPath"]) ? r["recommendedMigrationPath"].map(String) : [],
    proposedWorkPackages: parseWPs(r["proposedWorkPackages"]),
    toolTrace: Array.isArray(r["toolTrace"])
      ? r["toolTrace"].filter((x): x is Record<string,unknown> => typeof x === "object" && x !== null).map((x) => ({
          tool: String(x["tool"] ?? ""),
          input: String(x["input"] ?? ""),
          outputSummary: String(x["outputSummary"] ?? ""),
        }))
      : [],
  };
}