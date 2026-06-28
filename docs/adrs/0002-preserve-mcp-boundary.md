# ADR 0002: Preserve MCP Client/Server Boundary

## Status

Accepted

## Context

The Slack app should remain a workflow orchestration layer. Legacy modernization may later require many specialized tools, including analyzers, dependency mappers, ticketing systems, and approval systems.

## Decision

Keep the MCP server/client architecture real. The domain client spawns the MCP server over stdio and calls registered tools to assemble the assessment.

## Consequences

- The demo proves a real tool boundary instead of direct in-process fixture calls.
- Tool traces can be shown in Slack.
- Future implementations can replace tool internals without rewriting Slack command handling.
- The current MCP tools still use deterministic fixtures and should not be described as production analyzers.
