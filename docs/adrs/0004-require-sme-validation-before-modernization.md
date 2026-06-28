# ADR 0004: Require SME Validation Before Modernization

## Status

Accepted

## Context

Legacy modernization decisions often fail when extracted rules are treated as final truth without business validation.

## Decision

Every assessment includes validation metadata and an SME validation checklist. Business rules remain `machine_inferred` or `sme_required`, while risk and work packages remain `sme_required` in the deterministic demo.

## Consequences

- The workflow supports decision-making without overclaiming production readiness.
- Reviewers can see what still needs human approval.
- Work packages are traceable to evidence, but implementation should wait for SME validation.
