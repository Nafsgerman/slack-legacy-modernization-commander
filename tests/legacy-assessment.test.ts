import assert from "node:assert/strict";
import test from "node:test";
import { renderModernizationAssessmentText } from "../src/app/render.ts";
import { runLegacyAssessmentWorkflow } from "../src/domain/orchestrator.ts";

test("assesses the CLAIMS-BATCH modernization demo module", async () => {
  const assessment = await runLegacyAssessmentWorkflow("claims-batch");

  assert.equal(assessment.moduleName, "CLAIMS-BATCH");
  assert.equal(assessment.language, "COBOL");
  assert.equal(assessment.modernizationRisk.level, "high");
  assert.ok(assessment.extractedBusinessRules.length >= 4);
  assert.ok(assessment.jiraReadyWorkPackages.length >= 4);
});

test("renders a Slack/plain-text modernization assessment", async () => {
  const assessment = await runLegacyAssessmentWorkflow("claims-batch");
  const text = renderModernizationAssessmentText(assessment);

  assert.match(text, /Legacy Modernization Commander/);
  assert.match(text, /System\/module: CLAIMS-BATCH/);
  assert.match(text, /Jira-ready work packages/);
  assert.match(text, /Tool-call\/audit summary/);
});
