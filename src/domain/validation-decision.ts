import type { ModernizationAssessment, ValidationStatus } from "./types.ts";

/**
 * Pure, deterministic re-validation for the demo SME decision loop.
 * Flips all "open" validation statuses to the target; never touches "rejected".
 * Returns a new assessment; never mutates the input.
 */
export const applyValidationDecision = (
  assessment: ModernizationAssessment,
  target: Extract<ValidationStatus, "sme_validated" | "sme_required">
): ModernizationAssessment => {
  const flip = (status: ValidationStatus): ValidationStatus =>
    status === "rejected" ? status : target;

  return {
    ...assessment,
    validationStatus: flip(assessment.validationStatus),
    modernizationRisk: {
      ...assessment.modernizationRisk,
      validationStatus: flip(assessment.modernizationRisk.validationStatus)
    },
    extractedBusinessRules: assessment.extractedBusinessRules.map((rule) => ({
      ...rule,
      validationStatus: flip(rule.validationStatus)
    })),
    ticketDraftWorkPackages: assessment.ticketDraftWorkPackages.map((pkg) => ({
      ...pkg,
      validationStatus: flip(pkg.validationStatus)
    })),
    smeValidationChecklist: assessment.smeValidationChecklist.map((item) => ({
      ...item,
      status: flip(item.status)
    }))
  };
};