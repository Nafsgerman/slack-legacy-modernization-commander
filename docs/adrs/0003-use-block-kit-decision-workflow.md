# ADR 0003: Use Block Kit For Decision Workflow Output

## Status

Accepted

## Context

A plain text modernization report is readable but does not provide the fast scanning structure expected inside Slack.

## Decision

Render the Slack response with Block Kit sections for module metadata, risk decision, evidence-backed rules, dependencies, migration path, work packages, SME validation, evidence preview, and MCP trace visibility.

## Consequences

- Slack output is easier to scan in a real channel workflow.
- Plain text remains available as fallback text for Slack clients.
- Tests assert structural sections rather than fragile full snapshots.
