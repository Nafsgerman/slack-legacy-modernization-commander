import { renderModernizationAssessmentText } from "../app/render.ts";
import { runLegacyAssessmentWorkflow } from "../domain/orchestrator.ts";
import { resolveAnalysisClient, AgentModeUnavailableError } from "../domain/client-factory.ts";
import { parseAssessArgs, InvalidAssessCommandError } from "../app/command-args.ts";

const buildCommandText = (argv: string[]): string => {
  // CLI usage: npm run demo -- --agent | --fixture
  // No module-id positional on the CLI — always targets claims-batch via the demo alias.
  const flags = argv.filter((arg) => arg === "--agent" || arg === "--fixture");
  return ["demo", ...flags].join(" ");
};

const main = async (): Promise<void> => {
  const argv = process.argv.slice(2);

  let parsed;
  try {
    parsed = parseAssessArgs(buildCommandText(argv));
  } catch (err) {
    if (err instanceof InvalidAssessCommandError) {
      console.error(err.message);
      console.error("Usage: npm run demo -- [--agent | --fixture]");
      process.exitCode = 1;
      return;
    }
    throw err;
  }

  let resolved;
  try {
    resolved = resolveAnalysisClient(parsed.mode);
  } catch (err) {
    if (err instanceof AgentModeUnavailableError) {
      console.error(err.message);
      process.exitCode = 1;
      return;
    }
    throw err;
  }

  const assessment = await runLegacyAssessmentWorkflow(parsed.moduleId, resolved.client);
  console.log(renderModernizationAssessmentText(assessment, resolved));
};

await main();