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
import type { DemoWorkflowRenderState } from "./render.ts";
import { runLegacyAssessmentWorkflow } from "../domain/orchestrator.ts";
import { applyValidationDecision } from "../domain/validation-decision.ts";
import { publishAppHome, postTraceabilityGraph } from "./home.ts";
import { resolveAnalysisClient, AgentModeUnavailableError } from "../domain/client-factory.ts";
import { parseAssessArgs, InvalidAssessCommandError } from "./command-args.ts";

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
  "`/legacy assess claims-batch --agent`  (force live Claude agent)",
  "`/legacy assess claims-batch --fixture`  (force deterministic fixture)",
  "",
  "Returns a COBOL claims-batch assessment with business rules, dependencies, SME questions, migration path, work packages, and tool-call audit summary."
].join("\n");

const agentUnavailableText = [
  "*Agent mode unavailable*",
  "",
  "`--agent` was requested but `ANTHROPIC_API_KEY` is not set in this environment.",
  "Run `/legacy assess claims-batch` (auto mode) or `--fixture` instead."
].join("\n");

export const createSlackApp = (): App => {
  const app = new App({
    token: requiredEnv("SLACK_BOT_TOKEN"),
    appToken: requiredEnv("SLACK_APP_TOKEN"),
    signingSecret: requiredEnv("SLACK_SIGNING_SECRET"),
    socketMode: true
  });

  const demoState = new Map<string, DemoWorkflowRenderState>();

  app.command("/legacy", async ({ command, ack, client, respond, logger }) => {
    let parsed;
    try {
      parsed = parseAssessArgs(command.text);
    } catch (err) {
      if (err instanceof InvalidAssessCommandError) {
        logger.info(`Unhandled /legacy command text: "${command.text}"`);
        await ack({
          response_type: "ephemeral",
          text: helpText,
          blocks: [{ type: "section", text: { type: "mrkdwn", text: helpText } }]
        });
        return;
      }
      throw err;
    }

    let resolved;
    try {
      resolved = resolveAnalysisClient(parsed.mode);
    } catch (err) {
      if (err instanceof AgentModeUnavailableError) {
        await ack({
          response_type: "ephemeral",
          text: agentUnavailableText,
          blocks: [{ type: "section", text: { type: "mrkdwn", text: agentUnavailableText } }]
        });
        return;
      }
      throw err;
    }

    // ack() must fire within Slack's 3s window. Agent-mode calls take 15-40s,
    // so we ack with a placeholder immediately, then deliver the real result
    // via respond() (response_url, valid ~30min) once the workflow finishes.
    const placeholderText =
      resolved.mode === "agent"
        ? `Running live agent assessment on *${parsed.moduleId}* via ${resolved.model}… this can take up to a minute.`
        : `Running fixture assessment on *${parsed.moduleId}*…`;

    await ack({
      response_type: "ephemeral",
      text: placeholderText,
      blocks: [{ type: "section", text: { type: "mrkdwn", text: placeholderText } }]
    });

    try {
      const assessment = await runLegacyAssessmentWorkflow(parsed.moduleId, resolved.client);
      await respond({
        replace_original: true,
        response_type: "ephemeral",
        text: renderModernizationAssessmentText(assessment, resolved),
        blocks: renderModernizationAssessmentBlocks(assessment, undefined, resolved)
      });
      // Post the initial (machine-inferred) traceability graph to the channel.
      await postTraceabilityGraph(client, assessment);
    } catch (err) {
      logger.error("/legacy assess failed after ack", err);
      const failureText = `Assessment failed: ${(err as Error).message}`;
      await respond({
        replace_original: true,
        response_type: "ephemeral",
        text: failureText,
        blocks: [{ type: "section", text: { type: "mrkdwn", text: failureText } }]
      });
    }
  });

  app.event("app_home_opened", async ({ event, client, logger }) => {
    try {
      const base = await runLegacyAssessmentWorkflow("claims-batch");
      const key = `${event.user}:claims-batch`;
      const state = demoState.get(key);
      const assessment =
        state?.demoWorkflowStatus === "sme_reviewed"
          ? applyValidationDecision(base, "sme_validated")
          : state?.demoWorkflowStatus === "sme_followup_required"
          ? applyValidationDecision(base, "sme_required")
          : base;
      await publishAppHome(client, event.user, assessment, state);
    } catch (err) {
      logger.error("app_home_opened: failed to publish Home", err);
    }
  });

  app.action(legacyAssessmentActionIds.markSmeReviewed, async ({ ack, body, client, respond, logger }) => {
    await ack();
    try {
      const userId = body.user.id;
      const base = await runLegacyAssessmentWorkflow("claims-batch");
      const assessment = applyValidationDecision(base, "sme_validated");
      const key = `${userId}:claims-batch`;
      const state: DemoWorkflowRenderState = { demoWorkflowStatus: "sme_reviewed" };
      demoState.set(key, state);
      await respond({
        replace_original: true,
        text: renderModernizationAssessmentText(assessment),
        blocks: renderModernizationAssessmentBlocks(assessment, state)
      });
      await publishAppHome(client, userId, assessment, state);
      await postTraceabilityGraph(client, assessment);
    } catch (err) {
      logger.error("markSmeReviewed error", err);
    }
  });

  app.action(legacyAssessmentActionIds.needsSmeFollowUp, async ({ ack, body, client, respond, logger }) => {
    await ack();
    try {
      const userId = body.user.id;
      const base = await runLegacyAssessmentWorkflow("claims-batch");
      const assessment = applyValidationDecision(base, "sme_required");
      const key = `${userId}:claims-batch`;
      const state: DemoWorkflowRenderState = { demoWorkflowStatus: "sme_followup_required" };
      demoState.set(key, state);
      await respond({
        replace_original: true,
        text: renderModernizationAssessmentText(assessment),
        blocks: renderModernizationAssessmentBlocks(assessment, state)
      });
      await publishAppHome(client, userId, assessment, state);
      await postTraceabilityGraph(client, assessment);
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