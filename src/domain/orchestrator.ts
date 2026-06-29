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

    return claimsBatchAssessment;
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
      workPackages: assessment.ticketDraftWorkPackages
    };
  }
}

export const deterministicLegacyAnalysisClient = new DeterministicLegacyAnalysisClient();

export const runLegacyAssessmentWorkflow = async (
  moduleId: string,
  client: LegacyAnalysisClient = deterministicLegacyAnalysisClient
): Promise<ModernizationAssessment> => client.assessModule(moduleId);
