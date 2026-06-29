# ADR-0001: Agent Grounding Boundary — Model Proposes, Application Validates

- Status: Accepted
- Date: 2026-06-29
- Deciders: Nafees (architect), Codex/Claude (lead staff engineer)
- Supersedes: none
- Related: ported principle from `cobol-estate-modernizer` ADR-0005 ("model generates, application stays authoritative")

## Context

The MVP serves a deterministic fixture through `LegacyAnalysisClient`. The recurring judge question is "where is the agent?" We are adding a real Claude-backed client behind the **same** boundary.

The credibility moat of this project is typed contracts, line-cited evidence, and human-gated validation. A model that freely writes the assessment — including its own evidence citations and its own validation statuses — destroys that moat. Track A renders the traceability graph and App Home validation progress **only** from verified evidence; if the model can self-stamp validation, the graph lies. So the boundary between "what the model says" and "what the system asserts" must be decided before any agent or Track A code is written.

## Decision

1. **The model is a proposal source, never an authority.** The Anthropic call returns a `ModelProposal` whose schema has no `validationStatus` field and no trusted excerpt. The model may *claim* evidence locations; it may not *declare* them verified.

2. **Validation status is assigned exclusively by application code.**
   `ValidationStatus = "unverified" | "machine_inferred" | "sme_validated"`.
   The model output type cannot represent any of these values (illegal states are unrepresentable).
   - `machine_inferred` is reachable **only** through deterministic citation verification.
   - `sme_validated` is reachable **only** through the human Slack button (`applyValidationDecision`).
   - No code path lets a model response reach either.

3. **Evidence is verified against real source artifacts, not trusted from the model.** Each proposed `EvidenceRef { artifactId, startLine, endLine }` is checked against the cited artifact's actual line count and content. On success, application code captures the real excerpt **itself** (the model's excerpt, if any, is discarded). On failure (out-of-range, unknown artifact) the claim is stamped `unverified` and excluded from the graph set.

4. **Reconciliation (ported from ADR-0005).** The model returns details only. Pure code computes every derived/headline field — validation stamps, the `EvidenceCatalog`, coverage metrics, risk rollups — and reconciles them back into the assessment so nothing the model emits floats free.

5. **Client selection is by environment, never by the model.**
   `ANTHROPIC_API_KEY` present → `ClaudeLegacyAnalysisClient`; absent → `DeterministicLegacyAnalysisClient`. Both satisfy the unchanged `LegacyAnalysisClient` interface. The orchestrator is untouched.

6. **The API is isolated to one seam and never touched by tests.** Only `ClaudeProposalProvider` calls Anthropic. Grounding is the pure function `verifyAndStamp(proposal, artifacts) -> ModernizationAssessment` with zero network. Tests exercise grounding directly with hand-authored proposals.

## Architecture

```
ClaudeLegacyAnalysisClient.assessModule(moduleId)
  └─ ClaudeProposalProvider.propose(moduleId, sourceArtifacts)   // ONLY API seam
       └─ returns ModelProposal   // rules/deps/questions + claimed EvidenceRefs; NO statuses, NO trusted excerpts
  └─ grounding.verifyAndStamp(proposal, sourceArtifacts)          // pure, authoritative
       └─ returns ModernizationAssessment   // statuses + excerpts assigned by code only
```

## Required new artifacts

| Path | Purpose | Model |
|---|---|---|
| `src/demo/source/claims-batch.cbl` | Synthetic, labeled, citeable COBOL source — the artifact evidence refs point into | Sonnet |
| `src/domain/grounding.ts` | `verifyAndStamp` + citation verifier, pure | Sonnet |
| `src/agent/proposal.ts` | `ModelProposal` types (no status fields) + safe JSON parser | Sonnet |
| `src/agent/claude-client.ts` | `ClaudeLegacyAnalysisClient` + `ClaudeProposalProvider` (the only API seam) | Sonnet |
| `src/domain/client-factory.ts` | Env-based client selection | Sonnet |
| `src/domain/types.ts` (edit) | Add `EvidenceRef`, `EvidenceCatalog`, `ValidationStatus`; attach `validationStatus` + `evidenceRefs` to rules/deps/questions/work-packages | Sonnet |

Note: `ModernizationAssessment` gains validation/evidence fields. Existing fixture and `render.ts` must still type-check — fixture entries default to `machine_inferred` with refs into `claims-batch.cbl` so the deterministic path and the agent path produce the same shape.

## Consequences

**Positive**
- Track A's graph and App Home can trust their inputs by construction.
- The "where's the agent" answer is real and demoable: model reads synthetic source, proposes, code verifies citations against actual lines.
- The moat (line-cited, human-gated evidence) is enforced in **types**, not prose.
- Falls back to the fixture offline and in CI; no API cost to run tests.

**Negative / accepted**
- The model cannot shortcut the assessment. If it cites only invalid lines, the assessment is sparse — correct behavior, but the prompt must steer it to cite the provided source.
- The citeable source is synthetic. Honest non-goal: this verifies citations against synthetic COBOL, not a production estate.

## Adversarial guarantee (must ship with a test)

Given a model response that (a) injects `"validationStatus": "sme_validated"` into a rule, and (b) cites `claims-batch.cbl` lines `9000–9100` that do not exist:
- the parser drops the injected status (field is unmapped, structurally absent from `ModelProposal`),
- verification marks the citation `unverified`,
- `verifyAndStamp` output contains **zero** `sme_validated` entries and excludes the bogus ref from the graph set.

Test file: `tests/grounding.adversarial.test.ts`. Never calls the API.

## Non-goals

- Not production COBOL parsing; the citeable source is synthetic and labeled as such.
- No Jira writes. No SME identity/authz beyond the existing Slack button.
