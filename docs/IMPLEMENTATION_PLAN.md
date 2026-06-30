# Implementation Plan

Status reflects shipped state at tag `v0.6.1-demo-ready` (49/49 green, tsc clean).

## Milestone 1: Project Spine

- [x] Project context, product brief, architecture.
- [x] TypeScript scaffold, ESM, Node 22.
- [x] Modernization assessment types (`src/domain/types.ts`).
- [x] Synthetic COBOL source artifact (`src/demo/source/claims-batch.cbl`).
- [x] Deterministic fixture assessment.

## Milestone 2: Domain Workflow

- [x] `LegacyAnalysisClient` adapter boundary.
- [x] Orchestrator over the client boundary.
- [x] Fixture client (deterministic).
- [x] Plain-text + Slack Block Kit rendering.
- [x] Unit + behavior tests.

## Milestone 3: Agent Grounding

- [x] Agent client against `claude-sonnet-4-6`.
- [x] Model proposes paragraph/line citations into real COBOL source.
- [x] `verifyAndStamp` resolves citations → mints `EV-###` evidence catalog.
- [x] `validationStatus` stamped per claim (`machine_inferred` / `sme_required`).
- [x] Derived `smeValidationChecklist` from model `unknowns` (app-owned).
- [x] Adversarial tests: model can never reach `sme_validated`.

## Milestone 4: Mode Selection

- [x] `--agent` / `--fixture` flags.
- [x] Auto mode: agent if `ANTHROPIC_API_KEY` set, else fixture.
- [x] Client factory + command-arg parsing, with tests.

## Milestone 5: Interactive Slack Loop

- [x] Slack app manifest, Socket Mode, `/legacy` slash command.
- [x] Assessment card with action buttons (Mark reviewed · SME follow-up · Draft ticket · Show trace).
- [x] `validation-decision` workflow — only path to `sme_validated`.
- [x] App Home live dashboard reflecting validated state.
- [x] Traceability graph PNG posted to demo channel on each SME decision.

## Milestone 6: Submission Polish

- [x] CI: `tsc --noEmit` gate before tests.
- [x] README rewrite (three modes, boundary, grounding, honest framing).
- [x] Mermaid architecture diagram.
- [x] PROJECT_CONTEXT rewrite to modernization product.
- [ ] DEMO_SCRIPT rewrite.
- [ ] Bot display name fix in installed Slack app (reinstall after rename).
- [ ] 3-minute demo video.
- [ ] Devpost text.
- [ ] Sandbox access + reviewer grants checklist.