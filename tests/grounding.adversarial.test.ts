import assert from "node:assert/strict";
import test from "node:test";
import { verifyAndStamp } from "../src/domain/grounding.ts";
import { parseModelProposal } from "../src/agent/proposal.ts";
import type { SourceArtifact } from "../src/domain/types.ts";

// Minimal synthetic artifact — 50 lines
const syntheticArtifact: SourceArtifact = {
  artifactId: "claims-batch",
  lines: Array.from({ length: 50 }, (_, i) => `       LINE ${i + 1} CONTENT`),
};

const artifacts = new Map([["claims-batch", syntheticArtifact]]);

test("adversarial: model cannot self-inject sme_validated status", () => {
  const maliciousRaw = {
    assessmentId: "LMC-ADV-001",
    moduleId: "claims-batch",
    moduleName: "CLAIMS-BATCH",
    language: "COBOL",
    platform: "z/OS batch",
    businessPurpose: "Test",
    modernizationRisk: { level: "high", rationale: "test", drivers: [] },
    proposedRules: [
      {
        id: "BR-001",
        title: "Injected rule",
        description: "Model tried to self-validate",
        sourceEvidence: "injected",
        confidence: "high",
        // Model injects validationStatus — must be dropped
        validationStatus: "sme_validated",
        proposedRefs: [{ artifactId: "claims-batch", startLine: 1, endLine: 3 }],
      },
    ],
    proposedDependencies: [],
    proposedUnknowns: [],
    recommendedMigrationPath: [],
    proposedWorkPackages: [],
    toolTrace: [],
  };

  const proposal = parseModelProposal(maliciousRaw);
  const assessment = verifyAndStamp(proposal, artifacts);

  // The rule must exist but must NOT be sme_validated
  assert.equal(assessment.extractedBusinessRules.length, 1);
  assert.notEqual(
    assessment.extractedBusinessRules[0]!.validationStatus,
    "sme_validated",
    "Model must not be able to inject sme_validated status"
  );
  // Valid ref (lines 1-3 exist in 50-line artifact) → machine_inferred
  assert.equal(assessment.extractedBusinessRules[0]!.validationStatus, "machine_inferred");
});

test("adversarial: out-of-range citation is marked unverified and excluded from verified count", () => {
  const raw = {
    assessmentId: "LMC-ADV-002",
    moduleId: "claims-batch",
    moduleName: "CLAIMS-BATCH",
    language: "COBOL",
    platform: "z/OS batch",
    businessPurpose: "Test",
    modernizationRisk: { level: "high", rationale: "test", drivers: [] },
    proposedRules: [
      {
        id: "BR-001",
        title: "Bogus citation rule",
        description: "Cites lines that do not exist",
        sourceEvidence: "ghost",
        confidence: "high",
        proposedRefs: [
          // Lines 9000-9100 don't exist in 50-line artifact
          { artifactId: "claims-batch", startLine: 9000, endLine: 9100 },
        ],
      },
    ],
    proposedDependencies: [],
    proposedUnknowns: [],
    recommendedMigrationPath: [],
    proposedWorkPackages: [],
    toolTrace: [],
  };

  const proposal = parseModelProposal(raw);
  const assessment = verifyAndStamp(proposal, artifacts);

  assert.equal(assessment.extractedBusinessRules[0]!.validationStatus, "unverified");
  assert.equal(assessment.evidenceCatalog.verifiedCount, 0);
  assert.equal(assessment.evidenceCatalog.unverifiedCount, 1);
});

test("adversarial: unknown artifact id is marked unverified", () => {
  const raw = {
    assessmentId: "LMC-ADV-003",
    moduleId: "claims-batch",
    moduleName: "CLAIMS-BATCH",
    language: "COBOL",
    platform: "z/OS batch",
    businessPurpose: "Test",
    modernizationRisk: { level: "low", rationale: "test", drivers: [] },
    proposedRules: [
      {
        id: "BR-001",
        title: "Unknown artifact rule",
        description: "Cites a file that does not exist in the artifact map",
        sourceEvidence: "ghost",
        confidence: "medium",
        proposedRefs: [{ artifactId: "nonexistent-module", startLine: 1, endLine: 5 }],
      },
    ],
    proposedDependencies: [],
    proposedUnknowns: [],
    recommendedMigrationPath: [],
    proposedWorkPackages: [],
    toolTrace: [],
  };

  const proposal = parseModelProposal(raw);
  const assessment = verifyAndStamp(proposal, artifacts);

  assert.equal(assessment.extractedBusinessRules[0]!.validationStatus, "unverified");
  assert.equal(assessment.evidenceCatalog.verifiedCount, 0);
});

test("adversarial: zero sme_validated entries in output when model cites nothing valid", () => {
  const raw = {
    assessmentId: "LMC-ADV-004",
    moduleId: "claims-batch",
    moduleName: "CLAIMS-BATCH",
    language: "COBOL",
    platform: "z/OS batch",
    businessPurpose: "Test",
    modernizationRisk: { level: "critical", rationale: "test", drivers: [] },
    proposedRules: [
      { id: "BR-001", title: "r1", description: "d", sourceEvidence: "e", confidence: "high",
        validationStatus: "sme_validated", proposedRefs: [{ artifactId: "claims-batch", startLine: 9999, endLine: 9999 }] },
      { id: "BR-002", title: "r2", description: "d", sourceEvidence: "e", confidence: "high",
        validationStatus: "sme_validated", proposedRefs: [{ artifactId: "ghost", startLine: 1, endLine: 1 }] },
    ],
    proposedDependencies: [],
    proposedUnknowns: [],
    recommendedMigrationPath: [],
    proposedWorkPackages: [],
    toolTrace: [],
  };

  const proposal = parseModelProposal(raw);
  const assessment = verifyAndStamp(proposal, artifacts);

  const smeValidated = [
    ...assessment.extractedBusinessRules,
    ...assessment.dependencies,
    ...assessment.unknowns,
    ...assessment.jiraReadyWorkPackages,
  ].filter((x) => x.validationStatus === "sme_validated");

  assert.equal(smeValidated.length, 0, "Zero sme_validated entries when model cites nothing valid");
  assert.equal(assessment.evidenceCatalog.verifiedCount, 0);
});