# MCP Tool Catalog

## Purpose

Legacy Modernization Commander uses MCP as the boundary between the Slack workflow and modernization analysis capabilities.

The current implementation uses a local MCP server with deterministic fixtures. This keeps the hackathon demo reliable while still exercising a real MCP client/server path.

## Why MCP Exists in This Repo

Legacy modernization work can involve many specialized systems: code analyzers, dependency mappers, rule extractors, ticketing tools, enterprise architecture repositories, and approval workflows.

MCP gives the Slack app a typed tool boundary so the Slack UX does not need to know whether an assessment came from a local fixture, a static analyzer, a model-backed workflow, or a future enterprise backend.

In this MVP, the backend is intentionally local and deterministic.

## Implemented Tools

### `legacy.assess_module`

Purpose:

Returns a module-level modernization assessment for a known synthetic module.

Input:

- `moduleId: string`

Implemented demo module:

- `claims-batch`

Output includes:

- module identity
- business purpose
- risk level
- dependencies
- migration risks
- validation status
- evidence references
- evidence catalog

Evidence role:

This tool produces or forwards evidence references used by downstream decision objects.

### `legacy.extract_rules`

Purpose:

Extracts business-readable rules from the synthetic legacy module fixture.

Input:

- `moduleId: string`

Output includes:

- business rules
- rule descriptions
- confidence metadata
- validation status
- evidence references
- SME validation needs

Evidence role:

This tool returns rule-level evidence references so reviewers can see which synthetic source snippets and domain facts support each rule.

### `legacy.create_plan`

Purpose:

Creates modernization work packages from the assessment and rule context.

Input:

- `moduleId: string`

Output includes:

- recommended work packages
- migration sequencing
- risk-aware next actions
- validation status
- evidence references

Evidence role:

This tool connects proposed work packages and migration steps back to the same evidence catalog used by the assessment and rules.

## Tool Trace

Each tool call is represented in the assessment trace with:

- tool name
- input summary
- output summary
- evidence references, where relevant

The trace is intentionally visible in Slack output so judges and reviewers can see that the response was assembled through the MCP-backed workflow rather than a single opaque text blob.

## Slack Orchestration

The Slack command handler receives:

```text
/legacy assess claims-batch
```

The domain orchestrator calls the MCP-backed analysis client, which invokes:

```text
legacy.assess_module
legacy.extract_rules
legacy.create_plan
```

The returned typed results are assembled into a modernization assessment and rendered through Slack Block Kit. `npm run demo` renders the same assessment as plain text for reviewers who do not install Slack.

## Current Boundary

Implemented:

- Local MCP server
- Local MCP client
- Typed tool results
- Deterministic fixture-backed outputs
- Visible tool trace

Not implemented:

- Live mainframe connection
- Production code scanner
- External LLM tool execution
- Jira ticket creation
- Production audit persistence
