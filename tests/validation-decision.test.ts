import assert from "node:assert/strict";
import test from "node:test";
import { applyValidationDecision } from "../src/domain/validation-decision.ts";
import { runLegacyAssessmentWorkflow } from "../src/domain/orchestrator.ts";

test("mark-reviewed flips every open status to sme_validated", async () => {
  const base = await runLegacyAssessmentWorkflow("claims-batch");
  const reviewed = applyValidationDecision(base, "sme_validated");

  assert.equal(reviewed.validationStatus, "sme_validated");
  assert.equal(reviewed.modernizationRisk.validationStatus, "sme_validated");
  assert.ok(reviewed.extractedBusinessRules.every((r) => r.validationStatus === "sme_validated"));
  assert.ok(reviewed.ticketDraftWorkPackages.every((p) => p.validationStatus === "sme_validated"));
  assert.ok(reviewed.smeValidationChecklist.every((i) => i.status === "sme_validated"));
});

test("follow-up flips every open status back to sme_required", async () => {
  const base = await runLegacyAssessmentWorkflow("claims-batch");
  const flagged = applyValidationDecision(applyValidationDecision(base, "sme_validated"), "sme_required");

  assert.equal(flagged.validationStatus, "sme_required");
  assert.ok(flagged.extractedBusinessRules.every((r) => r.validationStatus === "sme_required"));
});

test("decision is pure and does not mutate the input", async () => {
  const base = await runLegacyAssessmentWorkflow("claims-batch");
  const before = base.validationStatus;
  applyValidationDecision(base, "sme_validated");
  assert.equal(base.validationStatus, before);
});