# Evaluation

## Purpose

This project is evaluated as a deterministic portfolio demo of a Slack-native modernization decision workflow. It does not evaluate production COBOL parsing accuracy, live enterprise dependency discovery, or automated ticket creation.

## Evaluation Scope

The implemented workflow is:

```text
/legacy assess claims-batch
```

The workflow should return a decision-ready modernization assessment for the synthetic `CLAIMS-BATCH` module with:

- module identity and modernization risk
- business rules with confidence and evidence references
- dependency concerns with evidence references
- recommended migration path
- work packages prepared for future ticket creation, with evidence references
- SME validation checklist
- MCP trace visibility

## Deterministic Checks

Run:

```bash
npm test
```

The test suite verifies:

- the demo module can be assessed through the default MCP-backed workflow
- risk, business rules, work packages, and SME checklist items have valid evidence references
- Slack Block Kit output contains decision workflow sections
- MCP traces expose trace IDs, status, and evidence references
- unknown demo modules fail explicitly
- malformed MCP payloads fail with clear errors

## Manual Slack Evaluation

Run the app locally:

```bash
npm run slack:dev
```

In Slack, run:

```text
/legacy assess claims-batch
```

Pass criteria:

- response is ephemeral
- header and metadata are visible at the top
- risk, confidence, validation state, and evidence IDs are visible
- business rules and work packages show traceable evidence refs
- SME validation checklist appears before implementation-oriented next steps
- MCP trace section lists the tools used to assemble the assessment

## Demo Quality Bar

The demo is successful when a reviewer can understand:

1. what the legacy module does
2. why migration is risky
3. which extracted facts are evidence-backed
4. which decisions still require SME validation
5. which work packages can be created next
6. which MCP tools assembled the result

## Non-Evaluation Areas

This repo does not currently evaluate:

- live source-code parsing
- live mainframe connectivity
- model-generated rule extraction
- Jira API writes
- production authorization or data-retention controls
- accuracy against real customer systems
