# Public Artifact Checklist

This checklist defines what must be true before the repository is submitted to Devpost or shared as a portfolio artifact.

## Repository Hygiene

- [ ] No `.env` file committed
- [ ] No Slack tokens committed
- [ ] No local logs committed
- [ ] No `node_modules` committed
- [ ] No generated private artifacts committed
- [ ] `.env.example` contains placeholders only
- [ ] License is present
- [ ] README explains how to run the project
- [ ] CI passes from a clean checkout

## Claim Hygiene

- [ ] README distinguishes implemented features from future integrations
- [ ] Docs do not claim live mainframe access
- [ ] Docs do not claim real Jira ticket creation
- [ ] Docs do not claim Claude integration is implemented
- [ ] Docs do not imply production readiness
- [ ] Docs explain deterministic fixtures honestly

## Reviewer Experience

- [ ] Reviewer can run `npm ci`
- [ ] Reviewer can run `npm run ci`
- [ ] Reviewer can run `npm run demo`
- [ ] Reviewer can understand the Slack command without installing Slack
- [ ] Reviewer can inspect sample output in `docs/DEMO_OUTPUT.md`
- [ ] Reviewer can inspect MCP tools in `docs/MCP_TOOL_CATALOG.md`
- [ ] Reviewer can inspect traceability in `docs/TRACEABILITY_MODEL.md`

## Devpost Readiness

- [ ] Demo video shows the Slack command
- [ ] Demo video shows MCP trace visibility
- [ ] Submission text matches repository claims
- [ ] Limitations are stated honestly
- [ ] Prize positioning is tied to actual implementation
