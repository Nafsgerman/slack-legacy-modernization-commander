# Demo Script: Legacy Modernization Commander

## One-line Pitch

Legacy Modernization Commander is a Slack-native command center for enterprise legacy modernization teams.

It turns a legacy module into a business-readable modernization assessment with risk, business rules, dependencies, SME questions, migration path, and work packages prepared for future ticket creation.

## Required Technology

The demo uses MCP server integration.

The Slack workflow calls an MCP-backed analysis client, which invokes three modernization tools:

    legacy.assess_module
    legacy.extract_rules
    legacy.create_plan

The demo data is deterministic, but the MCP client/server path and tool-call trace are real.

## Demo Command

    /legacy assess claims-batch

## Demo Flow

1. Open Slack.
2. Go to the demo channel.
3. Run:

       /legacy assess claims-batch

4. Show the response from Legacy Modernization Commander.
5. Point out the MCP-backed audit summary at the bottom of the Slack response.
6. Explain that this is a deterministic vertical slice for a COBOL claims batch module.

## What the Response Shows

- The system/module being assessed: CLAIMS-BATCH
- Language and platform: COBOL on z/OS batch
- Business purpose of the module
- Modernization risk level
- Extracted business rules
- Critical dependencies
- SME questions before migration
- Recommended migration path
- Work packages prepared for future ticket creation
- Local MCP tool-call audit summary

## Key Message for Judges

Legacy modernization is not only a code-conversion problem.

The difficult enterprise problem is coordinating engineers, architects, business SMEs, delivery managers, compliance, and product owners around hidden business logic and risky dependencies.

This project uses Slack as the operating surface and MCP as the tool-integration layer for that modernization workflow.

## MVP Boundary

This MVP intentionally uses deterministic fixture data.

It does not claim production-grade COBOL parsing, live enterprise integrations, Claude execution, or Jira ticket creation. The goal is to demonstrate the agentic workflow, Slack-native interaction model, MCP-backed tool boundary, assessment shape, and clean adapter path for future LLM/backend integration.

## Future Extensions

- Connect the MCP tools to a real legacy-code analysis backend
- Add LLM-backed synthesis over MCP tool results
- Create Jira/Linear/ServiceNow tickets from approved work packages
- Add SME approval workflows
- Add dependency graphs and migration-readiness scoring
- Support additional legacy environments such as Assembler, PL/I, RPG, Smalltalk, and SAP ABAP
