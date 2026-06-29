import "dotenv/config";
import { fileURLToPath } from "node:url";
import { App } from "@slack/bolt";
import type { BlockAction } from "@slack/bolt";
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
import { applyValidationDecision } from "../domain/validation-decision.ts";

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

// Card body only. Posted via chat.postMessage so it is bot-owned and can be
// mutated in place with chat.update from the SME decision buttons.
export const buildAssessmentBlocks = (assessment: ModernizationAssessment) => ({
  text: `Legacy modernization assessment for ${assessment.moduleName}`,
  blocks: renderModernizationAssessmentBlocks(assessment)
});

const resolveCardTarget = (body: BlockAction): { channel?: string; ts?: string } => ({
  channel: body.channel?.id,
  ts: body.message?.ts
});

const isNotInChannel = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  (error as { data?: { error?: string } }).data?.error === "not_in_channel";

export const createSlackApp = (): App => {
  const app = new App({
    token: requiredEnv("SLACK_BOT_TOKEN"),
    appToken: requiredEnv("SLACK_APP_TOKEN"),
    signingSecret: requiredEnv("SLACK_SIGNING_SECRET"),
    socketMode: true
  });

  const loadDemoAssessment = async () => runLegacyAssessmentWorkflow("claims-batch");

  app.command("/legacy", async ({ command, ack, respond, client, logger }) => {
    await ack();
    const normalizedText = normalizeCommandText(command.text);

    if (normalizedText === "assess claims-batch" || normalizedText === "demo") {
      const assessment = await loadDemoAssessment();
      try {
        await client.chat.postMessage({
          channel: command.channel_id,
          ...buildAssessmentBlocks(assessment)
        });
      } catch (error) {
        if (isNotInChannel(error)) {
          await respond({
            response_type: "ephemeral",
            text:
              "I need to be a member of this channel to post the assessment card. " +
              "Add me via the channel name → Integrations → Add apps, then re-run `/legacy assess claims-batch`."
          });
          return;
        }
        throw error;
      }
      return;
    }

    logger.info(`Unhandled /legacy command text: "${command.text}"`);
    await respond({
      response_type: "ephemeral",
      text: helpText,
      blocks: [{ type: "section", text: { type: "mrkdwn", text: helpText } }]
    });
  });

  // SME decision buttons mutate the bot-owned card in place via chat.update.
  // The whole assessment is re-validated through applyValidationDecision, so
  // every rule / work package / checklist status flips visibly — not just the header.
  app.action(legacyAssessmentActionIds.markSmeReviewed, async ({ ack, body, client }) => {
    await ack();
    const { channel, ts } = resolveCardTarget(body as BlockAction);
    if (!channel || !ts) return;
    const assessment = await loadDemoAssessment();
    const reviewed = applyValidationDecision(assessment, "sme_validated");
    await client.chat.update({
      channel,
      ts,
      text: `${assessment.moduleName}: SME review marked complete for this demo session. No persistent enterprise state changed.`,
      blocks: renderModernizationAssessmentBlocks(reviewed, { demoWorkflowStatus: "sme_reviewed" })
    });
  });

  app.action(legacyAssessmentActionIds.needsSmeFollowUp, async ({ ack, body, client }) => {
    await ack();
    const { channel, ts } = resolveCardTarget(body as BlockAction);
    if (!channel || !ts) return;
    const assessment = await loadDemoAssessment();
    const flagged = applyValidationDecision(assessment, "sme_required");
    await client.chat.update({
      channel,
      ts,
      text: `${assessment.moduleName}: SME follow-up requested for this demo session. No persistent enterprise state changed.`,
      blocks: renderModernizationAssessmentBlocks(flagged, { demoWorkflowStatus: "sme_followup_required" })
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