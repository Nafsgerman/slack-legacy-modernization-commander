# Security Model

## Scope

This document describes the MVP security posture for Slack Incident Commander.

The current implementation is a local hackathon demo using synthetic incident data. It should not be treated as production incident response software.

## Data Model

The MVP uses synthetic fixtures under `src/demo/fixtures.ts`.

No real customer logs, Slack audit exports, identity provider records, secrets, or evidence files should be committed to the repository.

## Secrets

Slack credentials belong in `.env`, which is ignored by Git.

Required variables are documented in `.env.example`:

- `SLACK_BOT_TOKEN`
- `SLACK_SIGNING_SECRET`
- `SLACK_APP_TOKEN`
- `PORT`
- `NODE_ENV`

## Trust Boundaries

Current MVP boundaries:

- Slack workspace and slash command surface.
- Local Node.js app running Slack Bolt in Socket Mode.
- Synthetic fixture data.
- In-process deterministic tool functions.
- Slack response renderer.

MCP is not implemented yet. A future MCP server would become a separate trust boundary and should have explicit auth, logging, input validation, and least-privilege tool access.

## Tool Safety

Current tools are read-only and deterministic. They return synthetic context and `ToolTrace` metadata.

The app does not modify Slack workspace state, revoke tokens, suspend users, delete files, change channel permissions, or contact external systems.

## Human Approval

Containment actions are recommendations requiring human approval.

Examples:

- revoke a suspicious OAuth token,
- review or suspend a user account,
- preserve audit logs,
- notify a business owner.

The MVP can suggest these actions, but a human operator must perform them through the appropriate administrative system.

## Evidence Grounding

Incident claims should be traceable to existing workflow objects:

- `AlertInput`
- `ContextBundle`
- `AuditEvent`
- `UserRisk`
- `AppInstall`
- `Runbook`
- `ToolTrace`

There is no formal `EvidenceObject` type yet. Until one exists, docs, tests, and demo narration should avoid implying a stronger evidence system than the code implements.

## Known Gaps

- No durable audit log beyond runtime output and `ToolTrace`.
- No per-user authorization model.
- No tenant isolation model.
- No production secrets manager integration.
- No Slack Enterprise audit log integration.
- No rate limiting or abuse controls around command usage.
- No formal evidence object schema.

## Production Requirements

Before production use, the system should add:

- least-privilege Slack OAuth scopes,
- role-based authorization for incident actions,
- durable incident and evidence storage,
- immutable audit logging,
- explicit human approval gates,
- structured redaction for sensitive data,
- secure secret management,
- integration-specific rate limits and retries,
- monitoring for tool failures and unexpected outputs.
