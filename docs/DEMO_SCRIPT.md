# Demo Script: Legacy Modernization Commander

## One-line Pitch

Legacy Modernization Commander is a Slack-native command center for enterprise legacy modernization teams.

It turns a legacy module into a business-readable modernization assessment with risk, business rules, dependencies, SME questions, migration path, and Jira-ready work packages.

## Demo Command

    /legacy assess claims-batch

## Demo Flow

1. Open Slack.
2. Go to the demo channel.
3. Run:

       /legacy assess claims-batch

4. Show the response from Legacy Modernization Commander.
5. Explain that this is a deterministic vertical slice for a COBOL claims batch module.

## What the Response Shows

- The system/module being assessed: CLAIMS-BATCH
- Language and platform: COBOL on z/OS batch
- Business purpose of the module
- Modernization risk level
- Extracted business rules
- Critical dependencies
- SME questions before migration
- Recommended migration path
- Jira-ready work packages
- Tool-call/audit summary

## Key Message for Judges

Legacy modernization is not only a code-conversion problem.

The difficult enterprise problem is coordinating engineers, architects, business SMEs, delivery managers, compliance, and product owners around hidden business logic and risky dependencies.

This project uses Slack as the operating surface for that modernization workflow.

## MVP Boundary

This MVP intentionally uses deterministic fixtures.

It does not claim production-grade COBOL parsing or live enterprise integrations. The goal is to demonstrate the agentic workflow, Slack-native interaction model, assessment shape, and clean adapter boundary for future Claude/backend integration.

## Future Extensions

- Connect the adapter to a real legacy-code analysis backend
- Add Claude-powered rule extraction and explanation
- Create Jira tickets from approved work packages
- Add SME approval workflows
- Add dependency graphs and migration-readiness scoring
- Support additional legacy environments such as Assembler, PL/I, RPG, Smalltalk, and SAP ABAP
