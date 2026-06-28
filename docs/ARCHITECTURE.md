# Architecture

## Overview

Legacy Modernization Commander is a Slack-native command center for enterprise legacy modernization teams.

The MVP uses Slack Socket Mode, a slash command, and a real MCP server integration to turn a legacy module identifier into a modernization assessment.

## Runtime Flow

    Slack /legacy command
        ↓
    src/app/slack-app.ts
        ↓
    src/domain/orchestrator.ts
        ↓
    src/domain/mcp-legacy-analysis-client.ts
        ↓
    MCP client over stdio
        ↓
    src/mcp/server.ts
        ↓
    MCP modernization tools
        ↓
    deterministic demo fixtures

## MCP Tools

The MCP server exposes three modernization tools:

    legacy.assess_module
    legacy.extract_rules
    legacy.create_plan

These tools are backed by deterministic fixture data for the hackathon demo, but the MCP client/server path is real and tested.

## Why MCP Fits This Product

Legacy modernization workflows depend on many specialized tools: code analyzers, dependency mappers, rule extractors, ticketing systems, enterprise architecture repositories, and SME approval systems.

MCP gives the Slack agent a clean way to call those tools without tightly coupling the Slack app to any single backend or vendor.

The architecture intentionally separates Slack interaction, domain orchestration, MCP tool execution, and demo evidence fixtures. This keeps the MVP honest and reviewable: Slack shows the decision brief, the domain layer assembles typed modernization outputs, MCP provides the tool boundary, and deterministic fixtures make the result repeatable under CI. Future integrations such as Claude, Jira, production code analysis, or enterprise audit storage can be added behind these boundaries without changing the core Slack user experience.

## Current Implementation

Implemented:

- Slack Socket Mode app
- `/legacy assess claims-batch` slash command
- MCP server with modernization tools
- MCP-backed `LegacyAnalysisClient`
- Deterministic CLAIMS-BATCH fixture
- Slack Block Kit renderer
- Plain-text renderer
- Evidence catalog and evidence refs
- Confidence and validation metadata
- SME validation checklist
- Unit tests
- MCP client integration test
- GitHub Actions CI

## Future Integrations

The adapter boundary can later connect to:

- Claude or another LLM
- Real legacy-code analysis backend
- COBOL/Assembler/PL/I parsing tools
- Jira or Linear
- Enterprise architecture repositories
- Dependency mapping systems
- Knowledge bases and SME approval workflows

## Non-Goals

The MVP does not perform production-grade legacy-code analysis.

The MVP does not connect to live customer systems.

The MVP does not create tickets automatically.

The MVP does not call Claude or any other model API.

The goal is to show the agentic workflow, the Slack-native modernization operating surface, and the MCP-backed tool boundary.
