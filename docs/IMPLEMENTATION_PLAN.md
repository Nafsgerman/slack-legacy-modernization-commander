# Implementation Plan

## Current Status

The MVP is implemented and running as a Slack Socket Mode app.

The command is:

    /legacy assess claims-batch

The workflow now uses a real MCP server integration for its modernization tool layer.

## Completed

- [x] Create Slack app scaffold
- [x] Implement `/legacy assess claims-batch`
- [x] Build modernization domain model
- [x] Add deterministic CLAIMS-BATCH demo fixture
- [x] Render concise Slack Block Kit assessment
- [x] Add plain-text demo output
- [x] Add tests
- [x] Add GitHub Actions CI
- [x] Rename and clean incident-era docs
- [x] Add MCP server integration
- [x] Add MCP-backed legacy analysis client
- [x] Replace placeholder trace with real MCP tool trace
- [x] Test MCP client path in CI

## MCP Tools Implemented

    legacy.assess_module
    legacy.extract_rules
    legacy.create_plan

## Next Engineering Milestones

1. Add architecture diagram.
2. Add README screenshot.
3. Improve Slack UX with a more compact executive summary.
4. Add optional `/legacy rules claims-batch`.
5. Add optional `/legacy tickets claims-batch` future integration after approvals and ticketing credentials exist.
6. Add optional LLM reasoning over MCP tool results behind the existing adapter boundary.
7. Add Devpost submission materials.

## Quality Bar

This repo should remain portfolio-grade:

- Real implemented boundaries, not fake claims
- Deterministic and reliable demo
- Tests for critical behavior
- CI green
- Honest non-goals
- Clean documentation
