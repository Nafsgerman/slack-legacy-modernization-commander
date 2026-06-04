# Brainstorming

## Product Bar

This project should not look like a hackathon toy. It should look like a focused enterprise agent built by a senior engineer who understands incident response, Slack workflows, AI tool use, and production constraints.

The target impression:

"This person can take an ambiguous operational problem, design a narrow agentic workflow, build it cleanly, ground it in tools, and present it in a way a real enterprise team would trust."

## Core Idea

Slack Incident Commander is an AI-assisted incident coordination agent that lives where response already happens: Slack.

It turns an alert into a coordinated workflow:

- triage,
- context gathering,
- containment tasks,
- timeline,
- stakeholder update,
- postmortem.

## Why Slack

Slack is the right hackathon target because:

- the app surface is already there,
- the demo is easy to understand,
- the challenge is explicitly agent-focused,
- Slack mobile testing is natural,
- the product maps to real enterprise workflows,
- MCP/tool integration can be shown clearly.

## Project Candidates Considered

### 1. Generic Company Knowledge Agent

Rejected.

Too common. Hard to stand out. Risks looking like a wrapper around search/chat.

### 2. HR / IT Helpdesk Agent

Rejected for MVP.

Beginner-friendly but less differentiated for Nafees's background. Many entries will likely choose this.

### 3. DFIR/SOC Incident Commander

Chosen.

Best fit for:

- 22 years of IT experience,
- SIFTGuard/DFIR background,
- enterprise credibility,
- Slack as an incident command surface,
- agentic tool use,
- strong demo narrative.

## MVP Demo Scenario

Suspicious Slack OAuth activity.

Why this scenario works:

- It is native to Slack.
- It can be shown entirely inside Slack.
- It is security-relevant without requiring real customer data.
- It uses structured context tools naturally.
- It supports mobile-friendly incident updates.
- It can produce a strong 3-minute demo.

## Demo Story

1. A suspicious OAuth alert appears.
2. The responder invokes Incident Commander.
3. The agent queries tools for user risk, app install details, audit events, and runbook guidance.
4. The agent posts a severity, confidence, key facts, and recommended actions.
5. The agent maintains a timeline.
6. The agent drafts a stakeholder update.
7. The agent generates a postmortem.

## Quality Decisions

### Narrow Scope

One excellent workflow beats five weak workflows.

### Deterministic Tooling

The demo should be repeatable. Synthetic fixtures make the system stable for judging and video recording.

### Tool-Grounded Agent

Every recommendation should be traceable to structured tool output.

### Slack-First UX

Messages must be readable on desktop and mobile. Use concise sections, clear priorities, and short action labels.

### Enterprise Tone

No gimmicks. No cute bot personality. The agent should sound calm, precise, and operationally useful.

## What Makes This Portfolio-Grade

- Clear product judgment.
- Realistic enterprise workflow.
- Clean typed implementation.
- Evidence-grounded incident reasoning.
- Tests for deterministic behavior.
- Slack-native UX.
- MCP-ready architecture.
- Strong README and architecture diagram.
- Demo script mapped to hackathon criteria.

## Future Expansion Ideas

Only after the core demo is excellent:

- PagerDuty-style incident import.
- Splunk/SIEM alert adapter.
- Real-Time Search API integration if available.
- Slack Canvas postmortem export.
- Incident timeline persistence.
- Multi-incident dashboard.
- Human approval gates for containment.
