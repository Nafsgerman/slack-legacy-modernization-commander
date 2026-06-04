# Architecture

## Layers

    Slack slash command
        ↓
    src/app/slack-app.ts
        ↓
    src/domain/orchestrator.ts
        ↓
    LegacyAnalysisClient adapter boundary
        ↓
    deterministic fixtures for MVP

## Current Implementation

The current MVP is intentionally deterministic.

The command `/legacy assess claims-batch` returns a known modernization assessment for a synthetic COBOL module called CLAIMS-BATCH.

This makes the demo reliable and easy to judge while preserving the architecture needed for future real integrations.

## Future Integrations

The adapter boundary can later connect to:

- Claude or another LLM
- Legacy-code analysis backend
- COBOL/Assembler/PL/I parsing tools
- Jira or Linear
- Enterprise architecture repositories
- Dependency mapping systems
- Knowledge bases and SME approval workflows

## Non-Goals

The MVP does not perform production-grade legacy-code analysis.

The MVP does not connect to live customer systems.

The MVP does not create tickets automatically.

The goal is to show the agentic workflow and the Slack-native modernization operating surface.
