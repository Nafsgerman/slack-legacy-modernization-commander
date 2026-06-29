# Demo Output

This is representative output for the deterministic local demo command:

```text
/legacy assess claims-batch
```

The exact Slack formatting is rendered through Block Kit in the running Slack app. This document gives reviewers a readable text equivalent.

The demo uses synthetic fixture data. It does not connect to a live mainframe, create Jira tickets, call Claude, or process customer data.

The Slack card includes workflow actions:

- Mark reviewed
- SME follow-up
- Draft ticket
- Show trace

`Mark reviewed` and `SME follow-up` update the original Slack assessment card in place for the current demo session. `Draft ticket` and `Show trace` remain compact ephemeral Block Kit responses.

## Representative Text Output

```text
Legacy Modernization Commander

System/module: CLAIMS-BATCH
Language: COBOL
Platform: z/OS batch
Assessment: LMC-CLAIMS-BATCH-2026-0001
Generated UTC: 2026-01-15T12:00:00.000Z
Overall confidence: medium
Validation status: SME review required

Business purpose:
Nightly claims adjudication batch that validates submitted insurance claims, applies eligibility and policy rules, calculates payable amounts, and produces downstream payment and exception files.

Modernization risk: HIGH (medium, SME review required)
Evidence: EV-001 Coverage-period branch, EV-002 High-value review branch, EV-003 Prior-claims lookup, EV-004 Exception file write, EV-005 Payment outbound contract, EV-006 CA7 nightly batch window, EV-007 Claims Operations validation gap
The module sits on the critical payment path, mixes business rules with file and database access, and has several unresolved SME questions before safe migration.

Risk drivers:
- Payment-impacting business logic
- Nightly batch dependency with strict completion window
- Shared copybooks used by multiple claims programs
- Unclear ownership of exception handling rules
- Downstream payment file contract must remain stable during migration

Extracted business rules:
1. BR-001: Claim eligibility window
   Validation status: machine_inferred
   Evidence: EV-001 Coverage-period branch
   Claims are eligible for automated processing only when the service date falls within the active policy coverage period.
2. BR-002: High-value claim review
   Validation status: SME review required
   Evidence: EV-002 High-value review branch, EV-007 Claims Operations validation gap
   Claims above the configured high-value threshold are routed to manual review instead of straight-through payment.
3. BR-003: Duplicate claim suppression
   Validation status: machine_inferred
   Evidence: EV-003 Prior-claims lookup
   Claims with matching member, provider, service date, and procedure code are flagged as possible duplicates.
4. BR-004: Exception file generation
   Validation status: SME review required
   Evidence: EV-004 Exception file write, EV-007 Claims Operations validation gap
   Rejected or incomplete claims are written to an exception file consumed by the operations team the next morning.

Dependencies:
- DB2.CLAIMS_HISTORY [database]
  Evidence: EV-003 Prior-claims lookup
  Used for duplicate detection and prior claim lookup; migration requires read consistency and historical data access.
- POLICY-MASTER-FILE [file]
  Evidence: EV-001 Coverage-period branch
  Fixed-width input contract must be preserved or explicitly versioned for upstream policy administration systems.
- PAYMENT-OUTBOUND-FILE [file]
  Evidence: EV-005 Payment outbound contract
  Downstream payment system depends on current field order, encoding, and nightly delivery timing.
- CA7 nightly schedule [scheduler]
  Evidence: EV-006 CA7 nightly batch window
  Batch completion window and restart behavior must be mapped before cloud or service-based migration.

Unknowns / SME questions:
- Is the high-value review threshold still current, or has it been changed operationally outside the code?
- Which downstream consumers depend on the exact PAYMENT-OUTBOUND-FILE layout?
- What is the required recovery behavior if the batch fails after exception file generation but before payment file delivery?

Recommended migration path:
1. Freeze current CLAIMS-BATCH behavior with golden test cases from production-like historical claim samples.
2. Extract and validate business rules with Claims Operations SMEs before code transformation.
3. Create a parallel-run service that reproduces eligibility, duplicate detection, review routing, and exception generation.
4. Keep existing payment file contract stable while introducing versioned adapters around downstream outputs.
5. Run side-by-side reconciliation for at least two month-end cycles before cutover.

Work packages prepared for future ticket creation:
1. LMC-101 [P0] Create golden test dataset for CLAIMS-BATCH
   Owner role: QA Lead
   Validation status: SME review required
   Evidence: EV-001, EV-002, EV-003, EV-004
2. LMC-102 [P0] Validate extracted claims business rules with SMEs
   Owner role: Business Analyst
   Validation status: SME review required
   Evidence: EV-001, EV-002, EV-003, EV-004, EV-007
3. LMC-103 [P1] Map CLAIMS-BATCH dependencies and file contracts
   Owner role: Solution Architect
   Validation status: SME review required
   Evidence: EV-003, EV-005, EV-006
4. LMC-104 [P1] Design strangler migration plan for claims adjudication
   Owner role: Modernization Architect
   Validation status: SME review required
   Evidence: EV-005, EV-006, EV-007

SME validation checklist:
- Approve extracted business rules
  Evidence: EV-001, EV-002, EV-003, EV-004
- Validate payment and exception file contracts
  Evidence: EV-004, EV-005
- Validate batch recovery behavior
  Evidence: EV-006

Evidence catalog:
- EV-001 [code] Coverage-period branch
- EV-002 [code] High-value review branch
- EV-003 [fixture] Prior-claims lookup
- EV-004 [code] Exception file write
- EV-005 [file_contract] Payment outbound contract
- EV-006 [fixture] CA7 nightly batch window
- EV-007 [sme_note] Claims Operations validation gap

MCP Trace:
The assessment was assembled through the local MCP-backed tool boundary.

- legacy.assess_module
  Output summary: Resolved CLAIMS-BATCH as a COBOL z/OS batch module with high modernization risk.
  Evidence: EV-001, EV-002, EV-003, EV-004, EV-005, EV-006, EV-007
- legacy.extract_rules
  Output summary: Extracted 4 candidate business rules for CLAIMS-BATCH.
  Evidence: EV-001, EV-002, EV-003, EV-004, EV-007
- legacy.create_plan
  Output summary: Generated 4 work packages and 5 migration path steps for CLAIMS-BATCH.
  Evidence: EV-001, EV-002, EV-003, EV-004, EV-005, EV-006, EV-007

Trace status:
- deterministic local fixture
- real MCP client/server execution path
- no live mainframe access
- no Jira ticket created
- no external LLM call
```
