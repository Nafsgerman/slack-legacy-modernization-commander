import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type {
  BusinessRuleReport,
  LegacyAnalysisClient,
  ModernizationAssessment,
  ModernizationPlan,
  ToolTraceEntry
} from "./types.ts";
import type {
  ModernizationPlanToolResult,
  ModuleAssessmentToolResult,
  RuleExtractionToolResult
} from "../mcp/tools.ts";

type ToolTextContent = {
  type: "text";
  text: string;
};

type ToolResultWithSummary = {
  outputSummary: string;
};

const serverPath = fileURLToPath(new URL("../mcp/server.ts", import.meta.url));

const getTextPayload = (result: Awaited<ReturnType<Client["callTool"]>>): string => {
  const content = result.content;

  if (!Array.isArray(content)) {
    throw new Error("MCP tool result did not contain an array content payload.");
  }

  const textBlock = content.find(
    (item): item is ToolTextContent =>
      typeof item === "object" &&
      item !== null &&
      "type" in item &&
      item.type === "text" &&
      "text" in item &&
      typeof item.text === "string"
  );

  if (!textBlock) {
    throw new Error("MCP tool result did not contain a text payload.");
  }

  return textBlock.text;
};

const parseToolPayload = <T extends ToolResultWithSummary>(
  result: Awaited<ReturnType<Client["callTool"]>>
): T => JSON.parse(getTextPayload(result)) as T;

export class McpLegacyAnalysisClient implements LegacyAnalysisClient {
  private async withClient<T>(
    operation: (client: Client, trace: ToolTraceEntry[]) => Promise<T>
  ): Promise<T> {
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: ["--experimental-strip-types", serverPath]
    });

    const client = new Client({
      name: "legacy-modernization-commander-slack-client",
      version: "0.1.0"
    });

    await client.connect(transport);

    try {
      const trace: ToolTraceEntry[] = [];
      return await operation(client, trace);
    } finally {
      await client.close();
    }
  }

  async assessModule(moduleId: string): Promise<ModernizationAssessment> {
    return this.withClient(async (client, trace) => {
      const assessmentResult = await client.callTool({
        name: "legacy.assess_module",
        arguments: { moduleId }
      });
      const moduleAssessment = parseToolPayload<ModuleAssessmentToolResult>(assessmentResult);
      trace.push({
        tool: "mcp.legacy.assess_module",
        input: moduleId,
        outputSummary: moduleAssessment.outputSummary
      });

      const rulesResult = await client.callTool({
        name: "legacy.extract_rules",
        arguments: { moduleId }
      });
      const ruleReport = parseToolPayload<RuleExtractionToolResult>(rulesResult);
      trace.push({
        tool: "mcp.legacy.extract_rules",
        input: moduleAssessment.moduleName,
        outputSummary: ruleReport.outputSummary
      });

      const planResult = await client.callTool({
        name: "legacy.create_plan",
        arguments: { moduleId }
      });
      const plan = parseToolPayload<ModernizationPlanToolResult>(planResult);
      trace.push({
        tool: "mcp.legacy.create_plan",
        input: moduleAssessment.moduleName,
        outputSummary: plan.outputSummary
      });

      return {
        assessmentId: moduleAssessment.assessmentId,
        moduleId: moduleAssessment.moduleId,
        moduleName: moduleAssessment.moduleName,
        language: moduleAssessment.language,
        platform: moduleAssessment.platform,
        businessPurpose: moduleAssessment.businessPurpose,
        modernizationRisk: moduleAssessment.modernizationRisk,
        extractedBusinessRules: ruleReport.rules,
        dependencies: moduleAssessment.dependencies,
        unknowns: moduleAssessment.unknowns,
        recommendedMigrationPath: plan.migrationPath,
        jiraReadyWorkPackages: plan.workPackages,
        toolTrace: trace
      };
    });
  }

  async extractRules(moduleId: string): Promise<BusinessRuleReport> {
    return this.withClient(async (client) => {
      const rulesResult = await client.callTool({
        name: "legacy.extract_rules",
        arguments: { moduleId }
      });
      const ruleReport = parseToolPayload<RuleExtractionToolResult>(rulesResult);

      return {
        moduleId: ruleReport.moduleId,
        rules: ruleReport.rules
      };
    });
  }

  async createModernizationPlan(moduleId: string): Promise<ModernizationPlan> {
    return this.withClient(async (client) => {
      const planResult = await client.callTool({
        name: "legacy.create_plan",
        arguments: { moduleId }
      });
      const plan = parseToolPayload<ModernizationPlanToolResult>(planResult);

      return {
        moduleId: plan.moduleId,
        migrationPath: plan.migrationPath,
        workPackages: plan.workPackages
      };
    });
  }
}

export const mcpLegacyAnalysisClient = new McpLegacyAnalysisClient();
