import "dotenv/config";
import { fileURLToPath } from "node:url";
import { App } from "@slack/bolt";
import { renderIncidentBriefBlocks, renderIncidentBriefText } from "./render.ts";
import { runIncidentWorkflow } from "../domain/orchestrator.ts";
import { demoAlert } from "../demo/fixtures.ts";

const requiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const helpText = [
  "*Slack Incident Commander*",
  "",
  "Run the demo triage workflow:",
  "`/incident triage suspicious-oauth`",
  "",
  "Current demo: suspicious Slack OAuth app activity with tool-grounded user, app, audit, and runbook context."
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

  app.command("/incident", async ({ command, ack, logger }) => {
    const normalizedText = normalizeCommandText(command.text);

    if (normalizedText === "triage suspicious-oauth" || normalizedText === "demo") {
      const brief = runIncidentWorkflow(demoAlert);
      await ack({
        response_type: "ephemeral",
        text: renderIncidentBriefText(brief),
        blocks: renderIncidentBriefBlocks(brief)
      });
      return;
    }

    logger.info(`Unhandled /incident command text: "${command.text}"`);
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

  app.error(async (error) => {
    console.error("Slack app error", error);
  });

  return app;
};

export const startSlackApp = async (): Promise<void> => {
  const app = createSlackApp();
  await app.start();
  console.log("Slack Incident Commander is running in Socket Mode.");
};

const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);

if (isMainModule) {
  await startSlackApp();
}
