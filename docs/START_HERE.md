# Start Here

Legacy Modernization Commander is a Slack-native command center for enterprise legacy modernization teams.

The MVP demo command is:

    /legacy assess claims-batch

It returns a structured modernization assessment for a synthetic COBOL claims batch module, including:

- Business purpose
- Modernization risk
- Extracted business rules
- Critical dependencies
- SME questions
- Recommended migration path
- Jira-ready work packages
- Tool-call/audit summary

## Recommended Reading Order

1. README.md
2. docs/DEMO_SCRIPT.md
3. docs/PRODUCT_BRIEF.md
4. docs/AGENT_DESIGN.md
5. docs/ARCHITECTURE.md
6. docs/SLACK_SETUP.md
7. docs/SECURITY_MODEL.md

## MVP Boundary

This is a deterministic hackathon vertical slice. It does not connect to live enterprise systems, perform production-grade COBOL parsing, or create Jira tickets yet.

The purpose is to demonstrate the Slack-native workflow, modernization assessment shape, and clean adapter boundary for future Claude/backend integration.
