import "dotenv/config";
import { fileURLToPath } from "node:url";
import { App } from "@slack/bolt";
import {
  legacyAssessmentActionIds,
  renderModernizationAssessmentBlocks,
  renderModernizationAssessmentText,
  renderMcpTraceResponse,
  renderMcpTraceResponseBlocks,
  renderTicketDraftResponse,
  renderTicketDraftResponseBlocks
} from "./render.ts";
import { runLegacyAssessmentWorkflow } from "../domain/orchestrator.ts";
import { publishAppHome } from "./home.ts";
import type { DemoWorkflowRenderState } from "./render.ts";

const requiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

const helpText = [
  "*Legacy Modernization Commander*",
  "",
  "Run the demo modernization assessment:",
  "`/legacy assess claims-batch`",
  "",
  "Current demo: COBOL claims batch modernization assessment with business rules, dependencies, SME questions, migration path, work packages, and tool-call audit summary."
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

  const demoState = new Map<string, DemoWorkflowRenderState>();

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
      blocks: [{ type: "section", text: { type: "mrkdwn", text: helpText } }]
    });
  });

  app.event("app_home_opened", async ({ event, client, logger }) => {
    try {
      const assessment = await runLegacyAssessmentWorkflow("claims-batch");
      const key = `${event.user}:claims-batch`;
      await publishAppHome(client, event.user, assessment, demoState.get(key));
    } catch (err) {
      logger.error("app_home_opened: failed to publish Home", err);
    }
  });

  app.action(legacyAssessmentActionIds.markSmeReviewed, async ({ ack, body, client, respond, logger }) => {
    await ack();
    try {
      const userId = body.user.id;
      const assessment = await runLegacyAssessmentWorkflow("claims-batch");
      const key = `${userId}:claims-batch`;
      const state: DemoWorkflowRenderState = { demoWorkflowStatus: "sme_reviewed" };
      demoState.set(key, state);
      await respond({
        replace_original: true,
        text: renderModernizationAssessmentText(assessment),
        blocks: renderModernizationAssessmentBlocks(assessment, state)
      });
      await publishAppHome(client, userId, assessment, state);
    } catch (err) {
      logger.error("markSmeReviewed error", err);
    }
  });

  app.action(legacyAssessmentActionIds.needsSmeFollowUp, async ({ ack, body, client, respond, logger }) => {
    await ack();
    try {
      const userId = body.user.id;
      const assessment = await runLegacyAssessmentWorkflow("claims-batch");
      const key = `${userId}:claims-batch`;
      const state: DemoWorkflowRenderState = { demoWorkflowStatus: "sme_followup_required" };
      demoState.set(key, state);
      await respond({
        replace_original: true,
        text: renderModernizationAssessmentText(assessment),
        blocks: renderModernizationAssessmentBlocks(assessment, state)
      });
      await publishAppHome(client, userId, assessment, state);
    } catch (err) {
      logger.error("needsSmeFollowUp error", err);
    }
  });

  app.action(legacyAssessmentActionIds.prepareTicketDraft, async ({ ack, respond, logger }) => {
    await ack();
    try {
      const assessment = await runLegacyAssessmentWorkflow("claims-batch");
      await respond({
        replace_original: false,
        text: renderTicketDraftResponse(assessment),
        blocks: renderTicketDraftResponseBlocks(assessment)
      });
    } catch (err) {
      logger.error("prepareTicketDraft error", err);
    }
  });

  app.action(legacyAssessmentActionIds.showMcpTrace, async ({ ack, respond, logger }) => {
    await ack();
    try {
      const assessment = await runLegacyAssessmentWorkflow("claims-batch");
      await respond({
        replace_original: false,
        text: renderMcpTraceResponse(assessment),
        blocks: renderMcpTraceResponseBlocks(assessment)
      });
    } catch (err) {
      logger.error("showMcpTrace error", err);
    }
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