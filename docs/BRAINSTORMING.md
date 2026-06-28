# Brainstorming Notes

## Selected Direction

Legacy Modernization Commander.

A Slack-native command center for enterprise legacy modernization teams.

## Core Insight

Legacy modernization is not only a code-conversion problem.

The hard enterprise problem is coordinating business rules, migration risk, dependencies, SME validation, delivery planning, and stakeholder alignment across many teams.

Slack is a strong surface for this because modernization work already happens through conversations, approvals, questions, and delivery coordination.

## MVP Vertical Slice

Command:

    /legacy assess claims-batch

Demo module:

    CLAIMS-BATCH
    COBOL
    z/OS batch
    Insurance claims adjudication

The MVP returns:

- Business purpose
- Modernization risk
- Extracted business rules
- Critical dependencies
- SME questions
- Recommended migration path
- Work packages prepared for future ticket creation
- Tool-call/audit summary

## Why This Is Better Than a Generic Chatbot

The product is not a COBOL chatbot.

It is a workflow layer for modernization teams. The value is not only explaining code; the value is moving a modernization program forward by turning code understanding into reviewable decisions and delivery work.

## Hackathon Strategy

Build one beautiful vertical slice.

Do not overbuild.

Show strong engineering judgment by keeping a clean adapter boundary, deterministic demo fixtures, focused tests, and honest non-goals.

## Future Ideas

- Add `/legacy rules claims-batch`
- Add `/legacy tickets claims-batch`
- Add `/legacy plan claims-batch`
- Connect to an LLM for rule extraction
- Connect to a legacy-code analysis backend
- Connect to Jira for ticket creation
- Add SME approval workflow in Slack
- Support more legacy technologies such as Assembler, PL/I, RPG, Smalltalk, and SAP ABAP
