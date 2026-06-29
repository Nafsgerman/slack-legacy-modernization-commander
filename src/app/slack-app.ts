export type RiskLevel = "low" | "medium" | "high" | "critical";
export type Confidence = "low" | "medium" | "high";
export type WorkPackagePriority = "p0" | "p1" | "p2";
export type ValidationStatus = "unverified" | "machine_inferred" | "sme_validated";

export interface EvidenceRef {
  artifactId: string;
  startLine: number;
  endLine: number;
  excerpt?: string; // set by application code only, never trusted from model
}

export interface EvidenceCatalog {
  refs: EvidenceRef[];
  coverageLineCount: number;
  verifiedCount: number;
  unverifiedCount: number;
}

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
  validationStatus: ValidationStatus;
  evidenceRefs: EvidenceRef[];
}

export interface Dependency {
  name: string;
  type: "database" | "file" | "scheduler" | "api" | "team" | "platform";
  modernizationConcern: string;
  validationStatus: ValidationStatus;
  evidenceRefs: EvidenceRef[];
}

export interface SmeQuestion {
  id: string;
  question: string;
  ownerRole: string;
  reason: string;
  validationStatus: ValidationStatus;
  evidenceRefs: EvidenceRef[];
}

export interface WorkPackage {
  key: string;
  title: string;
  priority: WorkPackagePriority;
  ownerRole: string;
  description: string;
  acceptanceCriteria: string[];
  validationStatus: ValidationStatus;
  evidenceRefs: EvidenceRef[];
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
  evidenceCatalog: EvidenceCatalog;
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

// Source artifact for citation verification
export interface SourceArtifact {
  artifactId: string;
  lines: string[]; // 1-indexed access via lines[lineNum - 1]
}