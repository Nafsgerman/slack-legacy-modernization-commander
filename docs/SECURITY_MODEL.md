# Security Model

## Current MVP

Legacy Modernization Commander is a local hackathon demo using deterministic synthetic data.

It does not process real customer code, real credentials, real tickets, or production enterprise data.

## Data Handling

The MVP uses local fixtures only.

No production mainframe, Jira, Slack Audit Logs, customer repositories, or enterprise systems are connected.

## Slack Tokens

Local Slack credentials must be stored in `.env` and must not be committed.

Required variables:

    SLACK_BOT_TOKEN=xoxb-...
    SLACK_SIGNING_SECRET=...
    SLACK_APP_TOKEN=xapp-...

## Production Considerations

A production version would need:

- Secret management
- Tenant isolation
- Audit logging
- Access control
- Approval workflows before ticket creation
- Redaction of sensitive code and data
- Enterprise source-control permissions
- Clear boundaries between generated recommendations and approved modernization actions

## MVP Safety Boundary

The MVP only demonstrates the workflow shape. It does not claim production readiness.
