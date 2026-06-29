import type {
  EvidenceCatalog,
  EvidenceRef,
  ModernizationAssessment,
  SourceArtifact,
  ValidationStatus,
} from "./types.ts";
import type { ModelProposal, ProposedEvidenceRef } from "../agent/proposal.ts";

// ---------------------------------------------------------------------------
// Citation verifier — application code sets excerpt, never the model
// ---------------------------------------------------------------------------

function verifyRef(
  proposed: ProposedEvidenceRef,
  artifacts: Map<string, SourceArtifact>
): { ref: EvidenceRef; verified: boolean } {
  const artifact = artifacts.get(proposed.artifactId);
  if (!artifact) {
    return {
      ref: { artifactId: proposed.artifactId, startLine: proposed.startLine, endLine: proposed.endLine },
      verified: false,
    };
  }

  const maxLine = artifact.lines.length;
  if (
    proposed.startLine < 1 ||
    proposed.endLine < proposed.startLine ||
    proposed.endLine > maxLine
  ) {
    return {
      ref: { artifactId: proposed.artifactId, startLine: proposed.startLine, endLine: proposed.endLine },
      verified: false,
    };
  }

  // Application captures the real excerpt — model's claimed excerpt is discarded
  const excerpt = artifact.lines
    .slice(proposed.startLine - 1, proposed.endLine)
    .join("\n");

  return {
    ref: {
      artifactId: proposed.artifactId,
      startLine: proposed.startLine,
      endLine: proposed.endLine,
      excerpt,
    },
    verified: true,
  };
}

function resolveRefs(
  proposed: ProposedEvidenceRef[],
  artifacts: Map<string, SourceArtifact>
): { refs: EvidenceRef[]; verifiedCount: number; unverifiedCount: number } {
  let verifiedCount = 0;
  let unverifiedCount = 0;
  const refs: EvidenceRef[] = [];

  for (const p of proposed) {
    const { ref, verified } = verifyRef(p, artifacts);
    refs.push(ref);
    if (verified) verifiedCount++;
    else unverifiedCount++;
  }

  return { refs, verifiedCount, unverifiedCount };
}

function statusFromVerification(verified: boolean, hasRefs: boolean): ValidationStatus {
  if (!hasRefs) return "unverified";
  return verified ? "machine_inferred" : "unverified";
}

// ---------------------------------------------------------------------------
// verifyAndStamp — pure, authoritative, no network
// ---------------------------------------------------------------------------

export function verifyAndStamp(
  proposal: ModelProposal,
  artifacts: Map<string, SourceArtifact>
): ModernizationAssessment {
  let totalVerified = 0;
  let totalUnverified = 0;
  let totalLines = 0;

  const extractedBusinessRules = proposal.proposedRules.map((rule) => {
    const { refs, verifiedCount, unverifiedCount } = resolveRefs(rule.proposedRefs ?? [], artifacts);
    totalVerified += verifiedCount;
    totalUnverified += unverifiedCount;
    totalLines += refs.reduce((acc, r) => acc + (r.endLine - r.startLine + 1), 0);

    const anyVerified = verifiedCount > 0;
    return {
      id: rule.id,
      title: rule.title,
      description: rule.description,
      sourceEvidence: rule.sourceEvidence,
      confidence: rule.confidence,
      validationStatus: statusFromVerification(anyVerified, refs.length > 0),
      evidenceRefs: refs,
    };
  });

  const dependencies = proposal.proposedDependencies.map((dep) => {
    const { refs, verifiedCount, unverifiedCount } = resolveRefs(dep.proposedRefs ?? [], artifacts);
    totalVerified += verifiedCount;
    totalUnverified += unverifiedCount;
    return {
      name: dep.name,
      type: dep.type,
      modernizationConcern: dep.modernizationConcern,
      validationStatus: statusFromVerification(verifiedCount > 0, refs.length > 0),
      evidenceRefs: refs,
    };
  });

  const unknowns = proposal.proposedUnknowns.map((q) => {
    const { refs, verifiedCount, unverifiedCount } = resolveRefs(q.proposedRefs ?? [], artifacts);
    totalVerified += verifiedCount;
    totalUnverified += unverifiedCount;
    return {
      id: q.id,
      question: q.question,
      ownerRole: q.ownerRole,
      reason: q.reason,
      validationStatus: statusFromVerification(verifiedCount > 0, refs.length > 0),
      evidenceRefs: refs,
    };
  });

  const jiraReadyWorkPackages = proposal.proposedWorkPackages.map((wp) => {
    const { refs, verifiedCount, unverifiedCount } = resolveRefs(wp.proposedRefs ?? [], artifacts);
    totalVerified += verifiedCount;
    totalUnverified += unverifiedCount;
    return {
      key: wp.key,
      title: wp.title,
      priority: wp.priority,
      ownerRole: wp.ownerRole,
      description: wp.description,
      acceptanceCriteria: wp.acceptanceCriteria,
      validationStatus: statusFromVerification(verifiedCount > 0, refs.length > 0),
      evidenceRefs: refs,
    };
  });

  const evidenceCatalog: EvidenceCatalog = {
    refs: [
      ...extractedBusinessRules.flatMap((r) => r.evidenceRefs),
      ...dependencies.flatMap((d) => d.evidenceRefs),
      ...unknowns.flatMap((q) => q.evidenceRefs),
      ...jiraReadyWorkPackages.flatMap((wp) => wp.evidenceRefs),
    ],
    coverageLineCount: totalLines,
    verifiedCount: totalVerified,
    unverifiedCount: totalUnverified,
  };

  return {
    assessmentId: proposal.assessmentId,
    moduleId: proposal.moduleId,
    moduleName: proposal.moduleName,
    language: proposal.language,
    platform: proposal.platform,
    businessPurpose: proposal.businessPurpose,
    modernizationRisk: proposal.modernizationRisk,
    extractedBusinessRules,
    dependencies,
    unknowns,
    recommendedMigrationPath: proposal.recommendedMigrationPath,
    jiraReadyWorkPackages,
    toolTrace: proposal.toolTrace,
    evidenceCatalog,
  };
}