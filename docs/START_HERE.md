# Start Here

## Why These Files Exist

This repository is not just code. It is a portfolio artifact.

For an Anthropic/OpenAI-quality project, the reviewer should see:

- clear product judgment,
- a narrow and polished demo path,
- clean architecture,
- executable code,
- tests,
- documented setup,
- submission readiness,
- evidence that the agent is tool-grounded, not a chatbot wrapper.

The current files support that:

- `PROJECT_CONTEXT.md`: source of truth for future threads.
- `AGENTS.md`: how Codex and Nafees work together.
- `README.md`: public-facing repo entry point.
- `docs/PRODUCT_BRIEF.md`: problem, user, solution, and non-goals.
- `docs/BRAINSTORMING.md`: product brainstorming and decision record.
- `docs/ARCHITECTURE.md`: system design and data flow.
- `docs/IMPLEMENTATION_PLAN.md`: build milestones.
- `docs/DEMO_SCRIPT.md`: 3-minute video shape.
- `slack/manifest.yaml`: initial Slack app configuration.
- `src/`: working TypeScript implementation.
- `tests/`: deterministic behavior tests.

## Beginning Workflow

1. Create and push the GitHub repo.
2. Keep `main` clean and working.
3. Build the local workflow first.
4. Connect the workflow to Slack.
5. Add MCP tool exposure.
6. Polish docs, diagram, and demo.
7. Record and submit.

## Model Guidance

- Medium: docs-only changes, README, brainstorming, checklist updates.
- High: normal engineering work, Slack integration, MCP, tests.
- Very High: final review, difficult debugging, portfolio positioning, submission polish.

## Local Testing Targets

Nafees will test the Slack app:

- on MacBook Air in browser / VS Code environment,
- in Slack desktop or browser,
- on phone using Slack mobile.

The agent must therefore produce Slack messages that are readable on both desktop and mobile.
