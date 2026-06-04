export type RiskLevel = "low" | "medium" | "high" | "critical";
export type Confidence = "low" | "medium" | "high";
export type WorkPackagePriority = "p0" | "p1" | "p2";

export interface ToolTraceEntry {
  tool: string;
  input: string;
  outputSummary: string;
}

export interface BusinessRule {
  id: string;
  title: string;
  description: string;
  sourceEvidence: string;
  confidence: Confidence;
}

export interface Dependency {
  name: string;
  type: "database" | "file" | "scheduler" | "api" | "team" | "platform";
  modernizationConcern: string;
}

export interface SmeQuestion {
  id: string;
  question: string;
  ownerRole: string;
  reason: string;
}

export interface WorkPackage {
  key: string;
  title: string;
  priority: WorkPackagePriority;
  ownerRole: string;
  description: string;
  acceptanceCriteria: string[];
}

export interface ModernizationAssessment {
  assessmentId: string;
  moduleId: string;
  moduleName: string;
  language: string;
  platform: string;
  businessPurpose: string;
  modernizationRisk: {
    level: RiskLevel;
    rationale: string;
    drivers: string[];
  };
  extractedBusinessRules: BusinessRule[];
  dependencies: Dependency[];
  unknowns: SmeQuestion[];
  recommendedMigrationPath: string[];
  jiraReadyWorkPackages: WorkPackage[];
  toolTrace: ToolTraceEntry[];
}

export interface BusinessRuleReport {
  moduleId: string;
  rules: BusinessRule[];
}

export interface ModernizationPlan {
  moduleId: string;
  migrationPath: string[];
  workPackages: WorkPackage[];
}

export interface LegacyAnalysisClient {
  assessModule(moduleId: string): Promise<ModernizationAssessment>;
  extractRules(moduleId: string): Promise<BusinessRuleReport>;
  createModernizationPlan(moduleId: string): Promise<ModernizationPlan>;
}
