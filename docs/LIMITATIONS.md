# Limitations

## Current State

Legacy Modernization Commander is a working MCP-backed Slack demo using deterministic fixture data. It is designed to show the workflow shape, Slack UX, traceability model, and adapter boundary for future integrations.

## Explicit Limitations

- The demo does not analyze live COBOL, JCL, copybooks, databases, schedulers, or file systems.
- The demo does not call Claude or any other LLM API.
- The demo does not create Jira tickets.
- The demo does not connect to production Slack workspaces beyond local Socket Mode testing.
- The demo does not claim production readiness.
- The evidence catalog is synthetic and clearly labeled with `synthetic://` locations.
- Confidence values are fixture metadata, not statistical measurements.
- SME validation statuses are workflow markers, not completed approvals.
- MCP traces prove the client/server tool path is real, not that the underlying fixture facts came from live tools.

## Safe Interpretation

Treat every modernization output as a decision-support artifact. It should guide review and planning, not authorize migration by itself.

Before production use, a team would need:

- real legacy-code ingestion and parsing
- source-controlled evidence capture
- authenticated enterprise integrations
- human approval workflows
- audit retention policies
- security review
- privacy and compliance review
- end-to-end reconciliation against real system behavior

## Why Deterministic Fixtures Are Used

Deterministic fixtures keep the hackathon demo:

- repeatable for judges and reviewers
- safe to run without customer data
- testable in CI
- focused on workflow quality and MCP architecture

The architecture intentionally preserves a `LegacyAnalysisClient` boundary so a real analyzer or model-backed system can replace the fixture-backed MCP tools later.
