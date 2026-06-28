# Observability

## Overview

The current observability model is intentionally lightweight and deterministic. It focuses on trace visibility inside the assessment output rather than production telemetry.

## MCP Trace Model

Each assembled assessment includes `toolTrace` entries with:

- MCP tool name
- input summary
- output summary
- optional latency
- optional produced evidence references

The default workflow calls:

```text
legacy.assess_module
legacy.extract_rules
legacy.create_plan
```

These traces are rendered in both plain text and Slack Block Kit output.

## Evidence Traceability

The assessment includes an `evidenceCatalog` with structured evidence references. Business rules, modernization risk, dependencies, work packages, SME checklist items, and MCP trace entries reference evidence IDs from that catalog.

Current tests verify that high-impact decision objects use valid evidence references.

## Runtime Logs

Slack app logging is intentionally minimal:

- unhandled slash command text is logged through the Bolt logger
- app-level errors are written to stderr

No secrets, Slack tokens, or customer data should be logged.

## Failure Visibility

The MCP client fails explicitly when:

- a tool result does not contain text content
- a tool result contains malformed JSON
- an unknown deterministic demo module is requested

These are covered by tests.

## Future Production Telemetry

A production version should add:

- request correlation IDs across Slack, orchestration, MCP, and backend tools
- structured JSON logs
- latency metrics per tool call
- error-rate metrics by tool and module
- audit retention for evidence snapshots
- redaction for secrets and regulated data
- Slack response delivery metrics

Those capabilities are not implemented in this demo.
