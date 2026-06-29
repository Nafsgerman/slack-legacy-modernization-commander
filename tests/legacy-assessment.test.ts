import assert from "node:assert/strict";
import test from "node:test";
import {
  legacyAssessmentActionIds,
  renderModernizationAssessmentBlocks,
  renderModernizationAssessmentText,
  renderMcpTraceResponse,
  renderMcpTraceResponseBlocks,
  renderTicketDraftResponse,
  renderTicketDraftResponseBlocks
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
  assert.ok(assessment.ticketDraftWorkPackages.length >= 4);
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
  assessment.ticketDraftWorkPackages.forEach((workPackage) =>
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
    workPackages: assessment.ticketDraftWorkPackages,
    evidenceCatalog: assessment.evidenceCatalog
  });

  assert.deepEqual(deterministicShape(first), deterministicShape(second));
});

test("renders a Slack/plain-text modernization assessment", async () => {
  const assessment = await runLegacyAssessmentWorkflow("claims-batch");
  const text = renderModernizationAssessmentText(assessment);

  assert.match(text, /Legacy Modernization Commander/);
  assert.match(text, /System\/module: CLAIMS-BATCH/);
  assert.match(text, /Validation status: SME review required/);
  assert.match(text, /Ticket draft work packages/);
  assert.match(text, /Tool-call\/audit summary/);
  assert.doesNotMatch(text, /sme_required/);
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
  assert.match(serialized, /SME follow-up/);
  assert.match(serialized, /SME review required/);
  assert.match(serialized, /EV-001/);
  assert.doesNotMatch(serialized, /sme_required/);
  assert.match(serialized, new RegExp(legacyAssessmentActionIds.markSmeReviewed));
  assert.match(serialized, new RegExp(legacyAssessmentActionIds.needsSmeFollowUp));
  assert.match(serialized, new RegExp(legacyAssessmentActionIds.prepareTicketDraft));
  assert.match(serialized, new RegExp(legacyAssessmentActionIds.showMcpTrace));
});

test("renders ticket draft action wording without claiming Jira creation", async () => {
  const assessment = await runLegacyAssessmentWorkflow("claims-batch");
  const ticketDraft = renderTicketDraftResponse(assessment);
  const ticketDraftBlocks = renderTicketDraftResponseBlocks(assessment);
  const serializedBlocks = JSON.stringify(ticketDraftBlocks);

  assert.match(ticketDraft, /draft/i);
  assert.match(ticketDraft, /No Jira ticket was created/i);
  assert.match(serializedBlocks, /Ticket draft only/i);
  assert.match(serializedBlocks, /No Jira ticket was created/i);
  assert.match(ticketDraft, /Validation status: SME review required/i);
  assert.doesNotMatch(ticketDraft, /sme_required/);
  assert.doesNotMatch(serializedBlocks, /sme_required/);
  assert.doesNotMatch(ticketDraft, /^Created Jira ticket/im);
  assert.doesNotMatch(ticketDraft, /Jira ticket created successfully/i);
  assert.doesNotMatch(serializedBlocks, /plain_text_input/);
});

test("renders SME reviewed action as an updated card state", async () => {
  const assessment = await runLegacyAssessmentWorkflow("claims-batch");
  const blocks = renderModernizationAssessmentBlocks(assessment, {
    demoWorkflowStatus: "sme_reviewed"
  });
  const serialized = JSON.stringify(blocks);

  assert.match(serialized, /Validation status/);
  assert.match(serialized, /SME reviewed for demo session/);
  assert.match(serialized, /Demo workflow/);
  assert.match(serialized, /SME review marked complete/);
  assert.match(serialized, /No persistent enterprise state changed/);
  assert.doesNotMatch(serialized, /sme_required/);
});

test("renders SME follow-up action as an updated card state", async () => {
  const assessment = await runLegacyAssessmentWorkflow("claims-batch");
  const blocks = renderModernizationAssessmentBlocks(assessment, {
    demoWorkflowStatus: "sme_followup_required"
  });
  const serialized = JSON.stringify(blocks);

  assert.match(serialized, /Validation status/);
  assert.match(serialized, /SME review required/);
  assert.match(serialized, /Demo workflow/);
  assert.match(serialized, /SME follow-up requested/);
  assert.match(serialized, /Review required before implementation planning/);
  assert.doesNotMatch(serialized, /sme_required/);
});

test("keeps MCP trace available through the Show trace action as sorted Block Kit", async () => {
  const assessment = await runLegacyAssessmentWorkflow("claims-batch");
  assessment.toolTrace[0].evidenceProduced = ["EV-003", "EV-001", "EV-002"];
  const blocks = renderModernizationAssessmentBlocks(assessment);
  const traceResponse = renderMcpTraceResponse(assessment);
  const traceBlocks = renderMcpTraceResponseBlocks(assessment);
  const serializedBlocks = JSON.stringify(blocks);
  const serializedTraceBlocks = JSON.stringify(traceBlocks);

  assert.match(serializedBlocks, new RegExp(legacyAssessmentActionIds.showMcpTrace));
  assert.match(traceResponse, /legacy\.assess_module/);
  assert.match(traceResponse, /legacy\.extract_rules/);
  assert.match(traceResponse, /legacy\.create_plan/);
  assert.match(traceResponse, /assessed module risk\. Evidence: EV-/);
  assert.match(serializedTraceBlocks, /legacy\.assess_module/);
  assert.match(traceResponse, /extracted business rules\. Evidence: EV-/);
  assert.match(traceResponse, /prepared migration work packages\. Evidence: EV-/);
  assert.match(serializedTraceBlocks, /Evidence: EV-001, EV-002, EV-003/);
  assert.match(traceResponse, /No live mainframe, Jira, or external LLM was called\./);
  assert.match(
    serializedTraceBlocks,
    /No live mainframe, Jira, or external LLM was called\./
  );
  assert.doesNotMatch(serializedTraceBlocks, /sme_required/);
  assert.doesNotMatch(traceResponse, /Resolved CLAIMS-BATCH as a COBOL z\/OS batch module/);
});

test("rendered Slack output avoids fake production and vendor claims", async () => {
  const assessment = await runLegacyAssessmentWorkflow("claims-batch");
  const rendered = [
    renderModernizationAssessmentText(assessment),
    JSON.stringify(renderModernizationAssessmentBlocks(assessment)),
    JSON.stringify(
      renderModernizationAssessmentBlocks(assessment, {
        demoWorkflowStatus: "sme_reviewed"
      })
    ),
    JSON.stringify(
      renderModernizationAssessmentBlocks(assessment, {
        demoWorkflowStatus: "sme_followup_required"
      })
    ),
    renderTicketDraftResponse(assessment),
    JSON.stringify(renderTicketDraftResponseBlocks(assessment)),
    renderMcpTraceResponse(assessment),
    JSON.stringify(renderMcpTraceResponseBlocks(assessment))
  ].join("\n");

  const forbiddenClaims = [
    /Jira tickets? (were )?created/i,
    /created Jira tickets?/i,
    /Jira-ready/i,
    /jiraReady/i,
    /sme_required/i,
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
