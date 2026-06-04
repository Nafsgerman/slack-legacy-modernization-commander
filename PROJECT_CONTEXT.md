# Slack Incident Commander Project Context

## Mission

Build a portfolio-grade Slack-native incident response agent for the Slack Agent Builder Challenge.

The project should demonstrate frontier-lab / FDE-quality product and engineering judgment: a narrow but excellent workflow, clean architecture, deterministic behavior where it matters, thoughtful Slack UX, auditability, and a strong demo story.

## Hackathon

- Platform: Devpost
- Hackathon: Slack Agent Builder Challenge
- Deadline: July 14, 2026 at 02:00 GMT+2
- Internal target: submit-ready well before the public deadline
- Track target: New Slack Agent, with a possible Best UX / Best Technological Implementation angle

## Product Concept

Slack Incident Commander is an AI-assisted incident coordination agent for security, SRE, and IT operations teams.

It helps teams move from alert to coordinated response:

1. Ingest an incident alert in Slack.
2. Triage severity, confidence, and affected systems.
3. Open or update an incident channel/thread.
4. Query tools/MCP-backed context sources.
5. Maintain an evidence-grounded incident timeline.
6. Assign responder actions.
7. Draft stakeholder updates.
8. Generate a final postmortem.

## Quality Bar

- Code should be readable, typed, modular, and testable.
- Agent outputs should be grounded in structured tool results, not pure invention.
- Demo data must be clearly marked as synthetic.
- The product should feel like an enterprise workflow, not a generic chatbot.
- The README, architecture diagram, and demo script should be strong enough for a hiring manager or frontier AI lab reviewer.

## Initial Scope

Build one polished workflow:

An alert about suspicious Slack OAuth activity arrives. The agent triages it, checks synthetic identity/audit/event context through local tools, posts an incident brief, proposes assignments, records timeline entries, and produces an executive-ready summary.

## Submission Requirements

- Text description of features and functionality.
- Demo video around 3 minutes.
- Architecture diagram.
- URL to Slack developer sandbox.
- Access for `slackhack@salesforce.com` and `testing@devpost.com`.
- Public source repository.
- Open source license.
- README with setup and run instructions.

## Working Rules

- Keep the demo path narrow and high quality.
- Avoid overbuilding a SOC platform.
- Prefer deterministic demo data and explicit tool traces.
- Keep all project context in this repository so future threads can resume quickly.
- Codex works as Lead Staff Engineer and owns 85 percent of architecture, implementation, debugging, tests, and exact commands.
- Nafees owns the 15 percent that requires local accounts, secrets, manual setup, testing, deployment clicks, demo recording, and pitching.
- Communication should be direct: exact file paths, exact commands, minimal explanation.
- Recommended model levels: Medium for docs/planning/simple work, High for architecture/code/integrations, Very High for hard debugging/final review/submission polish.
