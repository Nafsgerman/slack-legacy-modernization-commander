import { renderIncidentBriefText } from "../app/render.ts";
import { runIncidentWorkflow } from "../domain/orchestrator.ts";
import { demoAlert } from "./fixtures.ts";

const brief = runIncidentWorkflow(demoAlert);

console.log(renderIncidentBriefText(brief));
console.log("\nTool trace:");
for (const trace of brief.toolTrace) {
  console.log(`- ${trace.observedAt} ${trace.toolName}: ${trace.resultSummary}`);
}
