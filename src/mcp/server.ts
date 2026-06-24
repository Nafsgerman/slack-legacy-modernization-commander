import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { assessModule, createPlan, extractRules } from "./tools.ts";

const server = new McpServer({
  name: "legacy-modernization-commander-mcp",
  version: "0.1.0"
});

const moduleSchema = {
  moduleId: z
    .string()
    .min(1)
    .describe("Legacy module identifier, for example claims-batch")
};

const asToolResponse = (value: unknown) => ({
  content: [
    {
      type: "text" as const,
      text: JSON.stringify(value, null, 2)
    }
  ]
});

server.registerTool(
  "legacy.assess_module",
  {
    title: "Assess legacy module",
    description:
      "Resolve a legacy module and return business purpose, modernization risk, dependencies, and SME questions.",
    inputSchema: moduleSchema
  },
  async ({ moduleId }) => asToolResponse(assessModule(moduleId))
);

server.registerTool(
  "legacy.extract_rules",
  {
    title: "Extract business rules",
    description:
      "Extract candidate business rules from a legacy module assessment source.",
    inputSchema: moduleSchema
  },
  async ({ moduleId }) => asToolResponse(extractRules(moduleId))
);

server.registerTool(
  "legacy.create_plan",
  {
    title: "Create modernization plan",
    description:
      "Create migration path steps and Jira-ready work packages for a legacy module.",
    inputSchema: moduleSchema
  },
  async ({ moduleId }) => asToolResponse(createPlan(moduleId))
);

const transport = new StdioServerTransport();
await server.connect(transport);
