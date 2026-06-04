import type { ModernizationAssessment } from "../domain/types.ts";

export const claimsBatchAssessment: ModernizationAssessment = {
  assessmentId: "LMC-CLAIMS-BATCH-2026-0001",
  moduleId: "claims-batch",
  moduleName: "CLAIMS-BATCH",
  language: "COBOL",
  platform: "z/OS batch",
  businessPurpose:
    "Nightly claims adjudication batch that validates submitted insurance claims, applies eligibility and policy rules, calculates payable amounts, and produces downstream payment and exception files.",
  modernizationRisk: {
    level: "high",
    rationale:
      "The module sits on the critical payment path, mixes business rules with file and database access, and has several unresolved SME questions before safe migration.",
    drivers: [
      "Payment-impacting business logic",
      "Nightly batch dependency with strict completion window",
      "Shared copybooks used by multiple claims programs",
      "Unclear ownership of exception handling rules",
      "Downstream payment file contract must remain stable during migration"
    ]
  },
  extractedBusinessRules: [
    {
      id: "BR-001",
      title: "Claim eligibility window",
      description:
        "Claims are eligible for automated processing only when the service date falls within the active policy coverage period.",
      sourceEvidence: "Detected from date comparison branch around POLICY-START-DATE and POLICY-END-DATE.",
      confidence: "high"
    },
    {
      id: "BR-002",
      title: "High-value claim review",
      description:
        "Claims above the configured high-value threshold are routed to manual review instead of straight-through payment.",
      sourceEvidence: "Detected from amount threshold branch before payment file write.",
      confidence: "medium"
    },
    {
      id: "BR-003",
      title: "Duplicate claim suppression",
      description:
        "Claims with matching member, provider, service date, and procedure code are flagged as possible duplicates.",
      sourceEvidence: "Detected from composite key lookup against prior claims table.",
      confidence: "medium"
    },
    {
      id: "BR-004",
      title: "Exception file generation",
      description:
        "Rejected or incomplete claims are written to an exception file consumed by the operations team the next morning.",
      sourceEvidence: "Detected from WRITE operation to CLAIMS-EXCEPTION-FILE.",
      confidence: "high"
    }
  ],
  dependencies: [
    {
      name: "DB2.CLAIMS_HISTORY",
      type: "database",
      modernizationConcern:
        "Used for duplicate detection and prior claim lookup; migration requires read consistency and historical data access."
    },
    {
      name: "POLICY-MASTER-FILE",
      type: "file",
      modernizationConcern:
        "Fixed-width input contract must be preserved or explicitly versioned for upstream policy administration systems."
    },
    {
      name: "PAYMENT-OUTBOUND-FILE",
      type: "file",
      modernizationConcern:
        "Downstream payment system depends on current field order, encoding, and nightly delivery timing."
    },
    {
      name: "CA7 nightly schedule",
      type: "scheduler",
      modernizationConcern:
        "Batch completion window and restart behavior must be mapped before cloud or service-based migration."
    },
    {
      name: "Claims Operations SME",
      type: "team",
      modernizationConcern:
        "Exception handling and manual review thresholds require business validation before implementation."
    }
  ],
  unknowns: [
    {
      id: "Q-001",
      question:
        "Is the high-value review threshold still current, or has it been changed operationally outside the code?",
      ownerRole: "Claims Operations SME",
      reason: "Threshold logic appears business-critical but may not reflect current policy."
    },
    {
      id: "Q-002",
      question:
        "Which downstream consumers depend on the exact PAYMENT-OUTBOUND-FILE layout?",
      ownerRole: "Solution Architect",
      reason: "File contract stability determines whether strangler migration is safe."
    },
    {
      id: "Q-003",
      question:
        "What is the required recovery behavior if the batch fails after exception file generation but before payment file delivery?",
      ownerRole: "Mainframe Batch Lead",
      reason: "Restart semantics must be preserved during modernization."
    }
  ],
  recommendedMigrationPath: [
    "Freeze current CLAIMS-BATCH behavior with golden test cases from production-like historical claim samples.",
    "Extract and validate business rules with Claims Operations SMEs before code transformation.",
    "Create a parallel-run service that reproduces eligibility, duplicate detection, review routing, and exception generation.",
    "Keep existing payment file contract stable while introducing versioned adapters around downstream outputs.",
    "Run side-by-side reconciliation for at least two month-end cycles before cutover."
  ],
  jiraReadyWorkPackages: [
    {
      key: "LMC-101",
      title: "Create golden test dataset for CLAIMS-BATCH",
      priority: "p0",
      ownerRole: "QA Lead",
      description:
        "Build representative input and expected-output datasets covering eligible, rejected, duplicate, and high-value claims.",
      acceptanceCriteria: [
        "Dataset covers normal, exception, duplicate, and high-value paths",
        "Expected payment and exception outputs are approved by Claims Operations",
        "Dataset can be reused in CI for future modernization work"
      ]
    },
    {
      key: "LMC-102",
      title: "Validate extracted claims business rules with SMEs",
      priority: "p0",
      ownerRole: "Business Analyst",
      description:
        "Review extracted business rules and unresolved questions with Claims Operations and architecture stakeholders.",
      acceptanceCriteria: [
        "Each extracted rule is marked approved, changed, or retired",
        "High-value review threshold is confirmed",
        "Exception handling ownership is documented"
      ]
    },
    {
      key: "LMC-103",
      title: "Map CLAIMS-BATCH dependencies and file contracts",
      priority: "p1",
      ownerRole: "Solution Architect",
      description:
        "Document upstream inputs, downstream outputs, scheduler behavior, restart semantics, and data dependencies.",
      acceptanceCriteria: [
        "All file layouts are documented",
        "Downstream consumers are identified",
        "Batch restart and reconciliation behavior is captured"
      ]
    },
    {
      key: "LMC-104",
      title: "Design strangler migration plan for claims adjudication",
      priority: "p1",
      ownerRole: "Modernization Architect",
      description:
        "Define a low-risk migration path that allows parallel run, reconciliation, and staged cutover.",
      acceptanceCriteria: [
        "Target architecture includes adapter boundary for payment output",
        "Parallel-run approach is documented",
        "Cutover and rollback criteria are defined"
      ]
    }
  ],
  toolTrace: [
    {
      tool: "legacy.module.lookup",
      input: "claims-batch",
      outputSummary: "Resolved module CLAIMS-BATCH as COBOL z/OS nightly claims adjudication batch."
    },
    {
      tool: "legacy.rule.extractor.fixture",
      input: "CLAIMS-BATCH",
      outputSummary: "Extracted four candidate business rules with medium-to-high confidence."
    },
    {
      tool: "legacy.dependency.mapper.fixture",
      input: "CLAIMS-BATCH",
      outputSummary: "Mapped DB2, fixed-width file, scheduler, and SME/team dependencies."
    },
    {
      tool: "delivery.planner.fixture",
      input: "CLAIMS-BATCH modernization assessment",
      outputSummary: "Generated four Jira-ready work packages for test, SME validation, dependency mapping, and migration design."
    }
  ]
};
