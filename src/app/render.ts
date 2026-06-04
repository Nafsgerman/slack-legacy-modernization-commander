import type { ModernizationAssessment } from "../domain/types.ts";

const bulletList = (items: string[]): string => items.map((item) => `• ${item}`).join("\n");

export const renderModernizationAssessmentText = (assessment: ModernizationAssessment): string => {
  const rules = assessment.extractedBusinessRules
    .map((rule) => `- ${rule.id}: ${rule.title} (${rule.confidence}) — ${rule.description}`)
    .join("\n");

  const dependencies = assessment.dependencies
    .map((dependency) => `- ${dependency.name} [${dependency.type}]: ${dependency.modernizationConcern}`)
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
        `- ${ticket.key} [${ticket.priority.toUpperCase()}] ${ticket.title} — ${ticket.ownerRole}: ${ticket.description}`
    )
    .join("\n");

  const toolTrace = assessment.toolTrace
    .map((trace) => `- ${trace.tool}: ${trace.outputSummary}`)
    .join("\n");

  return [
    "Legacy Modernization Commander",
    "",
    `System/module: ${assessment.moduleName}`,
    `Language: ${assessment.language}`,
    `Platform: ${assessment.platform}`,
    `Assessment: ${assessment.assessmentId}`,
    "",
    "Business purpose:",
    assessment.businessPurpose,
    "",
    `Modernization risk: ${assessment.modernizationRisk.level.toUpperCase()}`,
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
    "Tool-call/audit summary:",
    toolTrace
  ].join("\n");
};

export const renderModernizationAssessmentBlocks = (
  assessment: ModernizationAssessment
): Record<string, unknown>[] => [
  {
    type: "header",
    text: {
      type: "plain_text",
      text: "Legacy Modernization Commander"
    }
  },
  {
    type: "section",
    fields: [
      { type: "mrkdwn", text: `*System/module*\n${assessment.moduleName}` },
      { type: "mrkdwn", text: `*Language*\n${assessment.language}` },
      { type: "mrkdwn", text: `*Platform*\n${assessment.platform}` },
      { type: "mrkdwn", text: `*Risk*\n${assessment.modernizationRisk.level.toUpperCase()}` }
    ]
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*Business purpose*\n${assessment.businessPurpose}`
    }
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text:
        `*Modernization risk*\n*${assessment.modernizationRisk.level.toUpperCase()}* — ` +
        `${assessment.modernizationRisk.rationale}\n\n` +
        `*Risk drivers*\n${bulletList(assessment.modernizationRisk.drivers)}`
    }
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*Extracted business rules*\n${assessment.extractedBusinessRules
        .map((rule) => `• *${rule.id} ${rule.title}* _(${rule.confidence})_\n  ${rule.description}`)
        .join("\n")}`
    }
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*Dependencies*\n${assessment.dependencies
        .map((dependency) => `• *${dependency.name}* _(${dependency.type})_\n  ${dependency.modernizationConcern}`)
        .join("\n")}`
    }
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*Unknowns / SME questions*\n${assessment.unknowns
        .map((unknown) => `• *${unknown.id}* ${unknown.question}\n  Owner: ${unknown.ownerRole}`)
        .join("\n")}`
    }
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*Recommended migration path*\n${assessment.recommendedMigrationPath
        .map((step, index) => `${index + 1}. ${step}`)
        .join("\n")}`
    }
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*Jira-ready work packages*\n${assessment.jiraReadyWorkPackages
        .map((ticket) => `• *${ticket.key}* _${ticket.priority.toUpperCase()}_ — ${ticket.title}\n  Owner: ${ticket.ownerRole}`)
        .join("\n")}`
    }
  },
  {
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: `Tool-call/audit summary: ${assessment.toolTrace.length} deterministic fixture calls. Adapter boundary ready for Claude or backend integration.`
      }
    ]
  }
];
