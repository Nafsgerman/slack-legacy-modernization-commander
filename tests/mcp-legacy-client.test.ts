import assert from "node:assert/strict";
import test from "node:test";
import { mcpLegacyAnalysisClient } from "../src/domain/mcp-legacy-analysis-client.ts";

test("MCP client assembles assessment from real MCP tool calls", async () => {
  const assessment = await mcpLegacyAnalysisClient.assessModule("claims-batch");

  assert.equal(assessment.moduleName, "CLAIMS-BATCH");
  assert.equal(assessment.language, "COBOL");
  assert.equal(assessment.toolTrace.length, 3);
  assert.deepEqual(
    assessment.toolTrace.map((entry) => entry.tool),
    [
      "mcp.legacy.assess_module",
      "mcp.legacy.extract_rules",
      "mcp.legacy.create_plan"
    ]
  );
  assert.ok(assessment.toolTrace.every((entry) => entry.outputSummary.length > 0));
});
