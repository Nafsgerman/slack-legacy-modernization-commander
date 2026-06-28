# Traceability Model

## Purpose

Legacy modernization decisions are risky when teams cannot explain where a claim came from.

This project models traceability explicitly: business rules, migration risks, dependencies, SME checklist items, work packages, and MCP trace entries can reference structured evidence IDs from an evidence catalog.

## Core Concepts

### EvidenceRef

An evidence reference is a stable pointer from a decision object to supporting source material in the demo fixture.

It is not a production document store. In this MVP, evidence references point to deterministic synthetic source snippets and domain facts.

### EvidenceCatalog

The evidence catalog is the set of evidence records available for a module assessment.

Each evidence record should answer:

- what the evidence is
- which module it belongs to
- why it matters
- which generated claims depend on it

The current fixture uses `synthetic://` locations so reviewers can distinguish demo evidence from live enterprise artifacts.

### Validation Status

Generated modernization outputs should not pretend all findings are fully verified.

Use validation statuses to distinguish:

- validated demo fixture facts
- items that require SME review
- inferred recommendations
- future integration placeholders

The current TypeScript model uses validation markers such as `machine_inferred`, `sme_required`, and `sme_validated`. In the deterministic demo, high-impact modernization recommendations remain SME-gated.

## What Gets Evidence Refs

The implemented assessment model includes evidence references for:

- modernization risk
- extracted business rules
- critical dependencies
- SME validation checklist items
- modernization work packages
- MCP trace entries

## Why This Matters

The project is designed for enterprise modernization contexts where business stakeholders need to understand not only the recommendation, but the basis for the recommendation.

A reviewer should be able to inspect:

1. the Slack output
2. the MCP trace
3. the evidence references
4. the fixture-backed source catalog
5. the tests that enforce traceability invariants

## Implemented Invariants

The test suite enforces that:

- important modernization claims do not float without evidence
- evidence references point to known catalog entries
- repeated demo runs are deterministic
- rendered output does not imply unsupported production integrations
- SME-validated rule statuses require explicit SME validation evidence

## Current Limitations

The MVP does not persist evidence to an external audit store.

The MVP does not ingest real customer source code.

The MVP does not perform production-grade static analysis.

The traceability model is intentionally small, typed, and deterministic so the architecture can be reviewed clearly.
