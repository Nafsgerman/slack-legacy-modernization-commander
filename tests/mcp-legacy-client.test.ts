import assert from "node:assert/strict";
import test from "node:test";
import {
  mcpLegacyAnalysisClient,
  parseToolPayload
} from "../src/domain/mcp-legacy-analysis-client.ts";

test("MCP client assembles assessment from real MCP tool calls", async () => {
  const assessment = await mcpLegacyAnalysisClient.assessModule("claims-batch");

  assert.equal(assessment.moduleName, "CLAIMS-BATCH");
  assert.equal(assessment.language, "COBOL");
  assert.equal(assessment.toolTrace.length, 3);
  assert.deepEqual(
    assessment.toolTrace.map((entry) => entry.tool),
    [
      "legacy.assess_module",
      "legacy.extract_rules",
      "legacy.create_plan"
    ]
  );
  assert.ok(assessment.toolTrace.every((entry) => entry.outputSummary.length > 0));
});

test("MCP client exposes evidence produced by each trace entry", async () => {
  const assessment = await mcpLegacyAnalysisClient.assessModule("claims-batch");

  assert.ok(assessment.toolTrace.every((entry) => (entry.evidenceProduced?.length ?? 0) > 0));
  assert.ok(assessment.evidenceCatalog.evidence.some((evidence) => evidence.id === "EV-005"));
  assert.equal(assessment.validationStatus, "sme_required");
});

test("MCP payload parsing fails safely on malformed JSON", () => {
  const malformedResult = {
    content: [{ type: "text", text: "{not-json" }]
  } as never;

  assert.throws(
    () => parseToolPayload(malformedResult),
    /MCP tool result text payload was not valid JSON/
  );
});

test("MCP payload parsing fails safely when text content is missing", () => {
  const malformedResult = {
    content: [{ type: "image", data: "not-supported" }]
  } as never;

  assert.throws(
    () => parseToolPayload(malformedResult),
    /MCP tool result did not contain a text payload/
  );
});
