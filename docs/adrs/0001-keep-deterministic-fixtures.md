# ADR 0001: Keep Deterministic Fixtures

## Status

Accepted

## Context

The project needs a reliable hackathon and portfolio demo that can run without customer data, live mainframe access, or paid model/API dependencies.

## Decision

Use deterministic synthetic fixture data for the implemented `CLAIMS-BATCH` workflow.

## Consequences

- Demo behavior is repeatable.
- CI can verify the workflow without external services.
- The product does not overclaim live code-analysis capability.
- Future real analyzers must replace the fixture-backed MCP tools behind the existing adapter boundary.
