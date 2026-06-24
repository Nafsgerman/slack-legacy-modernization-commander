import type { ModernizationAssessment } from "../domain/types.ts";

const bulletList = (items: string[]): string => items.map((item) => `• ${item}`).join("\n");

const firstSentence = (text: string): string => {
  const [sentence] = text.split(". ");
  return sentence.endsWith(".") ? sentence : `${sentence}.`;
};

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
): Record<string, unknown>[] => {
  const topRules = assessment.extractedBusinessRules.slice(0, 3);
  const topDependencies = assessment.dependencies.slice(0, 3);
  const topQuestions = assessment.unknowns.slice(0, 2);
  const nextMoves = assessment.recommendedMigrationPath.slice(0, 3);

  return [
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
        { type: "mrkdwn", text: `*Module*\n${assessment.moduleName}` },
        { type: "mrkdwn", text: `*Language*\n${assessment.language}` },
        { type: "mrkdwn", text: `*Platform*\n${assessment.platform}` },
        { type: "mrkdwn", text: `*Risk*\n${assessment.modernizationRisk.level.toUpperCase()}` }
      ]
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          `*Assessment*\n${firstSentence(assessment.businessPurpose)}\n\n` +
          `*Why it matters*\n${assessment.modernizationRisk.rationale}`
      }
    },
    {
      type: "divider"
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Business rules detected*\n${topRules
          .map((rule) => `• *${rule.id}* ${rule.title} _(${rule.confidence})_`)
          .join("\n")}`
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Critical dependencies*\n${topDependencies
          .map((dependency) => `• *${dependency.name}* _${dependency.type}_`)
          .join("\n")}`
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*SME questions before migration*\n${topQuestions
          .map((unknown) => `• ${unknown.question}`)
          .join("\n")}`
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Recommended path*\n${nextMoves
          .map((step, index) => `${index + 1}. ${step}`)
          .join("\n")}`
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Jira-ready work packages*\n${assessment.jiraReadyWorkPackages
          .map((ticket) => `• *${ticket.key}* ${ticket.title} — _${ticket.ownerRole}_`)
          .join("\n")}`
      }
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `${assessment.toolTrace.length} live MCP tool calls · Adapter boundary ready for Claude/backend integration`
        }
      ]
    }
  ];
};
