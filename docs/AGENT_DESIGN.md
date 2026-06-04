# Agent Design

## Goal

Slack Incident Commander is a Slack-native incident coordination agent for one MVP workflow: triaging a suspicious Slack OAuth activity alert and producing an evidence-grounded incident brief.

The current implementation is intentionally narrow. It is designed to show clean agent architecture, deterministic tool use, Slack-native response design, and human-approved incident coordination.

## Current MVP Boundary

The MVP uses deterministic synthetic tools and fixture data. It does not ingest real customer telemetry, revoke tokens, suspend users, open production tickets, or perform autonomous containment.

MCP is a future production path. The current code uses in-process TypeScript tool functions under `src/tools/`.

## Agent Flow

1. Slack command handler receives `/incident triage suspicious-oauth`.
2. The handler runs the local demo workflow.
3. `AlertInput` is loaded from synthetic fixtures.
4. The orchestrator gathers context through deterministic tools.
5. Tool outputs are combined into a `ContextBundle`.
6. Triage logic scores severity and confidence.
7. The workflow emits an `IncidentBrief`.
8. The renderer formats the brief for Slack and plain text fallback.

## Core Types

### AlertInput

Normalized alert payload for the workflow. The demo alert includes actor, app, IP, geography, requested scopes, touched channels, and raw detector signals.

### ContextBundle

Tool-gathered context for the alert. The current bundle can include user risk, app install metadata, audit events, runbook guidance, and tool traces.

### IncidentBrief

Final response model rendered to Slack. It includes severity, confidence, status, summary, key facts, recommended tasks, timeline, stakeholder update, and `ToolTrace` records.

### ToolTrace

Audit-friendly record of each deterministic tool call. It captures tool name, input, status, timestamp, and a short result summary.

## Deterministic Tool Design

Current tools are local, read-only, and synthetic:

- `lookup_user_risk`
- `lookup_app_install`
- `search_audit_events`
- `get_runbook`

Each tool returns a structured value plus `ToolTrace`. This keeps the demo repeatable and makes it clear which facts came from which context source.

## Incident State Model

The current incident state is simple:

```text
AlertInput -> ContextBundle -> IncidentBrief(status="triaged")
```

The type model allows `triaged`, `contained`, and `monitoring`, but the MVP only produces `triaged`. Future production work should make state transitions explicit and durable.

## Human-in-the-Loop Model

The agent recommends containment and investigation actions. A human responder must approve and execute those actions.

Current examples such as revoking an OAuth token, suspending an account, or notifying a business owner are recommendations only. The app does not perform those actions.

## Current Gaps

- No formal `EvidenceObject` type yet.
- No durable incident store yet.
- No MCP server implementation yet.
- No real Slack audit log, identity provider, SIEM, or ticketing integration yet.
- No autonomous containment actions by design.

## Production Path

A production version should replace synthetic tools with authorized integrations, add durable incident state, introduce a formal evidence model, expose tools through MCP or equivalent service boundaries, enforce role-based approvals, and persist an immutable audit trail for every recommendation and action.
