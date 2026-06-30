import assert from "node:assert/strict";
import test from "node:test";
import { verifyAndStamp } from "../src/domain/grounding.ts";
import { parseModelProposal } from "../src/agent/proposal.ts";
import type { SourceArtifact } from "../src/domain/types.ts";

// 10-line synthetic source: refs 1-10 are in range, 11+ are out of range.
const syntheticArtifact: SourceArtifact = {
  artifactId: "claims-batch",
  lines: Array.from({ length: 10 }, (_, i) => `       LINE ${i + 1} CONTENT`)
};
const artifacts = new Map([["claims-batch", syntheticArtifact]]);

const baseProposal = (overrides: Record<string, unknown> = {}) => ({
  assessmentId: "LMC-DERIV",
  moduleId: "claims-batch",
  moduleName: "CLAIMS-BATCH",
  language: "COBOL",
  platform: "z/OS batch",
  businessPurpose: "Test",
  modernizationRisk: {
    level: "high",
    rationale: "t",
    drivers: [],
    proposedRefs: [{ artifactId: "claims-batch", startLine: 1, endLine: 2 }]
  },
  proposedRules: [],
  proposedDependencies: [],
  proposedUnknowns: [
    {
      id: "Q-001",
      question: "Is the threshold configurable?",
      ownerRole: "Business Analyst",
      reason: "Hard-coded value may drift.",
      proposedRefs: [{ artifactId: "claims-batch", startLine: 3, endLine: 3 }]
    },
    {
      id: "Q-002",
      question: "What is the restart behavior?",
      ownerRole: "Batch Lead",
      reason: "No checkpoint visible.",
      proposedRefs: []
    }
  ],
  recommendedMigrationPath: [],
  proposedWorkPackages: [],
  toolTrace: [],
  ...overrides
});

test("derivation: modernizationRisk evidence refs resolve against real source", () => {
  const assessment = verifyAndStamp(parseModelProposal(baseProposal()), artifacts);
  assert.ok(assessment.modernizationRisk.evidenceRefs.length > 0);
  assert.equal(assessment.modernizationRisk.validationStatus, "machine_inferred");
  const catalogIds = new Set(assessment.evidenceCatalog.evidence.map((e) => e.id));
  for (const ref of assessment.modernizationRisk.evidenceRefs) {
    assert.ok(catalogIds.has(ref));
  }
});

test("derivation: out-of-range risk refs mint no evidence and stay sme_required", () => {
  const assessment = verifyAndStamp(
    parseModelProposal(
      baseProposal({
        modernizationRisk: {
          level: "high",
          rationale: "t",
          drivers: [],
          proposedRefs: [{ artifactId: "claims-batch", startLine: 50, endLine: 60 }]
        }
      })
    ),
    artifacts
  );
  assert.equal(assessment.modernizationRisk.evidenceRefs.length, 0);
  assert.equal(assessment.modernizationRisk.validationStatus, "sme_required");
});

test("derivation: SME checklist is built one-per-unknown", () => {
  const assessment = verifyAndStamp(parseModelProposal(baseProposal()), artifacts);
  assert.equal(assessment.smeValidationChecklist.length, assessment.unknowns.length);
  assert.equal(assessment.smeValidationChecklist.length, 2);
});

test("derivation: every derived checklist item is sme_required (model cannot self-validate)", () => {
  const assessment = verifyAndStamp(parseModelProposal(baseProposal()), artifacts);
  for (const item of assessment.smeValidationChecklist) {
    assert.equal(item.status, "sme_required");
  }
});

test("derivation: checklist items carry sequential SME ids and their unknown's evidence", () => {
  const assessment = verifyAndStamp(parseModelProposal(baseProposal()), artifacts);
  assert.equal(assessment.smeValidationChecklist[0].id, "SME-001");
  assert.equal(assessment.smeValidationChecklist[1].id, "SME-002");
  // Q-001 cited a valid line → carries evidence; Q-002 cited nothing → none.
  assert.ok(assessment.smeValidationChecklist[0].evidenceRefs.length > 0);
  assert.equal(assessment.smeValidationChecklist[1].evidenceRefs.length, 0);
});

test("derivation: checklist titles are non-empty and length-bounded", () => {
  const assessment = verifyAndStamp(parseModelProposal(baseProposal()), artifacts);
  for (const item of assessment.smeValidationChecklist) {
    assert.ok(item.title.length > 0);
    assert.ok(item.title.length <= 111);
    assert.ok(item.checklist.length >= 1);
  }
});