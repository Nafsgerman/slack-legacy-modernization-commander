import {
  renderModernizationAssessmentText
} from "../app/render.ts";
import { runLegacyAssessmentWorkflow } from "../domain/orchestrator.ts";

const assessment = await runLegacyAssessmentWorkflow("claims-batch");

console.log(renderModernizationAssessmentText(assessment));
