import type { KnownBlock } from "@slack/types";
import type { ModernizationAssessment, ValidationStatus } from "../domain/types.ts";

export type DemoWorkflowRenderState = {
  demoWorkflowStatus?: "initial" | "sme_reviewed" | "sme_followup_required";
  demoWorkflowNote?: string;
};

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

const VALIDATION_LABELS: Record<ValidationStatus, string> = {
  machine_inferred: "Machine inferred",
  sme_required: "SME review required",
  sme_validated: "SME validated",
  rejected: "Rejected"
};

const formatValidationStatus = (status: ValidationStatus): string => VALIDATION_LABELS[status];

const formatTraceEvidence = (assessment: ModernizationAssessment, refs?: string[]): string =>
  refs && refs.length > 0 ? ` [evidence: ${formatEvidenceRefs(assessment, refs)}]` : "";

const formatEvidenceIds = (refs?: string[]): string =>
  refs && refs.length > 0 ? [...new Set(refs)].sort().join(", ") : "none";

const workflowLabels = (
  defaultValidationStatus: ValidationStatus,
  state?: DemoWorkflowRenderState
): {
  validationStatus: string;
  demoWorkflow: string;
  demoWorkflowNote?: string;
} => {
  if (state?.demoWorkflowStatus === "sme_reviewed") {
    return {
      validationStatus: "SME reviewed for demo session",
      demoWorkflow: "SME review marked complete",
      demoWorkflowNote: state.demoWorkflowNote ?? "No persistent enterprise state changed"
    };
  }

  if (state?.demoWorkflowStatus === "sme_followup_required") {
    return {
      validationStatus: "SME review required",
      demoWorkflow: "SME follow-up requested",
      demoWorkflowNote: state.demoWorkflowNote ?? "Review required before implementation planning"
    };
  }

  return {
    validationStatus: formatValidationStatus(defaultValidationStatus),
    demoWorkflow: "Awaiting SME action",
    demoWorkflowNote: state?.demoWorkflowNote
  };
};

const summarizeTraceAction = (tool: string): string => {
  if (tool === "legacy.assess_module") {
    return "assessed module risk";
  }

  if (tool === "legacy.extract_rules") {
    return "extracted business rules";
  }

  if (tool === "legacy.create_plan") {
    return "prepared migration work packages";
  }

  return "ran modernization tool";
};

export const renderModernizationAssessmentText = (assessment: ModernizationAssessment): string => {
  const rules = assessment.extractedBusinessRules
    .map(
      (rule) =>
        `- ${rule.id}: ${rule.title} (${rule.confidence}, ${formatValidationStatus(
          rule.validationStatus
        )}) ` +
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

  const workPackages = assessment.ticketDraftWorkPackages
    .map(
      (ticket) =>
        `- ${ticket.key} [${ticket.priority.toUpperCase()}] ${ticket.title} - ${ticket.ownerRole} ` +
        `(${formatValidationStatus(ticket.validationStatus)}) [evidence: ${formatEvidenceRefs(
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
        `- ${item.id}: ${item.title} - ${item.ownerRole} (${formatValidationStatus(
          item.status
        )}) ` +
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
    `Validation status: ${formatValidationStatus(assessment.validationStatus)}`,
    "",
    "Business purpose:",
    assessment.businessPurpose,
    "",
    `Modernization risk: ${assessment.modernizationRisk.level.toUpperCase()} (${
      assessment.modernizationRisk.confidence
    }, ${formatValidationStatus(assessment.modernizationRisk.validationStatus)})`,
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
    "Ticket draft work packages:",
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

const SLACK_APP_ID = process.env["SLACK_APP_ID"] ?? "";
const SLACK_TEAM_ID = process.env["SLACK_TEAM_ID"] ?? "";

const appHomeDeepLink = (): string | null =>
  SLACK_APP_ID && SLACK_TEAM_ID
    ? `slack://app?team=${SLACK_TEAM_ID}&id=${SLACK_APP_ID}&tab=home`
    : null;

const linkButton = (text: string, url: string) => ({
  type: "button" as const,
  text: {
    type: "plain_text" as const,
    text
  },
  url
});

const renderAssessmentActions = (assessment: ModernizationAssessment): KnownBlock => {
  const homeLink = appHomeDeepLink();
  return {
    type: "actions",
    elements: [
      actionButton("Mark reviewed", legacyAssessmentActionIds.markSmeReviewed, assessment.moduleId),
      actionButton("SME follow-up", legacyAssessmentActionIds.needsSmeFollowUp, assessment.moduleId),
      actionButton("Draft ticket", legacyAssessmentActionIds.prepareTicketDraft, assessment.moduleId),
      actionButton("Show trace", legacyAssessmentActionIds.showMcpTrace, assessment.moduleId),
      ...(homeLink ? [linkButton("View live dashboard", homeLink)] : [])
    ]
  };
};

export const renderTicketDraftResponse = (assessment: ModernizationAssessment): string => {
  const [workPackage] = assessment.ticketDraftWorkPackages;

  if (!workPackage) {
    return `Ticket draft stub for ${assessment.moduleName}: no work package was available. No Jira ticket was created.`;
  }

  return [
    `Ticket draft only for ${assessment.moduleName}. No Jira ticket was created.`,
    `${workPackage.key}: ${workPackage.title}`,
    `Owner role: ${workPackage.ownerRole}`,
    `Validation status: ${formatValidationStatus(workPackage.validationStatus)}`,
    `Evidence: ${formatEvidenceRefs(assessment, workPackage.evidenceRefs)}`
  ].join("\n");
};

export const renderTicketDraftResponseBlocks = (assessment: ModernizationAssessment): KnownBlock[] => {
  const [workPackage] = assessment.ticketDraftWorkPackages;

  if (!workPackage) {
    return [
      mrkdwnSection(
        `*Ticket draft only*\nNo Jira ticket was created.\nNo work package was available for ${assessment.moduleName}.`
      )
    ];
  }

  return [
    mrkdwnSection(
      [
        `*Ticket draft only*`,
        "No Jira ticket was created.",
        `*${workPackage.key}* ${workPackage.title}`,
        `Owner role: ${workPackage.ownerRole}`,
        `Validation status: ${formatValidationStatus(workPackage.validationStatus)}`,
        `Evidence: ${formatEvidenceRefs(assessment, workPackage.evidenceRefs)}`
      ].join("\n")
    )
  ];
};

export const renderMcpTraceResponse = (assessment: ModernizationAssessment): string =>
  [
    `MCP trace for ${assessment.moduleName}:`,
    ...assessment.toolTrace.map(
      (trace) =>
        `- ${trace.tool}: ${summarizeTraceAction(trace.tool)}. Evidence: ${formatEvidenceIds(
          trace.evidenceProduced
        )}`
    ),
    "Trace source: deterministic local fixture through the MCP client/server path.",
    "No live mainframe, Jira, or external LLM was called."
  ].join("\n");

export const renderMcpTraceResponseBlocks = (assessment: ModernizationAssessment): KnownBlock[] => [
  mrkdwnSection(
    [
      `*MCP trace for ${assessment.moduleName}*`,
      ...assessment.toolTrace.map(
        (trace) =>
          `• *${trace.tool}*: ${summarizeTraceAction(trace.tool)}. Evidence: ${formatEvidenceIds(
            trace.evidenceProduced
          )}`
      ),
      "Trace source: deterministic local fixture through the MCP client/server path.",
      "No live mainframe, Jira, or external LLM was called."
    ].join("\n")
  )
];

export const renderModernizationAssessmentBlocks = (
  assessment: ModernizationAssessment,
  state?: DemoWorkflowRenderState
): KnownBlock[] => {
  const topRules = assessment.extractedBusinessRules.slice(0, 3);
  const topDependencies = assessment.dependencies.slice(0, 3);
  const topChecklist = assessment.smeValidationChecklist.slice(0, 3);
  const nextMoves = assessment.recommendedMigrationPath.slice(0, 3);
  const topEvidence = assessment.evidenceCatalog.evidence.slice(0, 5);
  const workflow = workflowLabels(assessment.validationStatus, state);

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
        {
          type: "mrkdwn",
          text: `*Validation status*\n${workflow.validationStatus}`
        },
        {
          type: "mrkdwn",
          text: `*Demo workflow*\n${workflow.demoWorkflow}`
        }
      ]
    },
    ...(workflow.demoWorkflowNote
      ? [
          mrkdwnSection(
            [
              "*Workflow state*",
              `Validation status: ${workflow.validationStatus}`,
              `Demo workflow: ${workflow.demoWorkflow}`,
              workflow.demoWorkflowNote
            ].join("\n")
          )
        ]
      : []),
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
            `• *${rule.id}* ${rule.title} _${rule.confidence}; ${formatValidationStatus(
              rule.validationStatus
            )}_ ` +
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
      `*Work packages with traceability*\n${assessment.ticketDraftWorkPackages
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
            `• *${item.id}* ${item.title} - ${item.ownerRole} _${formatValidationStatus(
              item.status
            )}_ ` +
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