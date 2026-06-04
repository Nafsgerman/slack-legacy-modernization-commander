# Slack Incident Commander

A Slack-native incident response agent for security and operations teams.

Slack Incident Commander helps responders triage alerts, gather context through tools, coordinate tasks, maintain a timeline, and draft incident updates from inside Slack.

This repository is being built for the Slack Agent Builder Challenge as a portfolio-grade agentic operations project.

## Current Status

Working TypeScript/Node MVP with a local Slack Socket Mode integration.

The first implemented workflow is a synthetic security incident involving suspicious Slack OAuth activity. The MVP uses deterministic local fixtures and tools to demonstrate agent workflow design without requiring production security-system access.

Start with [docs/START_HERE.md](docs/START_HERE.md) and [docs/BRAINSTORMING.md](docs/BRAINSTORMING.md).

## Core Workflow

1. A responder invokes the agent with an incident alert.
2. The agent normalizes and triages the alert.
3. Tool calls gather identity, audit, and event context.
4. The agent posts an incident brief with severity, confidence, affected assets, and next actions.
5. The agent tracks responder tasks and timeline events.
6. The agent drafts stakeholder updates and a postmortem.

## Repository Layout

```text
docs/          Product, architecture, demo, and submission notes
slack/         Slack app manifest and configuration
src/app/       Slack app entry points and interaction handlers
src/domain/    Incident domain model and orchestration logic
src/tools/     Deterministic local tools used by the MVP
src/demo/      Synthetic demo scenarios
tests/         Unit and behavior tests
```

Planned production extensions include an MCP tool adapter, durable incident storage, and external integrations for Slack Audit Logs, identity providers, SIEM, and ticketing systems.

## Development

The implementation uses TypeScript and Node.js.

Install dependencies:

```bash
npm install
```

Run the deterministic local demo:

```bash
npm run demo
```

Run tests:

```bash
npm test
```

Run the Slack Socket Mode app locally:

```bash
npm run slack:dev
```

Required local environment variables:

```env
SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=...
SLACK_APP_TOKEN=xapp-...
PORT=3000
NODE_ENV=development
```

Do not commit local `.env` files.

## Local Slack MVP Test

The Slack Socket Mode MVP has been tested locally with the slash command:

```bash
/incident triage suspicious-oauth
```

The command returns a structured incident brief for a suspicious Slack OAuth app scenario, including severity, incident ID, confidence, tool-call count, summary, and recommended response actions.

This MVP uses deterministic demo fixtures rather than live production security integrations. The architecture is intentionally scoped to demonstrate the incident-command workflow, agent boundaries, and Slack-native response surface without claiming production readiness.

## Slack App

The initial Slack app manifest draft is in `slack/manifest.yaml`.

Slack setup instructions are in [docs/SLACK_SETUP.md](docs/SLACK_SETUP.md).

## Design Docs

- [Agent design](docs/AGENT_DESIGN.md)
- [Security model](docs/SECURITY_MODEL.md)

## License

MIT