# Product Brief

## Problem

Incident response work often starts in Slack, but the facts are scattered across alert payloads, audit logs, identity tools, runbooks, and human messages. The incident commander role becomes a manual coordination bottleneck: summarize the alert, decide severity, ask the same context questions, assign work, post updates, and write the postmortem.

## Solution

Slack Incident Commander is a Slack-native AI agent that turns an incident alert into a coordinated response workflow.

It does not replace responders. It acts as the structured incident coordinator:

- extracts key facts from an alert,
- gathers context through tools,
- proposes severity and confidence,
- keeps a timeline,
- recommends next actions,
- assigns responder tasks,
- drafts stakeholder updates,
- produces a postmortem.

## Primary User

- Security operations lead
- SRE incident commander
- IT operations manager
- DFIR analyst coordinating a response

## Demo Incident

Suspicious Slack OAuth activity:

- A newly installed OAuth app requests broad scopes.
- The install comes from an unusual IP and geography.
- The app touches sensitive channels shortly after installation.
- The user has recent risky login signals.

The agent should triage the incident and produce a concise, evidence-grounded response plan.

## Differentiators

- Slack is the command surface, not just a notification sink.
- Tool results are structured and auditable.
- The workflow is incident-command focused, not generic chat.
- Synthetic demo data makes the behavior deterministic and reviewable.
- The output is useful to both responders and executives.

## Non-Goals For MVP

- Real SIEM ingestion.
- Full case management.
- Production identity provider integration.
- Marketplace submission before the core demo is excellent.
- Large-scale Slack message indexing.
