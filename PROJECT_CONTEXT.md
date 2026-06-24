# Legacy Modernization Commander Project Context

Legacy Modernization Commander is a Slack-native command center for enterprise legacy modernization teams.

The project is built for the Slack Agent Builder Challenge and targets the New Slack Agent track.

## Product Thesis

Legacy modernization is not only a code-conversion problem.

The harder enterprise problem is coordinating code understanding, business-rule extraction, migration risk, SME review, dependency mapping, and delivery planning across architects, engineers, business owners, compliance, and transformation leaders.

Legacy Modernization Commander uses Slack as the operating surface for that workflow.

## Current MVP

The MVP command is:

    /legacy assess claims-batch

It returns a modernization assessment for a synthetic COBOL claims batch module.

The assessment includes:

- Business purpose
- Modernization risk
- Extracted business rules
- Critical dependencies
- SME questions
- Recommended migration path
- Jira-ready work packages
- Tool-call/audit summary

## Required Hackathon Technology

The project uses MCP server integration.

The MCP server exposes modernization tools for module assessment, business-rule extraction, and modernization planning. The Slack workflow calls the MCP-backed analysis client and displays the resulting tool trace.

## Engineering Standard

This repo is being built as a portfolio-grade engineering artifact.

Priorities:

- Clear architecture
- Real tool boundaries
- Honest non-goals
- Tests and CI
- Reliable demo
- Enterprise-grade product positioning
- No fake claims about implemented capabilities
