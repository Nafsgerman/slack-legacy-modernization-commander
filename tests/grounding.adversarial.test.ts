import assert from "node:assert/strict";
import test from "node:test";
import { verifyAndStamp } from "../src/domain/grounding.ts";
import { parseModelProposal } from "../src/agent/proposal.ts";
import type { SourceArtifact } from "../src/domain/types.ts";

const syntheticArtifact: SourceArtifact = {
  artifactId: "claims-batch",
  lines: Array.from({ length: 50 }, (_, i) => `       LINE ${i + 1} CONTENT`)
};
const artifacts = new Map([["claims-batch", syntheticArtifact]]);

const baseProposal = (proposedRules: unknown[]) => ({
  assessmentId: "LMC-ADV",
  moduleId: "claims-batch",
  moduleName: "CLAIMS-BATCH",
  language: "COBOL",
  platform: "z/OS batch",
  businessPurpose: "Test",
  modernizationRisk: { level: "high", rationale: "t", drivers: [] },
  proposedRules,
  proposedDependencies: [],
  proposedUnknowns: [],
  recommendedMigrationPath: [],
  proposedWorkPackages: [],
  toolTrace: []
});

test("adversarial: model cannot self-inject sme_validated status", () => {
  const raw = baseProposal([
    {
      id: "BR-001",
      title: "Injected",
      description: "d",
      sourceEvidence: "x",
      confidence: "high",
      validationStatus: "sme_validated",
      proposedRefs: [{ artifactId: "claims-batch", startLine: 1, endLine: 3 }]
    }
  ]);
  const assessment = verifyAndStamp(parseModelProposal(raw), artifacts);
  assert.equal(assessment.extractedBusinessRules.length, 1);
  assert.notEqual(assessment.extractedBusinessRules[0].validationStatus, "sme_validated");
  assert.equal(assessment.extractedBusinessRules[0].validationStatus, "machine_inferred");
});

test("adversarial: out-of-range citation mints no evidence and stays sme_required", () => {
  const raw = baseProposal([
    {
      id: "BR-001",
      title: "Bogus",
      description: "d",
      sourceEvidence: "x",
      confidence: "high",
      proposedRefs: [{ artifactId: "claims-batch", startLine: 9000, endLine: 9100 }]
    }
  ]);
  const assessment = verifyAndStamp(parseModelProposal(raw), artifacts);
  assert.equal(assessment.extractedBusinessRules[0].validationStatus, "sme_required");
  assert.equal(assessment.evidenceCatalog.evidence.length, 0);
});

test("adversarial: unknown artifact mints no evidence and stays sme_required", () => {
  const raw = baseProposal([
    {
      id: "BR-001",
      title: "Ghost artifact",
      description: "d",
      sourceEvidence: "x",
      confidence: "medium",
      proposedRefs: [{ artifactId: "nonexistent", startLine: 1, endLine: 5 }]
    }
  ]);
  const assessment = verifyAndStamp(parseModelProposal(raw), artifacts);
  assert.equal(assessment.extractedBusinessRules[0].validationStatus, "sme_required");
  assert.equal(assessment.evidenceCatalog.evidence.length, 0);
});

test("adversarial: zero sme_validated entries when nothing valid is cited", () => {
  const raw = baseProposal([
    { id: "BR-001", title: "a", description: "d", sourceEvidence: "x", confidence: "high",
      validationStatus: "sme_validated", proposedRefs: [{ artifactId: "claims-batch", startLine: 9999, endLine: 9999 }] },
    { id: "BR-002", title: "b", description: "d", sourceEvidence: "x", confidence: "high",
      validationStatus: "sme_validated", proposedRefs: [{ artifactId: "ghost", startLine: 1, endLine: 1 }] }
  ]);
  const assessment = verifyAndStamp(parseModelProposal(raw), artifacts);
  const validated = [
    ...assessment.extractedBusinessRules,
    ...assessment.ticketDraftWorkPackages
  ].filter((x) => x.validationStatus === "sme_validated");
  assert.equal(validated.length, 0);
  assert.equal(assessment.evidenceCatalog.evidence.length, 0);
});
