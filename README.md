Legacy Modernization Commander

Slack-native command center for enterprise legacy modernization teams.

## Reviewer Overview

### What It Is

Legacy Modernization Commander turns a legacy system module identifier into a business-readable modernization assessment inside Slack.

The implemented demo workflow is:

```text
/legacy assess claims-batch
```

It returns a Slack-native decision brief for a synthetic COBOL claims adjudication batch module. The brief explains what the module does, where modernization risk lives, which business rules need SME validation, what evidence supports the claims, and which work packages should be prepared for future ticket creation.

### What Works Today

- Slack Socket Mode slash command for `/legacy assess claims-batch`
- TypeScript/Node MVP
- Local MCP server/client integration
- Three MCP tools:
  - `legacy.assess_module`
  - `legacy.extract_rules`
  - `legacy.create_plan`
- Deterministic synthetic `CLAIMS-BATCH` fixture
- Evidence references and evidence catalog
- Validation statuses for modernization outputs
- MCP tool trace rendered in plain text and Slack output
- Tests for determinism, traceability invariants, MCP client behavior, Slack rendering, and unsupported-claim guardrails

### What Is Intentionally Deterministic

The demo module, evidence catalog, business rules, modernization risks, work packages, validation statuses, and MCP tool outputs are deterministic synthetic fixtures. This keeps the hackathon demo reliable, safe to run without customer data, and repeatable under CI.

The MCP client/server path is real. The source data behind the tools is fixture-backed by design.

### What Is Not Claimed

This repository does not claim:

- live mainframe analysis
- a real COBOL parser
- Claude or external LLM execution
- Jira ticket creation
- production auth or tenant isolation
- production telemetry
- production deployment
- customer data processing

### Why Slack + MCP

Slack is the decision surface: modernization teams already coordinate across architects, delivery leads, SMEs, compliance reviewers, and engineering managers there.

MCP is the tool boundary: the Slack workflow can call modernization capabilities without coupling the Slack app to one parser, LLM provider, ticketing system, or backend. In this MVP, the tools are local and deterministic. Future integrations can be added behind the same boundary without rewriting the Slack user experience.

## Quick Links

- [Reviewer Guide](docs/REVIEWER_GUIDE.md)
- [Demo Output](docs/DEMO_OUTPUT.md)
- [MCP Tool Catalog](docs/MCP_TOOL_CATALOG.md)
- [Traceability Model](docs/TRACEABILITY_MODEL.md)
- [Evaluation](docs/EVALUATION.md)
- [Limitations](docs/LIMITATIONS.md)
- [Observability](docs/OBSERVABILITY.md)
- [Public Artifact Checklist](docs/PUBLIC_ARTIFACT_CHECKLIST.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Slack Setup](docs/SLACK_SETUP.md)
- [Demo Script](docs/DEMO_SCRIPT.md)

## Reviewer Fast Path

```bash
npm ci
npm run ci
npm run demo
```

`npm run demo` prints the deterministic local assessment without requiring Slack installation.

## Public Claims Boundary

### Implemented

- Slack Socket Mode slash command for `/legacy assess claims-batch`
- TypeScript/Node MVP
- Local MCP server/client integration
- Three MCP tools:
  - `legacy.assess_module`
  - `legacy.extract_rules`
  - `legacy.create_plan`
- Deterministic synthetic `CLAIMS-BATCH` fixture
- Evidence references and evidence catalog
- Validation statuses
- MCP tool trace rendered in output
- Tests for determinism, traceability invariants, and no fake claims

### Not Implemented

- Live mainframe analysis
- Real COBOL parser
- Claude or external LLM execution path
- Jira ticket creation
- Production auth/tenant model
- Production telemetry
- Production deployment

### Future Integrations

- Claude or another LLM behind the existing adapter boundary
- Real code analysis backend
- Jira/Linear/ServiceNow ticket creation
- Production audit store and metrics
- Enterprise identity and permissions

## Demo Command

```text
/legacy assess claims-batch
```

The command returns a structured modernization assessment for a synthetic COBOL claims batch module.

## Why This Exists

Legacy modernization is not only a code-conversion problem.

In enterprise programs, the hard part is coordination across engineers, architects, business SMEs, compliance, delivery managers, product owners, and downstream system teams. Modernization work gets blocked when business rules are hidden in code, dependencies are unclear, and delivery teams do not have a shared operating surface.

Legacy Modernization Commander uses Slack as that operating surface.

## What the MVP Shows

The current MVP demonstrates one polished vertical slice:

- COBOL module assessment for a deterministic synthetic fixture
- Business-purpose summary
- Migration-risk analysis
- Business-rule extraction with confidence, validation status, and evidence refs
- Dependency mapping with evidence refs
- SME review questions
- SME validation checklist
- Recommended migration path
- Work packages shaped for future ticket creation, with traceability
- Real local MCP client/server tool-call trace
- Clean adapter boundary for future LLM or backend integration

## MCP Integration

Legacy Modernization Commander uses MCP server integration for its modernization tool layer.

The local MCP server exposes three tools:

```text
legacy.assess_module
legacy.extract_rules
legacy.create_plan
```

The Slack workflow calls the MCP-backed analysis client, which invokes these tools and assembles the modernization assessment from MCP tool results.

The demo data is deterministic for reliability, but the MCP execution path and audit trace are real.

## Traceability Model

Every high-impact decision object in the demo points back to an evidence catalog:

- modernization risk includes evidence refs
- each business rule includes evidence refs, confidence, and validation status
- each work package includes evidence refs and validation status
- SME validation checklist items include evidence refs
- MCP trace entries include status and evidence refs

The fixture evidence uses `synthetic://` locations so reviewers can distinguish demo evidence from live enterprise artifacts.

## Demo Module

```text
CLAIMS-BATCH
Language: COBOL
Platform: z/OS batch
Domain: insurance claims adjudication
```

## Current Status

Working TypeScript/Node MVP with local Slack Socket Mode integration and MCP-backed modernization tools.

The MVP uses deterministic fixtures rather than live production mainframe or enterprise-system integrations. This keeps the demo reliable, reviewable, and safe while showing the intended agent workflow, Slack-native user experience, and MCP-backed tool boundary.

## Architecture Principle

This repository is the Slack workflow-orchestration layer.

It is intentionally not tightly coupled to a specific COBOL parser, LLM provider, ticketing tool, or modernization backend. The domain layer exposes an adapter boundary so a future implementation can connect to an LLM, a legacy-code analysis service, Jira/Linear/ServiceNow, or a broader modernization platform.

Core adapter interface:

```ts
export interface LegacyAnalysisClient {
  assessModule(moduleId: string): Promise<ModernizationAssessment>;
  extractRules(moduleId: string): Promise<BusinessRuleReport>;
  createModernizationPlan(moduleId: string): Promise<ModernizationPlan>;
}
```

For the hackathon MVP, the MCP tools are backed by deterministic local fixtures for reliable demo behavior.

## Repository Layout

```text
docs/          Product, architecture, demo, and submission notes
slack/         Slack app manifest and configuration
src/app/       Slack app entry points and Slack rendering
src/domain/    Modernization assessment types and orchestration logic
src/demo/      Synthetic legacy modernization fixtures
src/mcp/       MCP server and modernization tool implementations
tests/         Unit and behavior tests
```

## Development

Install dependencies:

```bash
npm ci
```

Run the deterministic local demo:

```bash
npm run demo
```

Run CI checks:

```bash
npm run ci
```

Run the local MCP server:

```bash
npm run mcp:server
```

Run the Slack Socket Mode app locally:

```bash
npm run slack:dev
```

Required local environment variables:

```bash
SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=...
SLACK_APP_TOKEN=xapp-...
PORT=3000
NODE_ENV=development
```

Use [.env.example](.env.example) as the local template. Do not commit local `.env` files.

## Local Slack MVP Test

The Slack Socket Mode MVP has been tested locally with the slash command:

```text
/legacy assess claims-batch
```

The command returns a Slack-native modernization assessment for `CLAIMS-BATCH`, including risk, confidence, validation status, business rules, critical dependencies, SME validation checklist, recommended migration path, work packages prepared for future ticket creation, evidence refs, and a local MCP tool-call audit summary.

The same command has been tested successfully in both Slack desktop and Slack mobile.

## Demo Story

A transformation lead, architect, or delivery manager types:

```text
/legacy assess claims-batch
```

The agent responds with a concise command-center view:

1. What this legacy module does
2. Why modernization is risky
3. Which business rules were detected
4. Which dependencies must be protected
5. Which SME questions block safe migration
6. What the recommended migration path is
7. Which work packages should be prepared for future ticket creation
8. Which MCP tools were called to assemble the assessment

## Non-Goals for the MVP

The MVP does not claim to perform full production-grade COBOL, Assembler, or Smalltalk analysis.

It does not connect to live enterprise systems.

It does not create Jira tickets.

It does not call Claude or any other model API.

Those are future integrations. The current focus is the agentic workflow, Slack-native interaction model, MCP-backed tool boundary, modernization assessment shape, and clean adapter boundary.

## License

MIT
