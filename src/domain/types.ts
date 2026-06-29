export type RiskLevel = "low" | "medium" | "high" | "critical";
export type Confidence = "low" | "medium" | "high";
export type WorkPackagePriority = "p0" | "p1" | "p2";
export type ValidationStatus =
  | "machine_inferred"
  | "sme_required"
  | "sme_validated"
  | "rejected";

export type EvidenceSourceType =
  | "fixture"
  | "code"
  | "copybook"
  | "file_contract"
  | "sme_note"
  | "test_case";

export interface ToolTraceEntry {
  tool: string;
  input: string;
  outputSummary: string;
  latencyMs?: number;
  evidenceProduced?: string[];
}

export interface EvidenceRef {
  id: string;
  sourceType: EvidenceSourceType;
  sourceName: string;
  locator?: {
    file?: string;
    paragraph?: string;
    lineStart?: number;
    lineEnd?: number;
  };
  excerpt: string;
}

export interface EvidenceCatalog {
  assessmentId: string;
  evidence: EvidenceRef[];
}

export interface BusinessRule {
  id: string;
  title: string;
  description: string;
  evidenceRefs: string[];
  confidence: Confidence;
  validationStatus: ValidationStatus;
}

export interface Dependency {
  name: string;
  type: "database" | "file" | "scheduler" | "api" | "team" | "platform";
  modernizationConcern: string;
  evidenceRefs: string[];
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
  evidenceRefs: string[];
  validationStatus: ValidationStatus;
}

export interface SmeValidationChecklistItem {
  id: string;
  title: string;
  ownerRole: string;
  status: ValidationStatus;
  evidenceRefs: string[];
  checklist: string[];
}

export interface ModernizationAssessment {
  assessmentId: string;
  generatedAtUtc: string;
  moduleId: string;
  moduleName: string;
  language: string;
  platform: string;
  businessPurpose: string;
  evidenceCatalog: EvidenceCatalog;
  confidence: Confidence;
  validationStatus: ValidationStatus;
  modernizationRisk: {
    level: RiskLevel;
    rationale: string;
    drivers: string[];
    confidence: Confidence;
    evidenceRefs: string[];
    validationStatus: ValidationStatus;
  };
  extractedBusinessRules: BusinessRule[];
  dependencies: Dependency[];
  unknowns: SmeQuestion[];
  recommendedMigrationPath: string[];
  ticketDraftWorkPackages: WorkPackage[];
  smeValidationChecklist: SmeValidationChecklistItem[];
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

export interface SourceArtifact {
  artifactId: string;
  lines: string[];
}
