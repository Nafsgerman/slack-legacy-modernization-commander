import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import type {
  BusinessRuleReport,
  LegacyAnalysisClient,
  ModernizationAssessment,
  ModernizationPlan,
  SourceArtifact,
} from "../domain/types.ts";
import { parseModelProposal } from "./proposal.ts";
import { verifyAndStamp } from "../domain/grounding.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadSourceArtifact(artifactId: string): SourceArtifact {
  const filePath = join(__dirname, "../../src/demo/source", `${artifactId}.cbl`);
  const content = readFileSync(filePath, "utf-8");
  return {
    artifactId,
    lines: content.split("\n"),
  };
}

const SYSTEM_PROMPT = `You are a legacy modernization analysis engine.
You will be given the full source of a COBOL module. Your job is to produce a modernization assessment in JSON.

CRITICAL RULES:
1. Return ONLY valid JSON — no markdown fences, no preamble.
2. For every business rule, dependency, and work package, include proposedRefs pointing to actual line numbers in the source.
3. You MUST NOT include any "validationStatus" field anywhere in your response. Validation is the application's responsibility.
4. Line numbers must be real lines in the source provided.
5. proposedRefs format: { "artifactId": "<moduleId>", "startLine": <number>, "endLine": <number> }

Respond with this exact shape (no extra fields):
{
  "assessmentId": "LMC-<moduleId>-<timestamp>",
  "moduleId": "<moduleId>",
  "moduleName": "<UPPER>",
  "language": "COBOL",
  "platform": "z/OS batch",
  "businessPurpose": "<string>",
  "modernizationRisk": { "level": "high|medium|low|critical", "rationale": "<string>", "drivers": ["<string>"] },
  "proposedRules": [{ "id": "BR-001", "title": "", "description": "", "sourceEvidence": "", "confidence": "high|medium|low", "proposedRefs": [...] }],
  "proposedDependencies": [{ "name": "", "type": "database|file|scheduler|api|team|platform", "modernizationConcern": "", "proposedRefs": [...] }],
  "proposedUnknowns": [{ "id": "Q-001", "question": "", "ownerRole": "", "reason": "", "proposedRefs": [] }],
  "recommendedMigrationPath": ["<step>"],
  "proposedWorkPackages": [{ "key": "LMC-101", "title": "", "priority": "p0|p1|p2", "ownerRole": "", "description": "", "acceptanceCriteria": [], "proposedRefs": [...] }],
  "toolTrace": [{ "tool": "claude.analysis", "input": "<moduleId>", "outputSummary": "<string>" }]
}`;

export class ClaudeLegacyAnalysisClient implements LegacyAnalysisClient {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic(); // reads ANTHROPIC_API_KEY from env
  }

  async assessModule(moduleId: string): Promise<ModernizationAssessment> {
    const artifact = loadSourceArtifact(moduleId);
    const artifacts = new Map([[moduleId, artifact]]);

    const sourceWithLines = artifact.lines
      .map((line, i) => `${String(i + 1).padStart(4, " ")} ${line}`)
      .join("\n");

    const message = await this.client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Assess this module. Module ID: ${moduleId}\n\nSOURCE:\n${sourceWithLines}`,
        },
      ],
    });

    const rawText = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    let rawJson: unknown;
    try {
      rawJson = JSON.parse(rawText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim());
    } catch {
      throw new Error(`Claude returned non-JSON response: ${rawText.slice(0, 200)}`);
    }

    const proposal = parseModelProposal(rawJson);
    return verifyAndStamp(proposal, artifacts);
  }

  async extractRules(moduleId: string): Promise<BusinessRuleReport> {
    const assessment = await this.assessModule(moduleId);
    return { moduleId: assessment.moduleId, rules: assessment.extractedBusinessRules };
  }

  async createModernizationPlan(moduleId: string): Promise<ModernizationPlan> {
    const assessment = await this.assessModule(moduleId);
    return {
      moduleId: assessment.moduleId,
      migrationPath: assessment.recommendedMigrationPath,
      workPackages: assessment.ticketDraftWorkPackages,
    };
  }
}