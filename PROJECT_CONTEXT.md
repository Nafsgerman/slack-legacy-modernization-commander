# Legacy Modernization Commander — Project Context

## Mission

Build a portfolio-grade Slack-native legacy modernization agent for the Slack Agent Builder Challenge.

The project demonstrates frontier-lab / FDE-quality product and engineering judgment: a narrow but excellent workflow, a clean model-proposes / app-validates boundary, deterministic behavior where it matters, grounded agent output, thoughtful Slack UX, and a strong demo story.

Built by a modernization practitioner with 22 years across COBOL, OLTP, and mainframe legacy estates. The product reflects where migration programs actually break — coordination of business rules, dependencies, and SME validation — not code conversion alone.

## Hackathon

- Platform: Devpost
- Hackathon: Slack Agent Builder Challenge
- Deadline: July 14, 2026 at 02:00 GMT+2
- Internal target: submit-ready well before the public deadline
- Track target: New Slack Agent, with a Best UX / Best Technological Implementation angle

## Product Concept

Legacy Modernization Commander turns a legacy module into a business-readable modernization assessment inside Slack.

For a given module it surfaces:

1. Business purpose — what the module does.
2. Modernization risk — where migration risk concentrates and why.
3. Extracted business rules — grounded in real source lines.
4. Critical dependencies — databases, file contracts, schedulers, teams.
5. SME questions — what must be validated before safe migration.
6. Recommended migration path.
7. Draft work packages — proposed for human review, not auto-filed.

## Three Modes

- **Auto** — `/legacy assess claims-batch`. Agent if `ANTHROPIC_API_KEY` is set, otherwise fixture.
- **Agent** — `--agent`. Live Claude grounding (`claude-sonnet-4-6`) against real COBOL source.
- **Fixture** — `--fixture`. Deterministic local assessment, no model call.

## The Architectural Boundary (core pitch)

The agent proposes a grounded assessment. The deterministic application layer owns SME validation state.

- Every claim is stamped `machine_inferred` or `sme_required`. The model has no path to `sme_validated`.
- `sme_validated` is reachable only through the application's SME workflow. The agent's output type cannot express a validated claim. Adversarial tests enforce this.
- The App Home dashboard reflects validated workflow state, not raw model output.

## How Grounding Works

1. Model receives real source (`src/demo/source/claims-batch.cbl`) and proposes paragraph/line citations per claim.
2. `verifyAndStamp` (pure, no model) resolves each reference against actual source lines.
3. Resolved references mint catalog evidence (`EV-###`) with file/paragraph/line locators and real excerpts.
4. Each claim gets a `validationStatus`. No catalog reference, no standing claim.

The `smeValidationChecklist` is derived by the application from the model's `unknowns` — the model never emits a checklist.

## Interactive Slack Loop

Assessment card → action buttons (Mark reviewed · SME follow-up · Draft ticket · Show trace) → each SME decision updates the App Home dashboard and posts a refreshed traceability graph PNG to the demo channel.

## Quality Bar

- Code is readable, typed, modular, and testable.
- `tsc --noEmit` runs in CI before tests. Runtime type-stripping can mask type errors, so the type check is a required gate.
- Agent output is grounded in resolved citations, not invention.
- Demo data is clearly labeled synthetic.
- The product feels like an enterprise workflow, not a generic chatbot.

## Honest-Framing Rules (hard)

- Every claim maps to a visible artifact.
- No "court-defensible" language — outputs are case-file-ready.
- No claim of production-grade COBOL parsing or live enterprise integration.
- Work packages are drafts. Nothing is filed in Jira.
- Synthetic data is labeled as synthetic.

## Demo Module

    CLAIMS-BATCH
    Language: COBOL
    Platform: z/OS batch
    Domain: insurance claims adjudication
    Source: src/demo/source/claims-batch.cbl (synthetic)

## Submission Requirements

- Text description of features and functionality.
- Demo video (~3 minutes).
- Architecture diagram (Mermaid, in README).
- URL to Slack developer sandbox.
- Access for `slackhack@salesforce.com` and `testing@devpost.com`.
- Public source repository.
- Open source license (MIT).
- README with setup and run instructions.

## Working Rules

- Keep the demo path narrow and high quality. Do not overbuild a modernization platform.
- Prefer deterministic demo data and explicit, grounded tool traces.
- Keep all project context in this repository so future threads resume quickly.
- Codex / Claude works as Lead Staff Engineer: 85% of architecture, implementation, debugging, tests, exact commands. Nafees owns the 15% — local accounts, secrets, manual setup, testing, deployment, demo recording, pitching.
- Communication is direct: exact file paths, exact commands, minimal explanation.
- Model levels: Medium for docs/planning/simple work, High for architecture/code/integrations, Very High for hard debugging / final review / submission polish.