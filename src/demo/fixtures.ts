import type { ModernizationAssessment } from "../domain/types.ts";

export const claimsBatchAssessment: ModernizationAssessment = {
  assessmentId: "LMC-CLAIMS-BATCH-2026-0001",
  generatedAtUtc: "2026-06-29T00:00:00.000Z",
  moduleId: "claims-batch",
  moduleName: "CLAIMS-BATCH",
  language: "COBOL",
  platform: "z/OS batch",
  confidence: "high",
  validationStatus: "sme_required",
  businessPurpose:
    "Nightly claims adjudication batch that validates submitted insurance claims, applies eligibility and policy rules, calculates payable amounts, and produces downstream payment and exception files.",
  evidenceCatalog: {
    assessmentId: "LMC-CLAIMS-BATCH-2026-0001",
    evidence: [
      {
        id: "EV-001",
        sourceType: "code",
        sourceName: "claims-batch.cbl",
        locator: { file: "claims-batch.cbl", paragraph: "2100-CHECK-ELIGIBILITY", lineStart: 103, lineEnd: 108 },
        excerpt: "IF SERVICE-DATE < POLICY-START-DATE OR SERVICE-DATE > POLICY-END-DATE"
      },
      {
        id: "EV-002",
        sourceType: "code",
        sourceName: "claims-batch.cbl",
        locator: { file: "claims-batch.cbl", paragraph: "2300-ROUTE-OR-REJECT", lineStart: 124, lineEnd: 133 },
        excerpt: "IF CLAIM-AMOUNT > WS-HIGH-VALUE-THRESHOLD"
      },
      {
        id: "EV-003",
        sourceType: "code",
        sourceName: "claims-batch.cbl",
        locator: { file: "claims-batch.cbl", paragraph: "2200-CHECK-DUPLICATE", lineStart: 111, lineEnd: 122 },
        excerpt: "SELECT COUNT(*) INTO :WS-DB2-CLAIM-COUNT FROM DB2.CLAIMS_HISTORY WHERE MEMBER_ID = :MEMBER-ID AND PROVIDER_ID = :PROVIDER-ID AND SERVICE_DATE = :SERVICE-DATE AND PROC_CODE = :PROCEDURE-CODE"
      },
      {
        id: "EV-004",
        sourceType: "code",
        sourceName: "claims-batch.cbl",
        locator: { file: "claims-batch.cbl", paragraph: "8000-WRITE-EXCEPTION", lineStart: 137, lineEnd: 141 },
        excerpt: "WRITE CLAIMS-EXCEPTION-RECORD"
      },
      {
        id: "EV-005",
        sourceType: "code",
        sourceName: "claims-batch.cbl",
        locator: { file: "claims-batch.cbl", paragraph: "2200-CHECK-DUPLICATE", lineStart: 113, lineEnd: 120 },
        excerpt: "EXEC SQL SELECT COUNT(*) ... FROM DB2.CLAIMS_HISTORY END-EXEC"
      },
      {
        id: "EV-006",
        sourceType: "file_contract",
        sourceName: "claims-batch.cbl",
        locator: { file: "claims-batch.cbl", lineStart: 17, lineEnd: 24 },
        excerpt: "SELECT POLICY-MASTER-FILE ASSIGN TO 'POLICY.MASTER' ORGANIZATION IS SEQUENTIAL"
      },
      {
        id: "EV-007",
        sourceType: "file_contract",
        sourceName: "claims-batch.cbl",
        locator: { file: "claims-batch.cbl", paragraph: "7000-WRITE-PAYMENT", lineStart: 143, lineEnd: 148 },
        excerpt: "WRITE PAYMENT-OUTBOUND-RECORD"
      },
      {
        id: "EV-008",
        sourceType: "code",
        sourceName: "claims-batch.cbl",
        locator: { file: "claims-batch.cbl", lineStart: 70, lineEnd: 70 },
        excerpt: "WS-HIGH-VALUE-THRESHOLD PIC 9(9)V99 VALUE 50000.00"
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
    confidence: "high",
    evidenceRefs: ["EV-001", "EV-002", "EV-007"],
    validationStatus: "machine_inferred"
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
      evidenceRefs: ["EV-002", "EV-008"],
      confidence: "medium",
      validationStatus: "machine_inferred"
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
      evidenceRefs: ["EV-004"],
      confidence: "high",
      validationStatus: "machine_inferred"
    }
  ],
  dependencies: [
    {
      name: "DB2.CLAIMS_HISTORY",
      type: "database",
      modernizationConcern:
        "Used for duplicate detection and prior claim lookup; migration requires read consistency and historical data access.",
      evidenceRefs: ["EV-005"]
    },
    {
      name: "POLICY-MASTER-FILE",
      type: "file",
      modernizationConcern:
        "Fixed-width input contract must be preserved or explicitly versioned for upstream policy administration systems.",
      evidenceRefs: ["EV-006"]
    },
    {
      name: "PAYMENT-OUTBOUND-FILE",
      type: "file",
      modernizationConcern:
        "Downstream payment system depends on current field order, encoding, and nightly delivery timing.",
      evidenceRefs: ["EV-007"]
    },
    {
      name: "CA7 nightly schedule",
      type: "scheduler",
      modernizationConcern:
        "Batch completion window and restart behavior must be mapped before cloud or service-based migration.",
      evidenceRefs: []
    },
    {
      name: "Claims Operations SME",
      type: "team",
      modernizationConcern:
        "Exception handling and manual review thresholds require business validation before implementation.",
      evidenceRefs: []
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
      evidenceRefs: ["EV-002", "EV-008"],
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
      evidenceRefs: ["EV-006", "EV-007"],
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
      evidenceRefs: ["EV-007"],
      validationStatus: "sme_required"
    }
  ],
  smeValidationChecklist: [
    {
      id: "SME-001",
      title: "Validate high-value claim threshold",
      ownerRole: "Claims Operations SME",
      status: "sme_required",
      evidenceRefs: ["EV-002", "EV-008"],
      checklist: [
        "Confirm current threshold value is $50,000",
        "Confirm threshold has not changed operationally",
        "Document approval or updated value"
      ]
    },
    {
      id: "SME-002",
      title: "Confirm exception handling ownership",
      ownerRole: "Claims Operations SME",
      status: "sme_required",
      evidenceRefs: ["EV-004"],
      checklist: [
        "Identify team consuming the exception file",
        "Confirm exception codes are still current",
        "Document SLA for exception processing"
      ]
    },
    {
      id: "SME-003",
      title: "Map downstream payment file consumers",
      ownerRole: "Solution Architect",
      status: "sme_required",
      evidenceRefs: ["EV-007"],
      checklist: [
        "Enumerate all systems reading PAYMENT-OUTBOUND-FILE",
        "Confirm field layout contract",
        "Assess impact of any layout change"
      ]
    }
  ],
  toolTrace: [
    {
      tool: "legacy.assess_module",
      input: "claims-batch",
      outputSummary: "assessed module risk.",
      evidenceProduced: ["EV-001", "EV-002", "EV-003", "EV-004", "EV-005", "EV-006", "EV-007", "EV-008"]
    },
    {
      tool: "legacy.extract_rules",
      input: "CLAIMS-BATCH",
      outputSummary: "extracted business rules.",
      evidenceProduced: ["EV-001", "EV-002", "EV-003", "EV-004"]
    },
    {
      tool: "legacy.create_plan",
      input: "CLAIMS-BATCH",
      outputSummary: "prepared migration work packages.",
      evidenceProduced: ["EV-006", "EV-007", "EV-008"]
    }
  ]
};
