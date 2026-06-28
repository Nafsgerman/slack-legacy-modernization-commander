import type {
  BusinessRule,
  Dependency,
  EvidenceCatalog,
  ModernizationAssessment,
  SmeValidationChecklistItem,
  SmeQuestion,
  WorkPackage
} from "../domain/types.ts";
import { claimsBatchAssessment } from "../demo/fixtures.ts";

export interface ModuleAssessmentToolResult {
  assessmentId: string;
  generatedAtUtc: string;
  moduleId: string;
  moduleName: string;
  language: string;
  platform: string;
  businessPurpose: string;
  confidence: ModernizationAssessment["confidence"];
  validationStatus: ModernizationAssessment["validationStatus"];
  evidenceCatalog: EvidenceCatalog;
  modernizationRisk: ModernizationAssessment["modernizationRisk"];
  dependencies: Dependency[];
  unknowns: SmeQuestion[];
  smeValidationChecklist: SmeValidationChecklistItem[];
  outputSummary: string;
}

export interface RuleExtractionToolResult {
  moduleId: string;
  rules: BusinessRule[];
  outputSummary: string;
}

export interface ModernizationPlanToolResult {
  moduleId: string;
  migrationPath: string[];
  workPackages: WorkPackage[];
  outputSummary: string;
}

const normalizeModuleId = (moduleId: string): string => moduleId.trim().toLowerCase();

const requireClaimsBatch = (moduleId: string): ModernizationAssessment => {
  if (normalizeModuleId(moduleId) !== claimsBatchAssessment.moduleId) {
    throw new Error(
      `Unknown demo module "${moduleId}". Available demo module: ${claimsBatchAssessment.moduleId}`
    );
  }

  return claimsBatchAssessment;
};

export const assessModule = (moduleId: string): ModuleAssessmentToolResult => {
  const assessment = requireClaimsBatch(moduleId);

  return {
    assessmentId: assessment.assessmentId,
    generatedAtUtc: assessment.generatedAtUtc,
    moduleId: assessment.moduleId,
    moduleName: assessment.moduleName,
    language: assessment.language,
    platform: assessment.platform,
    businessPurpose: assessment.businessPurpose,
    confidence: assessment.confidence,
    validationStatus: assessment.validationStatus,
    evidenceCatalog: assessment.evidenceCatalog,
    modernizationRisk: assessment.modernizationRisk,
    dependencies: assessment.dependencies,
    unknowns: assessment.unknowns,
    smeValidationChecklist: assessment.smeValidationChecklist,
    outputSummary:
      `Resolved ${assessment.moduleName} as a ${assessment.language} ${assessment.platform} module with ` +
      `${assessment.modernizationRisk.level} modernization risk.`
  };
};

export const extractRules = (moduleId: string): RuleExtractionToolResult => {
  const assessment = requireClaimsBatch(moduleId);

  return {
    moduleId: assessment.moduleId,
    rules: assessment.extractedBusinessRules,
    outputSummary:
      `Extracted ${assessment.extractedBusinessRules.length} candidate business rules for ${assessment.moduleName}.`
  };
};

export const createPlan = (moduleId: string): ModernizationPlanToolResult => {
  const assessment = requireClaimsBatch(moduleId);

  return {
    moduleId: assessment.moduleId,
    migrationPath: assessment.recommendedMigrationPath,
    workPackages: assessment.jiraReadyWorkPackages,
    outputSummary:
      `Generated ${assessment.jiraReadyWorkPackages.length} Jira-ready work packages and ` +
      `${assessment.recommendedMigrationPath.length} migration path steps for ${assessment.moduleName}.`
  };
};
