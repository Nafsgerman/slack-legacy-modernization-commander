import type { ModernizationAssessment } from "../domain/types.ts";

export const claimsBatchAssessment: ModernizationAssessment = {
  assessmentId: "LMC-CLAIMS-BATCH-2026-0001",
  generatedAtUtc: "2026-01-15T12:00:00.000Z",
  moduleId: "claims-batch",
  moduleName: "CLAIMS-BATCH",
  language: "COBOL",
  platform: "z/OS batch",
  businessPurpose:
    "Nightly claims adjudication batch that validates submitted insurance claims, applies eligibility and policy rules, calculates payable amounts, and produces downstream payment and exception files.",
  confidence: "medium",
  validationStatus: "sme_required",
  evidenceCatalog: {
    assessmentId: "LMC-CLAIMS-BATCH-2026-0001",
    evidence: [
      {
        id: "EV-001",
        sourceType: "code",
        sourceName: "Coverage-period branch",
        locator: {
          file: "fixtures/claims-batch.cobol",
          paragraph: "ELIGIBILITY-CHECK"
        },
        excerpt:
          "Synthetic fixture notes a service-date comparison against POLICY-START-DATE and POLICY-END-DATE."
      },
      {
        id: "EV-002",
        sourceType: "code",
        sourceName: "High-value review branch",
        locator: {
          file: "fixtures/claims-batch.cobol",
          paragraph: "REVIEW-ROUTING"
        },
        excerpt:
          "Synthetic fixture notes an amount threshold check before straight-through payment output."
      },
      {
        id: "EV-003",
        sourceType: "fixture",
        sourceName: "Prior-claims lookup",
        locator: {
          file: "fixtures/claims-batch.dependencies.json",
          paragraph: "DB2.CLAIMS_HISTORY"
        },
        excerpt:
          "Dependency fixture records a composite lookup by member, provider, service date, and procedure code."
      },
      {
        id: "EV-004",
        sourceType: "code",
        sourceName: "Exception file write",
        locator: {
          file: "fixtures/claims-batch.cobol",
          paragraph: "CLAIMS-EXCEPTION-FILE"
        },
        excerpt:
          "Synthetic fixture notes rejected or incomplete claims written to CLAIMS-EXCEPTION-FILE."
      },
      {
        id: "EV-005",
        sourceType: "file_contract",
        sourceName: "Payment outbound contract",
        locator: {
          file: "fixtures/payment-outbound.layout"
        },
        excerpt:
          "Dependency fixture marks the payment output as a stable downstream file contract."
      },
      {
        id: "EV-006",
        sourceType: "fixture",
        sourceName: "CA7 nightly batch window",
        locator: {
          file: "fixtures/claims-batch.schedule.json",
          paragraph: "CA7 nightly schedule"
        },
        excerpt:
          "Schedule fixture records nightly schedule, completion-window, and restart concerns."
      },
      {
        id: "EV-007",
        sourceType: "sme_note",
        sourceName: "Claims Operations validation gap",
        locator: {
          file: "fixtures/claims-operations-validation-notes.md",
          paragraph: "Open validation questions"
        },
        excerpt:
          "Fixture notes that Claims Operations must validate thresholds and exception handling before implementation."
      }
    ]
  },
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
    ],
    confidence: "medium",
    evidenceRefs: ["EV-001", "EV-002", "EV-003", "EV-004", "EV-005", "EV-006", "EV-007"],
    validationStatus: "sme_required"
  },
  extractedBusinessRules: [
    {
      id: "BR-001",
      title: "Claim eligibility window",
      description:
        "Claims are eligible for automated processing only when the service date falls within the active policy coverage period.",
      evidenceRefs: ["EV-001"],
      confidence: "high",
      validationStatus: "machine_inferred"
    },
    {
      id: "BR-002",
      title: "High-value claim review",
      description:
        "Claims above the configured high-value threshold are routed to manual review instead of straight-through payment.",
      evidenceRefs: ["EV-002", "EV-007"],
      confidence: "medium",
      validationStatus: "sme_required"
    },
    {
      id: "BR-003",
      title: "Duplicate claim suppression",
      description:
        "Claims with matching member, provider, service date, and procedure code are flagged as possible duplicates.",
      evidenceRefs: ["EV-003"],
      confidence: "medium",
      validationStatus: "machine_inferred"
    },
    {
      id: "BR-004",
      title: "Exception file generation",
      description:
        "Rejected or incomplete claims are written to an exception file consumed by the operations team the next morning.",
      evidenceRefs: ["EV-004", "EV-007"],
      confidence: "high",
      validationStatus: "sme_required"
    }
  ],
  dependencies: [
    {
      name: "DB2.CLAIMS_HISTORY",
      type: "database",
      modernizationConcern:
        "Used for duplicate detection and prior claim lookup; migration requires read consistency and historical data access.",
      evidenceRefs: ["EV-003"]
    },
    {
      name: "POLICY-MASTER-FILE",
      type: "file",
      modernizationConcern:
        "Fixed-width input contract must be preserved or explicitly versioned for upstream policy administration systems.",
      evidenceRefs: ["EV-001"]
    },
    {
      name: "PAYMENT-OUTBOUND-FILE",
      type: "file",
      modernizationConcern:
        "Downstream payment system depends on current field order, encoding, and nightly delivery timing.",
      evidenceRefs: ["EV-005"]
    },
    {
      name: "CA7 nightly schedule",
      type: "scheduler",
      modernizationConcern:
        "Batch completion window and restart behavior must be mapped before cloud or service-based migration.",
      evidenceRefs: ["EV-006"]
    },
    {
      name: "Claims Operations SME",
      type: "team",
      modernizationConcern:
        "Exception handling and manual review thresholds require business validation before implementation.",
      evidenceRefs: ["EV-007"]
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
  ticketDraftWorkPackages: [
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
      ],
      evidenceRefs: ["EV-001", "EV-002", "EV-003", "EV-004"],
      validationStatus: "sme_required"
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
      ],
      evidenceRefs: ["EV-001", "EV-002", "EV-003", "EV-004", "EV-007"],
      validationStatus: "sme_required"
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
      ],
      evidenceRefs: ["EV-003", "EV-005", "EV-006"],
      validationStatus: "sme_required"
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
      ],
      evidenceRefs: ["EV-005", "EV-006", "EV-007"],
      validationStatus: "sme_required"
    }
  ],
  smeValidationChecklist: [
    {
      id: "SME-001",
      title: "Approve extracted business rules",
      ownerRole: "Claims Operations SME",
      status: "sme_required",
      evidenceRefs: ["EV-001", "EV-002", "EV-003", "EV-004"],
      checklist: [
        "Confirm each rule is still active",
        "Mark changed or retired rules",
        "Approve golden-test expected outputs"
      ]
    },
    {
      id: "SME-002",
      title: "Validate payment and exception file contracts",
      ownerRole: "Solution Architect",
      status: "sme_required",
      evidenceRefs: ["EV-004", "EV-005"],
      checklist: [
        "Identify downstream consumers",
        "Confirm field order and encoding constraints",
        "Define versioning path for future adapters"
      ]
    },
    {
      id: "SME-003",
      title: "Validate batch recovery behavior",
      ownerRole: "Mainframe Batch Lead",
      status: "sme_required",
      evidenceRefs: ["EV-006"],
      checklist: [
        "Document current restart points",
        "Confirm recovery behavior after partial output",
        "Define cutover rollback criteria"
      ]
    }
  ],
  toolTrace: [
    {
      tool: "legacy.assess_module",
      input: "claims-batch",
      outputSummary: "Resolved module CLAIMS-BATCH as COBOL z/OS nightly claims adjudication batch.",
      evidenceProduced: ["EV-001", "EV-005", "EV-006"]
    },
    {
      tool: "legacy.extract_rules",
      input: "CLAIMS-BATCH",
      outputSummary: "Extracted four candidate business rules with medium-to-high confidence.",
      evidenceProduced: ["EV-001", "EV-002", "EV-003", "EV-004"]
    },
    {
      tool: "legacy.create_plan",
      input: "CLAIMS-BATCH modernization assessment",
      outputSummary: "Prepared four ticket-draft work packages for test, SME validation, dependency mapping, and migration design.",
      evidenceProduced: ["EV-001", "EV-002", "EV-003", "EV-004", "EV-005", "EV-006", "EV-007"]
    }
  ]
};
