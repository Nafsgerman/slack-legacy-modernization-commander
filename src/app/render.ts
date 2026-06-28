import type { KnownBlock } from "@slack/types";
import type { ModernizationAssessment } from "../domain/types.ts";

export const legacyAssessmentActionIds = {
  markSmeReviewed: "legacy_mark_sme_reviewed",
  needsSmeFollowUp: "legacy_needs_sme_follow_up",
  prepareTicketDraft: "legacy_prepare_ticket_draft",
  showMcpTrace: "legacy_show_mcp_trace"
} as const;

const bulletList = (items: string[]): string =>
  items.length > 0 ? items.map((item) => `• ${item}`).join("\n") : "• None captured";

const firstSentence = (text: string): string => {
  const [sentence] = text.split(". ");
  return sentence.endsWith(".") ? sentence : `${sentence}.`;
};

const formatEvidenceRefs = (assessment: ModernizationAssessment, refs: string[]): string => {
  const evidenceById = new Map(
    assessment.evidenceCatalog.evidence.map((evidence) => [evidence.id, evidence])
  );

  return refs
    .map((ref) => {
      const evidence = evidenceById.get(ref);
      return evidence ? `${ref} ${evidence.sourceName}` : ref;
    })
    .join(", ");
};

const formatTraceEvidence = (assessment: ModernizationAssessment, refs?: string[]): string =>
  refs && refs.length > 0 ? ` [evidence: ${formatEvidenceRefs(assessment, refs)}]` : "";

export const renderModernizationAssessmentText = (assessment: ModernizationAssessment): string => {
  const rules = assessment.extractedBusinessRules
    .map(
      (rule) =>
        `- ${rule.id}: ${rule.title} (${rule.confidence}, ${rule.validationStatus}) ` +
        `[evidence: ${formatEvidenceRefs(assessment, rule.evidenceRefs)}]\n  ${rule.description}`
    )
    .join("\n");

  const dependencies = assessment.dependencies
    .map(
      (dependency) =>
        `- ${dependency.name} [${dependency.type}] [evidence: ${formatEvidenceRefs(
          assessment,
          dependency.evidenceRefs
        )}]: ${dependency.modernizationConcern}`
    )
    .join("\n");

  const unknowns = assessment.unknowns
    .map((unknown) => `- ${unknown.id}: ${unknown.question} Owner: ${unknown.ownerRole}`)
    .join("\n");

  const path = assessment.recommendedMigrationPath
    .map((step, index) => `${index + 1}. ${step}`)
    .join("\n");

  const workPackages = assessment.jiraReadyWorkPackages
    .map(
      (ticket) =>
        `- ${ticket.key} [${ticket.priority.toUpperCase()}] ${ticket.title} - ${ticket.ownerRole} ` +
        `(${ticket.validationStatus}) [evidence: ${formatEvidenceRefs(
          assessment,
          ticket.evidenceRefs
        )}]: ` +
        ticket.description
    )
    .join("\n");

  const evidence = assessment.evidenceCatalog.evidence
    .map((item) => `- ${item.id} [${item.sourceType}] ${item.sourceName}`)
    .join("\n");

  const checklist = assessment.smeValidationChecklist
    .map(
      (item) =>
        `- ${item.id}: ${item.title} - ${item.ownerRole} (${item.status}) ` +
        `[evidence: ${formatEvidenceRefs(assessment, item.evidenceRefs)}]\n  ${item.checklist.join(
          "; "
        )}`
    )
    .join("\n");

  const toolTrace = assessment.toolTrace
    .map(
      (trace) =>
        `- ${trace.tool}: ${trace.outputSummary}${formatTraceEvidence(
          assessment,
          trace.evidenceProduced
        )}`
    )
    .join("\n");

  return [
    "Legacy Modernization Commander",
    "",
    `System/module: ${assessment.moduleName}`,
    `Language: ${assessment.language}`,
    `Platform: ${assessment.platform}`,
    `Assessment: ${assessment.assessmentId}`,
    `Generated UTC: ${assessment.generatedAtUtc}`,
    `Overall confidence: ${assessment.confidence}`,
    `Validation status: ${assessment.validationStatus}`,
    "",
    "Business purpose:",
    assessment.businessPurpose,
    "",
    `Modernization risk: ${assessment.modernizationRisk.level.toUpperCase()} (${assessment.modernizationRisk.confidence}, ${assessment.modernizationRisk.validationStatus})`,
    `Evidence: ${formatEvidenceRefs(assessment, assessment.modernizationRisk.evidenceRefs)}`,
    assessment.modernizationRisk.rationale,
    "",
    "Risk drivers:",
    bulletList(assessment.modernizationRisk.drivers),
    "",
    "Extracted business rules:",
    rules,
    "",
    "Dependencies:",
    dependencies,
    "",
    "Unknowns / SME questions:",
    unknowns,
    "",
    "Recommended migration path:",
    path,
    "",
    "Jira-ready work packages:",
    workPackages,
    "",
    "SME validation checklist:",
    checklist,
    "",
    "Evidence catalog:",
    evidence,
    "",
    "Tool-call/audit summary:",
    toolTrace
  ].join("\n");
};

const mrkdwnSection = (text: string): KnownBlock => ({
  type: "section",
  text: {
    type: "mrkdwn",
    text
  }
});

const actionButton = (
  text: string,
  actionId: (typeof legacyAssessmentActionIds)[keyof typeof legacyAssessmentActionIds],
  value: string
) => ({
  type: "button" as const,
  text: {
    type: "plain_text" as const,
    text
  },
  action_id: actionId,
  value
});

const renderAssessmentActions = (assessment: ModernizationAssessment): KnownBlock => ({
  type: "actions",
  elements: [
    actionButton("Mark reviewed", legacyAssessmentActionIds.markSmeReviewed, assessment.moduleId),
    actionButton("Need follow-up", legacyAssessmentActionIds.needsSmeFollowUp, assessment.moduleId),
    actionButton("Draft ticket", legacyAssessmentActionIds.prepareTicketDraft, assessment.moduleId),
    actionButton("Show trace", legacyAssessmentActionIds.showMcpTrace, assessment.moduleId)
  ]
});

export const renderSmeReviewedResponse = (assessment: ModernizationAssessment): string =>
  `Marked ${assessment.moduleName} as SME reviewed for this demo session only. ` +
  "No persistent enterprise state was changed.";

export const renderSmeFollowUpResponse = (assessment: ModernizationAssessment): string =>
  `SME follow-up required for ${assessment.moduleName}. ` +
  `Validation remains ${assessment.validationStatus}; review is required before implementation planning.`;

export const renderTicketDraftResponse = (assessment: ModernizationAssessment): string => {
  const [workPackage] = assessment.jiraReadyWorkPackages;

  if (!workPackage) {
    return `Ticket draft stub for ${assessment.moduleName}: no work package was available. No Jira ticket was created.`;
  }

  return [
    `Ticket draft only for ${assessment.moduleName}. No Jira ticket was created.`,
    `${workPackage.key}: ${workPackage.title}`,
    `Owner role: ${workPackage.ownerRole}`,
    `Validation status: ${workPackage.validationStatus}`,
    `Evidence: ${formatEvidenceRefs(assessment, workPackage.evidenceRefs)}`
  ].join("\n");
};

export const renderMcpTraceResponse = (assessment: ModernizationAssessment): string =>
  [
    `MCP trace for ${assessment.moduleName}:`,
    ...assessment.toolTrace.map(
      (trace) =>
        `- ${trace.tool}: ${trace.outputSummary}${formatTraceEvidence(
          assessment,
          trace.evidenceProduced
        )}`
    ),
    "Trace source: deterministic local fixture through the MCP client/server path."
  ].join("\n");

export const renderModernizationAssessmentBlocks = (
  assessment: ModernizationAssessment
): KnownBlock[] => {
  const topRules = assessment.extractedBusinessRules.slice(0, 3);
  const topDependencies = assessment.dependencies.slice(0, 3);
  const topChecklist = assessment.smeValidationChecklist.slice(0, 3);
  const nextMoves = assessment.recommendedMigrationPath.slice(0, 3);
  const topEvidence = assessment.evidenceCatalog.evidence.slice(0, 5);

  return [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "Legacy Modernization Commander"
      }
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text:
            `Assessment ${assessment.assessmentId} · Generated UTC ${assessment.generatedAtUtc} · ` +
            `Deterministic demo fixture`
        }
      ]
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Module*\n${assessment.moduleName}` },
        { type: "mrkdwn", text: `*Language*\n${assessment.language}` },
        { type: "mrkdwn", text: `*Platform*\n${assessment.platform}` },
        { type: "mrkdwn", text: `*Risk*\n${assessment.modernizationRisk.level.toUpperCase()}` },
        { type: "mrkdwn", text: `*Confidence*\n${assessment.confidence}` },
        { type: "mrkdwn", text: `*Validation*\n${assessment.validationStatus}` }
      ]
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          `*Assessment*\n${firstSentence(assessment.businessPurpose)}\n\n` +
          `*Risk decision*\n${assessment.modernizationRisk.rationale}\n` +
          `Evidence: ${formatEvidenceRefs(assessment, assessment.modernizationRisk.evidenceRefs)}`
      }
    },
    renderAssessmentActions(assessment),
    {
      type: "divider"
    },
    mrkdwnSection(
      `*Evidence-backed business rules*\n${topRules
        .map(
          (rule) =>
            `• *${rule.id}* ${rule.title} _${rule.confidence}; ${rule.validationStatus}_ ` +
            `[${formatEvidenceRefs(assessment, rule.evidenceRefs)}]`
        )
        .join("\n")}`
    ),
    mrkdwnSection(
      `*Critical dependencies*\n${topDependencies
        .map(
          (dependency) =>
            `• *${dependency.name}* _${dependency.type}_ [${formatEvidenceRefs(
              assessment,
              dependency.evidenceRefs
            )}]`
        )
        .join("\n")}`
    ),
    mrkdwnSection(
      `*Recommended path*\n${nextMoves
        .map((step, index) => `${index + 1}. ${step}`)
        .join("\n")}`
    ),
    mrkdwnSection(
      `*Work packages with traceability*\n${assessment.jiraReadyWorkPackages
        .map(
          (ticket) =>
            `• *${ticket.key}* ${ticket.title} _${ticket.priority.toUpperCase()} · ${
              ticket.ownerRole
            }_ [${formatEvidenceRefs(assessment, ticket.evidenceRefs)}]`
        )
        .join("\n")}`
    ),
    mrkdwnSection(
      `*SME validation checklist*\n${topChecklist
        .map(
          (item) =>
            `• *${item.id}* ${item.title} - ${item.ownerRole} _${item.status}_ ` +
            `[${formatEvidenceRefs(assessment, item.evidenceRefs)}]`
        )
        .join("\n")}`
    ),
    mrkdwnSection(
      `*Evidence catalog preview*\n${topEvidence
        .map((item) => `• *${item.id}* ${item.sourceName} _${item.sourceType}_`)
        .join("\n")}`
    ),
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text:
            `${assessment.toolTrace.length} MCP tool calls · deterministic fixture data · ` +
            "use Show trace for tool details · SME validation required before implementation"
        }
      ]
    }
  ];
};
