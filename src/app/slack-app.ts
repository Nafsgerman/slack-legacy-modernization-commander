import "dotenv/config";
import { fileURLToPath } from "node:url";
import { App } from "@slack/bolt";
import {
  legacyAssessmentActionIds,
  renderModernizationAssessmentBlocks,
  renderMcpTraceResponse,
  renderMcpTraceResponseBlocks,
  renderTicketDraftResponse,
  renderTicketDraftResponseBlocks
} from "./render.ts";
import type { ModernizationAssessment } from "../domain/types.ts";
import { runLegacyAssessmentWorkflow } from "../domain/orchestrator.ts";

const requiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const helpText = [
  "*Legacy Modernization Commander*",
  "",
  "Run the demo modernization assessment:",
  "`/legacy assess claims-batch`",
  "",
  "Current demo: COBOL claims batch modernization assessment with business rules, dependencies, SME questions, migration path, ticket-draft work packages, and MCP trace visibility."
].join("\n");

const normalizeCommandText = (text: string | undefined): string =>
  text?.trim().toLowerCase().replace(/\s+/g, " ") ?? "";

export const buildAssessmentResponse = (assessment: ModernizationAssessment) => ({
  response_type: "in_channel" as const,
  text: `Legacy modernization assessment for ${assessment.moduleName}`,
  blocks: renderModernizationAssessmentBlocks(assessment)
});

export const createSlackApp = (): App => {
  const app = new App({
    token: requiredEnv("SLACK_BOT_TOKEN"),
    appToken: requiredEnv("SLACK_APP_TOKEN"),
    signingSecret: requiredEnv("SLACK_SIGNING_SECRET"),
    socketMode: true
  });

  const loadDemoAssessment = async () => runLegacyAssessmentWorkflow("claims-batch");

  app.command("/legacy", async ({ command, ack, respond, logger }) => {
    await ack();
    const normalizedText = normalizeCommandText(command.text);

    if (normalizedText === "assess claims-batch" || normalizedText === "demo") {
      const assessment = await loadDemoAssessment();
      await respond(buildAssessmentResponse(assessment));
      return;
    }

    logger.info(`Unhandled /legacy command text: "${command.text}"`);
    await respond({
      response_type: "ephemeral",
      text: helpText,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: helpText
          }
        }
      ]
    });
  });

  // SME decision buttons mutate the original card in place via the action's
  // response_url (replace_original). Reliable for both ephemeral and in_channel
  // response_url messages; no chat.update / channel+ts plumbing required.
  app.action(legacyAssessmentActionIds.markSmeReviewed, async ({ ack, respond }) => {
    await ack();
    const assessment = await loadDemoAssessment();
    await respond({
      response_type: "in_channel",
      replace_original: true,
      text: `${assessment.moduleName}: SME review marked complete for this demo session. No persistent enterprise state changed.`,
      blocks: renderModernizationAssessmentBlocks(assessment, {
        demoWorkflowStatus: "sme_reviewed"
      })
    });
  });

  app.action(legacyAssessmentActionIds.needsSmeFollowUp, async ({ ack, respond }) => {
    await ack();
    const assessment = await loadDemoAssessment();
    await respond({
      response_type: "in_channel",
      replace_original: true,
      text: `${assessment.moduleName}: SME follow-up requested for this demo session. No persistent enterprise state changed.`,
      blocks: renderModernizationAssessmentBlocks(assessment, {
        demoWorkflowStatus: "sme_followup_required"
      })
    });
  });

  // Additive info actions: reveal a draft / trace without replacing the card.
  app.action(legacyAssessmentActionIds.prepareTicketDraft, async ({ ack, respond }) => {
    await ack();
    const assessment = await loadDemoAssessment();
    await respond({
      response_type: "ephemeral",
      replace_original: false,
      text: renderTicketDraftResponse(assessment),
      blocks: renderTicketDraftResponseBlocks(assessment)
    });
  });

  app.action(legacyAssessmentActionIds.showMcpTrace, async ({ ack, respond }) => {
    await ack();
    const assessment = await loadDemoAssessment();
    await respond({
      response_type: "ephemeral",
      replace_original: false,
      text: renderMcpTraceResponse(assessment),
      blocks: renderMcpTraceResponseBlocks(assessment)
    });
  });

  app.error(async (error) => {
    console.error("Slack app error", error);
  });

  return app;
};

export const startSlackApp = async (): Promise<void> => {
  const app = createSlackApp();
  await app.start();
  console.log("Legacy Modernization Commander is running in Socket Mode.");
};

const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);

if (isMainModule) {
  await startSlackApp();
}