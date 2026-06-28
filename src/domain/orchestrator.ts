import type {
  BusinessRuleReport,
  LegacyAnalysisClient,
  ModernizationAssessment,
  ModernizationPlan
} from "./types.ts";
import { claimsBatchAssessment } from "../demo/fixtures.ts";
import { mcpLegacyAnalysisClient } from "./mcp-legacy-analysis-client.ts";

class DeterministicLegacyAnalysisClient implements LegacyAnalysisClient {
  async assessModule(moduleId: string): Promise<ModernizationAssessment> {
    if (moduleId.toLowerCase() !== claimsBatchAssessment.moduleId) {
      throw new Error(`Unknown demo module: ${moduleId}`);
    }

    return {
      ...claimsBatchAssessment,
      toolTrace: [
        {
          tool: "legacy.assess_module",
          input: moduleId,
          outputSummary:
            "Returned deterministic fixture assessment for local tests and offline development.",
          evidenceProduced: claimsBatchAssessment.evidenceCatalog.evidence.map(
            (evidence) => evidence.id
          )
        }
      ]
    };
  }

  async extractRules(moduleId: string): Promise<BusinessRuleReport> {
    const assessment = await this.assessModule(moduleId);

    return {
      moduleId: assessment.moduleId,
      rules: assessment.extractedBusinessRules
    };
  }

  async createModernizationPlan(moduleId: string): Promise<ModernizationPlan> {
    const assessment = await this.assessModule(moduleId);

    return {
      moduleId: assessment.moduleId,
      migrationPath: assessment.recommendedMigrationPath,
      workPackages: assessment.jiraReadyWorkPackages
    };
  }
}

export const deterministicLegacyAnalysisClient = new DeterministicLegacyAnalysisClient();

export const runLegacyAssessmentWorkflow = async (
  moduleId: string,
  client: LegacyAnalysisClient = mcpLegacyAnalysisClient
): Promise<ModernizationAssessment> => client.assessModule(moduleId);
