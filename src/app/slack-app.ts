import "dotenv/config";
import { fileURLToPath } from "node:url";
import { App } from "@slack/bolt";
import {
  legacyAssessmentActionIds,
  renderModernizationAssessmentBlocks,
  renderModernizationAssessmentText,
  renderMcpTraceResponse,
  renderSmeFollowUpResponse,
  renderSmeReviewedResponse,
  renderTicketDraftResponse
} from "./render.ts";
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

export const createSlackApp = (): App => {
  const app = new App({
    token: requiredEnv("SLACK_BOT_TOKEN"),
    appToken: requiredEnv("SLACK_APP_TOKEN"),
    signingSecret: requiredEnv("SLACK_SIGNING_SECRET"),
    socketMode: true
  });

  const loadDemoAssessment = async () => runLegacyAssessmentWorkflow("claims-batch");

  app.command("/legacy", async ({ command, ack, logger }) => {
    const normalizedText = normalizeCommandText(command.text);

    if (normalizedText === "assess claims-batch" || normalizedText === "demo") {
      const assessment = await runLegacyAssessmentWorkflow("claims-batch");
      await ack({
        response_type: "ephemeral",
        text: renderModernizationAssessmentText(assessment),
        blocks: renderModernizationAssessmentBlocks(assessment)
      });
      return;
    }

    logger.info(`Unhandled /legacy command text: "${command.text}"`);
    await ack({
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

  app.action(legacyAssessmentActionIds.markSmeReviewed, async ({ ack, respond }) => {
    await ack();
    const assessment = await loadDemoAssessment();
    await respond({
      response_type: "ephemeral",
      replace_original: false,
      text: renderSmeReviewedResponse(assessment)
    });
  });

  app.action(legacyAssessmentActionIds.needsSmeFollowUp, async ({ ack, respond }) => {
    await ack();
    const assessment = await loadDemoAssessment();
    await respond({
      response_type: "ephemeral",
      replace_original: false,
      text: renderSmeFollowUpResponse(assessment)
    });
  });

  app.action(legacyAssessmentActionIds.prepareTicketDraft, async ({ ack, respond }) => {
    await ack();
    const assessment = await loadDemoAssessment();
    await respond({
      response_type: "ephemeral",
      replace_original: false,
      text: renderTicketDraftResponse(assessment)
    });
  });

  app.action(legacyAssessmentActionIds.showMcpTrace, async ({ ack, respond }) => {
    await ack();
    const assessment = await loadDemoAssessment();
    await respond({
      response_type: "ephemeral",
      replace_original: false,
      text: renderMcpTraceResponse(assessment)
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
