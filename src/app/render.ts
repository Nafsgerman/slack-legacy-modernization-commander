import type { IncidentBrief } from "../domain/types.ts";

export const renderIncidentBriefText = (brief: IncidentBrief): string => {
  const facts = brief.keyFacts.map((fact) => `- ${fact}`).join("\n");
  const tasks = brief.recommendedTasks
    .map((task) => `- [${task.priority.toUpperCase()}] ${task.ownerRole}: ${task.action}`)
    .join("\n");
  const timeline = brief.timeline.map((entry) => `- ${entry.occurredAt} ${entry.event}`).join("\n");

  return [
    `Incident: ${brief.incidentId}`,
    `Title: ${brief.title}`,
    `Severity: ${brief.severity.toUpperCase()} | Confidence: ${brief.confidence.toUpperCase()} | Status: ${brief.status}`,
    "",
    brief.summary,
    "",
    "Key facts:",
    facts,
    "",
    "Recommended actions:",
    tasks,
    "",
    "Timeline:",
    timeline,
    "",
    "Stakeholder update:",
    brief.stakeholderUpdate
  ].join("\n");
};

export const renderIncidentBriefBlocks = (brief: IncidentBrief): Record<string, unknown>[] => [
  {
    type: "header",
    text: {
      type: "plain_text",
      text: `${brief.severity.toUpperCase()}: ${brief.title}`
    }
  },
  {
    type: "section",
    fields: [
      { type: "mrkdwn", text: `*Incident*\n${brief.incidentId}` },
      { type: "mrkdwn", text: `*Confidence*\n${brief.confidence}` },
      { type: "mrkdwn", text: `*Status*\n${brief.status}` },
      { type: "mrkdwn", text: `*Tool calls*\n${brief.toolTrace.length}` }
    ]
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*Summary*\n${brief.summary}`
    }
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*Recommended actions*\n${brief.recommendedTasks
        .slice(0, 3)
        .map((task) => `• *${task.priority.toUpperCase()}* ${task.ownerRole}: ${task.action}`)
        .join("\n")}`
    }
  }
];
