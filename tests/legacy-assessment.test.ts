import assert from "node:assert/strict";
import test from "node:test";
import {
  legacyAssessmentActionIds,
  renderModernizationAssessmentBlocks,
  renderModernizationAssessmentText,
  renderMcpTraceResponse,
  renderSmeFollowUpResponse,
  renderSmeReviewedResponse,
  renderTicketDraftResponse
} from "../src/app/render.ts";
import {
  deterministicLegacyAnalysisClient,
  runLegacyAssessmentWorkflow
} from "../src/domain/orchestrator.ts";
import { assessModule } from "../src/mcp/tools.ts";

test("assesses the CLAIMS-BATCH modernization demo module", async () => {
  const assessment = await runLegacyAssessmentWorkflow("claims-batch");

  assert.equal(assessment.moduleName, "CLAIMS-BATCH");
  assert.equal(assessment.language, "COBOL");
  assert.equal(assessment.modernizationRisk.level, "high");
  assert.ok(assessment.extractedBusinessRules.length >= 4);
  assert.ok(assessment.jiraReadyWorkPackages.length >= 4);
});

test("requires traceable evidence refs for risk, business rules, and work packages", async () => {
  const assessment = await runLegacyAssessmentWorkflow("claims-batch");
  const evidenceIds = new Set(assessment.evidenceCatalog.evidence.map((evidence) => evidence.id));
  const assertValidRefs = (refs: string[]) => {
    assert.ok(refs.length > 0);
    assert.ok(refs.every((ref) => evidenceIds.has(ref)));
  };

  assertValidRefs(assessment.modernizationRisk.evidenceRefs);
  assessment.extractedBusinessRules.forEach((rule) => assertValidRefs(rule.evidenceRefs));
  assessment.jiraReadyWorkPackages.forEach((workPackage) =>
    assertValidRefs(workPackage.evidenceRefs)
  );
  assessment.smeValidationChecklist.forEach((item) => assertValidRefs(item.evidenceRefs));
});

test("enforces business-rule evidence and validation traceability", async () => {
  const assessment = await runLegacyAssessmentWorkflow("claims-batch");
  const evidenceById = new Map(
    assessment.evidenceCatalog.evidence.map((evidence) => [evidence.id, evidence])
  );

  assessment.extractedBusinessRules.forEach((rule) => {
    assert.ok(rule.evidenceRefs.length > 0, `${rule.id} must cite at least one evidence ref`);
    assert.ok(rule.confidence, `${rule.id} must carry confidence`);
    assert.ok(rule.validationStatus, `${rule.id} must carry validation status`);

    rule.evidenceRefs.forEach((ref) => {
      assert.ok(evidenceById.has(ref), `${rule.id} references missing evidence ${ref}`);
    });

    if (rule.validationStatus === "sme_validated") {
      const supportingEvidence = rule.evidenceRefs
        .map((ref) => evidenceById.get(ref))
        .filter((evidence) => evidence?.sourceType === "sme_note")
        .some((evidence) => /validated|approved/i.test(evidence?.excerpt ?? ""));

      assert.ok(
        supportingEvidence,
        `${rule.id} cannot be sme_validated without explicit SME validation evidence`
      );
    }
  });
});

test("returns stable deterministic assessment data across runs", async () => {
  const first = await runLegacyAssessmentWorkflow("claims-batch");
  const second = await runLegacyAssessmentWorkflow("claims-batch");

  const deterministicShape = (assessment: typeof first) => ({
    moduleId: assessment.moduleId,
    moduleName: assessment.moduleName,
    risk: assessment.modernizationRisk,
    rules: assessment.extractedBusinessRules,
    workPackages: assessment.jiraReadyWorkPackages,
    evidenceCatalog: assessment.evidenceCatalog
  });

  assert.deepEqual(deterministicShape(first), deterministicShape(second));
});

test("renders a Slack/plain-text modernization assessment", async () => {
  const assessment = await runLegacyAssessmentWorkflow("claims-batch");
  const text = renderModernizationAssessmentText(assessment);

  assert.match(text, /Legacy Modernization Commander/);
  assert.match(text, /System\/module: CLAIMS-BATCH/);
  assert.match(text, /Jira-ready work packages/);
  assert.match(text, /Tool-call\/audit summary/);
});

test("renders decision-oriented Slack Block Kit sections", async () => {
  const assessment = await runLegacyAssessmentWorkflow("claims-batch");
  const blocks = renderModernizationAssessmentBlocks(assessment);
  const serialized = JSON.stringify(blocks);

  assert.equal(blocks[0]?.type, "header");
  assert.ok(blocks.some((block) => block.type === "divider"));
  assert.match(serialized, /Evidence-backed business rules/);
  assert.match(serialized, /Work packages with traceability/);
  assert.match(serialized, /SME validation checklist/);
  assert.match(serialized, /Show trace/);
  assert.match(serialized, /EV-001/);
  assert.match(serialized, new RegExp(legacyAssessmentActionIds.markSmeReviewed));
  assert.match(serialized, new RegExp(legacyAssessmentActionIds.needsSmeFollowUp));
  assert.match(serialized, new RegExp(legacyAssessmentActionIds.prepareTicketDraft));
  assert.match(serialized, new RegExp(legacyAssessmentActionIds.showMcpTrace));
});

test("renders ticket draft action wording without claiming Jira creation", async () => {
  const assessment = await runLegacyAssessmentWorkflow("claims-batch");
  const ticketDraft = renderTicketDraftResponse(assessment);

  assert.match(ticketDraft, /draft/i);
  assert.match(ticketDraft, /No Jira ticket was created/i);
  assert.doesNotMatch(ticketDraft, /^Created Jira ticket/im);
  assert.doesNotMatch(ticketDraft, /Jira ticket created successfully/i);
});

test("renders SME action responses as demo-session state only", async () => {
  const assessment = await runLegacyAssessmentWorkflow("claims-batch");
  const reviewed = renderSmeReviewedResponse(assessment);
  const followUp = renderSmeFollowUpResponse(assessment);

  assert.match(reviewed, /demo session only/i);
  assert.match(reviewed, /No persistent enterprise state was changed/i);
  assert.match(followUp, /SME follow-up required/i);
  assert.match(followUp, /Validation remains sme_required/i);
});

test("keeps MCP trace available through the Show trace action", async () => {
  const assessment = await runLegacyAssessmentWorkflow("claims-batch");
  const blocks = renderModernizationAssessmentBlocks(assessment);
  const traceResponse = renderMcpTraceResponse(assessment);
  const serializedBlocks = JSON.stringify(blocks);

  assert.match(serializedBlocks, new RegExp(legacyAssessmentActionIds.showMcpTrace));
  assert.match(traceResponse, /legacy\.assess_module/);
  assert.match(traceResponse, /legacy\.extract_rules/);
  assert.match(traceResponse, /legacy\.create_plan/);
});

test("rendered Slack output avoids fake production and vendor claims", async () => {
  const assessment = await runLegacyAssessmentWorkflow("claims-batch");
  const rendered = [
    renderModernizationAssessmentText(assessment),
    JSON.stringify(renderModernizationAssessmentBlocks(assessment))
  ].join("\n");

  const forbiddenClaims = [
    /Jira tickets? (were )?created/i,
    /created Jira tickets?/i,
    /Claude analyzed/i,
    /connected to live production systems/i,
    /live production systems were connected/i,
    /live mainframe analysis/i,
    /mainframe analysis happened/i
  ];

  forbiddenClaims.forEach((claim) => assert.doesNotMatch(rendered, claim));
});

test("handles unknown demo modules with an explicit safe failure", async () => {
  await assert.rejects(
    () => deterministicLegacyAnalysisClient.assessModule("unknown-module"),
    /Unknown demo module: unknown-module/
  );

  assert.throws(
    () => assessModule("unknown-module"),
    /Unknown demo module "unknown-module". Available demo module: claims-batch/
  );
});
