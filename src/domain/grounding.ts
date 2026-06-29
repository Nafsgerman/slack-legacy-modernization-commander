import type {
  BusinessRule,
  Dependency,
  EvidenceRef,
  ModernizationAssessment,
  SmeQuestion,
  SmeValidationChecklistItem,
  SourceArtifact,
  WorkPackage
} from "./types.ts";
import type { ModelProposal, ProposedEvidenceRef } from "../agent/proposal.ts";

const statusFromEvidence = (mintedCount: number): "machine_inferred" | "sme_required" =>
  mintedCount > 0 ? "machine_inferred" : "sme_required";

// verifyAndStamp: pure, authoritative. The model proposes citations; code verifies
// each against the real source artifact, mints catalog evidence for the ones that
// resolve, and assigns validationStatus. The model can never reach sme_validated.
export function verifyAndStamp(
  proposal: ModelProposal,
  artifacts: Map<string, SourceArtifact>
): ModernizationAssessment {
  const evidence: EvidenceRef[] = [];
  let seq = 0;

  const mint = (proposed: ProposedEvidenceRef): string | null => {
    const artifact = artifacts.get(proposed.artifactId);
    if (!artifact) return null;
    const max = artifact.lines.length;
    if (proposed.startLine < 1 || proposed.endLine < proposed.startLine || proposed.endLine > max) {
      return null;
    }
    seq += 1;
    const id = `EV-${String(seq).padStart(3, "0")}`;
    evidence.push({
      id,
      sourceType: "code",
      sourceName: `${proposed.artifactId}.cbl`,
      locator: {
        file: `${proposed.artifactId}.cbl`,
        lineStart: proposed.startLine,
        lineEnd: proposed.endLine
      },
      excerpt: artifact.lines.slice(proposed.startLine - 1, proposed.endLine).join("\n")
    });
    return id;
  };

  const resolveRefs = (refs: ProposedEvidenceRef[] | undefined): string[] => {
    const ids: string[] = [];
    for (const r of refs ?? []) {
      const id = mint(r);
      if (id) ids.push(id);
    }
    return ids;
  };

  const extractedBusinessRules: BusinessRule[] = proposal.proposedRules.map((rule) => {
    const refs = resolveRefs(rule.proposedRefs);
    return {
      id: rule.id,
      title: rule.title,
      description: rule.description,
      evidenceRefs: refs,
      confidence: rule.confidence,
      validationStatus: statusFromEvidence(refs.length)
    };
  });

  const dependencies: Dependency[] = proposal.proposedDependencies.map((dep) => ({
    name: dep.name,
    type: dep.type,
    modernizationConcern: dep.modernizationConcern,
    evidenceRefs: resolveRefs(dep.proposedRefs)
  }));

  const unknowns: SmeQuestion[] = proposal.proposedUnknowns.map((q) => ({
    id: q.id,
    question: q.question,
    ownerRole: q.ownerRole,
    reason: q.reason
  }));

  const ticketDraftWorkPackages: WorkPackage[] = proposal.proposedWorkPackages.map((wp) => {
    const refs = resolveRefs(wp.proposedRefs);
    return {
      key: wp.key,
      title: wp.title,
      priority: wp.priority,
      ownerRole: wp.ownerRole,
      description: wp.description,
      acceptanceCriteria: wp.acceptanceCriteria,
      evidenceRefs: refs,
      validationStatus: statusFromEvidence(refs.length)
    };
  });

  const smeValidationChecklist: SmeValidationChecklistItem[] = [];

  return {
    assessmentId: proposal.assessmentId,
    generatedAtUtc: new Date().toISOString(),
    moduleId: proposal.moduleId,
    moduleName: proposal.moduleName,
    language: proposal.language,
    platform: proposal.platform,
    businessPurpose: proposal.businessPurpose,
    evidenceCatalog: { assessmentId: proposal.assessmentId, evidence },
    confidence: "medium",
    validationStatus: "sme_required",
    modernizationRisk: {
      level: proposal.modernizationRisk.level,
      rationale: proposal.modernizationRisk.rationale,
      drivers: proposal.modernizationRisk.drivers,
      confidence: "medium",
      evidenceRefs: [],
      validationStatus: "sme_required"
    },
    extractedBusinessRules,
    dependencies,
    unknowns,
    recommendedMigrationPath: proposal.recommendedMigrationPath,
    ticketDraftWorkPackages,
    smeValidationChecklist,
    toolTrace: proposal.toolTrace
  };
}
