import type { WebClient } from "@slack/web-api";
import type { KnownBlock } from "@slack/types";
import type { ModernizationAssessment } from "../domain/types.ts";
import type { DemoWorkflowRenderState } from "./render.ts";
import { resolveTraceabilityGraph } from "../domain/graph/model.ts";
import { uploadTraceabilityGraph } from "./graph/upload.ts";

const DEMO_CHANNEL_ID = process.env["SLACK_DEMO_CHANNEL_ID"] ?? "";

export const validationSummary = (assessment: ModernizationAssessment): string => {
  const rules = assessment.extractedBusinessRules;
  const wps = assessment.ticketDraftWorkPackages;
  const checklist = assessment.smeValidationChecklist;
  const all = [...rules, ...wps, ...checklist.map((i) => ({ validationStatus: i.status }))];
  const total = all.length;
  const validated = all.filter((x) => x.validationStatus === "sme_validated").length;
  const pct = total > 0 ? Math.round((validated / total) * 100) : 0;
  return `${validated}/${total} items validated (${pct}%)`;
};

const evidenceCoverage = (assessment: ModernizationAssessment): string => {
  const total = assessment.evidenceCatalog.evidence.length;
  const cited = new Set([
    ...assessment.extractedBusinessRules.flatMap((r) => r.evidenceRefs),
    ...assessment.ticketDraftWorkPackages.flatMap((w) => w.evidenceRefs)
  ]).size;
  return `${cited}/${total} evidence items cited`;
};

export const buildAppHomeBlocks = (
  assessment: ModernizationAssessment,
  state?: DemoWorkflowRenderState
): KnownBlock[] => {
  const model = resolveTraceabilityGraph(assessment);
  const unresolved = model.unresolvedRefs.length;

  return [
    {
      type: "header",
      text: { type: "plain_text", text: "Legacy Modernization Commander — Home" }
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Module*\n${assessment.moduleName}` },
        { type: "mrkdwn", text: `*Risk*\n${assessment.modernizationRisk.level.toUpperCase()}` },
        { type: "mrkdwn", text: `*Validation progress*\n${validationSummary(assessment)}` },
        { type: "mrkdwn", text: `*Evidence coverage*\n${evidenceCoverage(assessment)}` },
        {
          type: "mrkdwn",
          text: `*Unresolved refs*\n${unresolved === 0 ? "None ✓" : `⚠ ${unresolved}`}`
        },
        { type: "mrkdwn", text: `*Demo session*\n${state?.demoWorkflowStatus ?? "initial"}` }
      ]
    },
    { type: "divider" },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Business rules* (${assessment.extractedBusinessRules.length})\n${assessment.extractedBusinessRules
          .map((r) => `• *${r.id}* ${r.title} — _${r.validationStatus.replace(/_/g, " ")}_`)
          .join("\n")}`
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Work packages* (${assessment.ticketDraftWorkPackages.length})\n${assessment.ticketDraftWorkPackages
          .map((w) => `• *${w.key}* ${w.title} — _${w.validationStatus.replace(/_/g, " ")}_`)
          .join("\n")}`
      }
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: "Evidence traceability graph posts to the demo channel on each SME decision · Deterministic fixture · SME validation required before implementation"
        }
      ]
    }
  ];
};

export const publishAppHome = async (
  client: WebClient,
  userId: string,
  assessment: ModernizationAssessment,
  state?: DemoWorkflowRenderState
): Promise<void> => {
  await client.views.publish({
    user_id: userId,
    view: {
      type: "home",
      blocks: buildAppHomeBlocks(assessment, state)
    }
  });
};

// Posts the traceability graph PNG into the demo channel, captioned with live
// validation state. Channel image messages are the most robust Slack image
// surface — they render for every channel member, no auth/visibility caveats.
// Errors are swallowed so a graph failure never breaks the card or Home publish.
export const postTraceabilityGraph = async (
  client: WebClient,
  assessment: ModernizationAssessment
): Promise<void> => {
  if (!DEMO_CHANNEL_ID) {
    console.warn("SLACK_DEMO_CHANNEL_ID not set — skipping traceability graph post.");
    return;
  }
  const caption = `*Evidence traceability graph* · ${assessment.moduleName} · ${validationSummary(
    assessment
  )} · color = validation status`;
  try {
    await uploadTraceabilityGraph(client, assessment, DEMO_CHANNEL_ID, caption);
  } catch (err) {
    console.error("Traceability graph post failed:", err);
  }
};