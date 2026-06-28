# Reviewer Guide

## What to Review First

1. [README.md](../README.md)
2. [docs/DEMO_OUTPUT.md](DEMO_OUTPUT.md)
3. [docs/MCP_TOOL_CATALOG.md](MCP_TOOL_CATALOG.md)
4. [docs/TRACEABILITY_MODEL.md](TRACEABILITY_MODEL.md)
5. [docs/EVALUATION.md](EVALUATION.md)
6. [docs/LIMITATIONS.md](LIMITATIONS.md)
7. [tests/](../tests)

## Fast Path

```bash
npm ci
npm run ci
npm run demo
```

`npm run demo` prints the deterministic assessment without requiring a Slack workspace.

## What the Demo Shows

The demo command is:

```text
/legacy assess claims-batch
```

It returns a Slack-native modernization assessment for a synthetic COBOL claims batch module.

The important review points are:

- Slack-native decision brief design
- business-readable modernization output
- MCP-backed tool boundary
- visible tool trace
- evidence-backed claims
- deterministic testable behavior
- honest limitation boundaries

## What Makes This More Than a Mockup

The Slack response is not only static copy.

The architecture includes:

- a Slack app layer
- a domain orchestration layer
- a typed analysis client boundary
- a local MCP server
- MCP tools
- deterministic fixtures
- traceability tests

The demo data is deterministic, but the MCP tool-call boundary is real.

## What Not to Expect

This MVP does not:

- connect to a live mainframe
- parse arbitrary COBOL repositories
- call Claude or another LLM
- create Jira tickets
- deploy to production
- implement enterprise identity or tenant controls

Those are future integrations behind the existing architecture boundary.
