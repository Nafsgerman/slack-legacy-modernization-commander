# Product Brief: Legacy Modernization Commander

## Product

Legacy Modernization Commander is a Slack-native command center for enterprise legacy modernization teams.

It turns a legacy module into a business-readable modernization assessment with migration risk, extracted business rules, dependencies, SME questions, recommended migration path, and work packages prepared for future ticket creation.

## Problem

Legacy modernization is not only a code-conversion problem.

Enterprise modernization programs are slowed down by hidden business rules, unclear dependencies, missing SME validation, fragmented delivery planning, and weak coordination between engineering and business teams.

## MVP User

A transformation lead, modernization architect, delivery manager, or enterprise engineer working on a legacy modernization program.

## Demo Command

    /legacy assess claims-batch

## MVP Scenario

The user asks the Slack app to assess a synthetic COBOL module named CLAIMS-BATCH.

The app returns:

- What the module does
- Why modernization is risky
- Which business rules were detected
- Which dependencies matter
- Which SME questions must be answered
- Which migration path is recommended
- Which work packages should move next after SME validation

## Positioning

This is not a COBOL chatbot.

It is a workflow orchestration layer for modernization teams. It brings code understanding, business-rule extraction, migration-risk framing, SME review, and delivery planning into Slack.

## MVP Boundary

The current implementation uses deterministic local fixtures for reliability and repeatability.

Future integrations can connect the adapter boundary to an LLM, a legacy-code analysis backend, Jira/Linear/ServiceNow, dependency mapping tools, or enterprise knowledge systems.
