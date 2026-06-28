Legacy Modernization Commander

Slack-native command center for enterprise legacy modernization teams.

Legacy Modernization Commander turns a legacy system module into a business-readable modernization assessment directly inside Slack. It helps transformation teams understand what a legacy module does, which business rules it contains, where migration risk lives, what SMEs need to validate, and which Jira-ready work packages should move next.

This project is built for the Slack Agent Builder Challenge as a focused, portfolio-grade agentic workflow demo.

Quick Links

* Demo script
* Architecture diagram
* Architecture notes
* Slack setup

Demo Command

/legacy assess claims-batch

The command returns a structured modernization assessment for a synthetic COBOL claims batch module.

Why This Exists

Legacy modernization is not only a code-conversion problem.

In real enterprise programs, the hard part is coordination across engineers, architects, business SMEs, compliance, delivery managers, product owners, and downstream system teams. Modernization work gets blocked when business rules are hidden in code, dependencies are unclear, and delivery teams do not have a shared operating surface.

Legacy Modernization Commander uses Slack as that operating surface.

What the MVP Shows

The current MVP demonstrates one polished vertical slice:

* COBOL module assessment
* Business-purpose summary
* Migration-risk analysis
* Business-rule extraction with confidence, validation status, and evidence refs
* Dependency mapping with evidence refs
* SME review questions
* SME validation checklist
* Recommended migration path
* Jira-ready modernization work packages with traceability
* Real MCP-backed tool-call/audit summary
* Clean adapter boundary for future Claude or backend integration

MCP Integration

Legacy Modernization Commander uses MCP server integration for its modernization tool layer.

The local MCP server exposes three tools:

legacy.assess_module
legacy.extract_rules
legacy.create_plan

The Slack workflow calls the MCP-backed analysis client, which invokes these tools and assembles the modernization assessment from real MCP tool results.

The demo data is deterministic for reliability, but the MCP execution path and audit trace are real.

Traceability Model

Every high-impact decision object in the demo points back to an evidence catalog:

* modernization risk includes evidence refs
* each business rule includes evidence refs, confidence, and validation status
* each work package includes evidence refs and validation status
* SME validation checklist items include evidence refs
* MCP trace entries include trace IDs, status, and evidence refs

The fixture evidence uses `synthetic://` locations so reviewers can distinguish demo evidence from live enterprise artifacts.

Demo Module

The implemented demo module is:

CLAIMS-BATCH
Language: COBOL
Platform: z/OS batch
Domain: insurance claims adjudication

Current Status

Working TypeScript/Node MVP with local Slack Socket Mode integration and MCP-backed modernization tools.

The MVP uses deterministic fixtures rather than live production mainframe or enterprise-system integrations. This keeps the demo reliable, reviewable, and safe while showing the intended agent workflow, Slack-native user experience, and MCP-backed tool boundary.

See:

* `docs/EVALUATION.md`
* `docs/LIMITATIONS.md`
* `docs/OBSERVABILITY.md`
* `docs/adrs/`

Architecture Principle

This repository is the Slack workflow-orchestration layer.

It is intentionally not tightly coupled to a specific COBOL parser, LLM provider, ticketing tool, or modernization backend. The domain layer exposes an adapter boundary so a future implementation can connect to Claude, a legacy-code analysis service, Jira, or a broader modernization platform.

Core adapter interface:

export interface LegacyAnalysisClient {
  assessModule(moduleId: string): Promise<ModernizationAssessment>;
  extractRules(moduleId: string): Promise<BusinessRuleReport>;
  createModernizationPlan(moduleId: string): Promise<ModernizationPlan>;
}

For the hackathon MVP, the MCP tools are backed by deterministic local fixtures for reliable demo behavior.

Repository Layout

docs/          Product, architecture, demo, and submission notes
slack/         Slack app manifest and configuration
src/app/       Slack app entry points and Slack rendering
src/domain/    Modernization assessment types and orchestration logic
src/demo/      Synthetic legacy modernization fixtures
src/mcp/       MCP server and modernization tool implementations
tests/         Unit and behavior tests

Development

Install dependencies:

npm install

Run the deterministic local demo:

npm run demo

Run tests:

npm test

Run the local MCP server:

npm run mcp:server

Run the Slack Socket Mode app locally:

npm run slack:dev

Required local environment variables:

SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=...
SLACK_APP_TOKEN=xapp-...
PORT=3000
NODE_ENV=development

Use .env.example as the local template. Do not commit local .env files.

Local Slack MVP Test

The Slack Socket Mode MVP has been tested locally with the slash command:

/legacy assess claims-batch

The command returns a Slack-native modernization assessment for CLAIMS-BATCH, including risk, confidence, validation status, business rules, critical dependencies, SME validation checklist, recommended migration path, Jira-ready work packages, evidence refs, and a live MCP tool-call audit summary.

The same command has been tested successfully in both Slack desktop and Slack mobile.

Demo Story

A transformation lead, architect, or delivery manager types:

/legacy assess claims-batch

The agent responds with a concise command-center view:

1. What this legacy module does
2. Why modernization is risky
3. Which business rules were detected
4. Which dependencies must be protected
5. Which SME questions block safe migration
6. What the recommended migration path is
7. Which Jira-ready work packages should be created
8. Which MCP tools were called to assemble the assessment

Non-Goals for the MVP

The MVP does not claim to perform full production-grade COBOL, Assembler, or Smalltalk analysis.

It does not connect to live enterprise systems.

It does not create Jira tickets yet.

It does not call Claude or any other model API.

Those are future integrations. The current focus is the agentic workflow, Slack-native interaction model, MCP-backed tool boundary, modernization assessment shape, and clean adapter boundary.

License

MIT
