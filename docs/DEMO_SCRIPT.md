# Demo Script: Legacy Modernization Commander

## One-line Pitch

Legacy Modernization Commander is a Slack-native command center for enterprise legacy modernization teams.

It turns a legacy module into a business-readable modernization assessment with risk, business rules, dependencies, SME questions, migration path, and Jira-ready work packages — then lets the team act on it inside the same Slack card.

## Demo Command

    /legacy assess claims-batch

## Demo Flow

1. Open Slack.
2. Go to the demo channel.
3. Run:

       /legacy assess claims-batch

4. Show the assessment card from Legacy Modernization Commander.
5. Explain that this is a deterministic vertical slice for a COBOL claims batch module.
6. Click **Show trace** — the tool-call/audit summary expands inside the same card. Point out: no new message, the card mutates in place.
7. Click **Mark reviewed** — the card's validation status flips to `reviewed`. This is the key UX moment: the card is a live workflow surface, not a static report.
8. (Optional) Click **SME follow-up** and **Draft ticket** to show the open questions routed and the work packages drafted, again updating the existing card.

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
- Interactive actions: Mark reviewed, SME follow-up, Draft ticket, Show trace

## Why the Interactivity Matters

Each button uses `replace_original: true` and re-renders the Block Kit card, so the assessment's validation state changes in place instead of stacking ephemeral notes. That turns the assessment from a generated report into a shared operating surface a modernization team can actually work.

## Key Message for Judges

Legacy modernization is not only a code-conversion problem.

The difficult enterprise problem is coordinating engineers, architects, business SMEs, delivery managers, compliance, and product owners around hidden business logic and risky dependencies.

This project uses Slack as the operating surface for that modernization workflow — and the interactive card is where that coordination happens.

## MVP Boundary

This MVP intentionally uses deterministic fixtures.

It does not claim production-grade COBOL parsing or live enterprise integrations, and interactive state is not yet persisted to an external system. The goal is to demonstrate the agentic workflow, Slack-native interaction model, interactive review loop, assessment shape, and clean adapter boundary for future Claude/backend integration.

## Future Extensions

- Connect the adapter to a real legacy-code analysis backend
- Add Claude-powered rule extraction and explanation
- Create Jira tickets from approved work packages
- Persist reviewed/routed/drafted state across sessions
- Add SME approval workflows
- Add dependency graphs and migration-readiness scoring
- Support additional legacy environments such as Assembler, PL/I, RPG, Smalltalk, and SAP ABAP