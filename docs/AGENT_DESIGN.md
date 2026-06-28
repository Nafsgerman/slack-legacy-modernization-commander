# Agent Design

## Overview

Legacy Modernization Commander is a Slack-native workflow agent for one MVP workflow:

    /legacy assess claims-batch

The workflow returns a modernization assessment for a synthetic COBOL claims batch module.

## Current Workflow

1. Slack slash command receives `/legacy assess claims-batch`.
2. The command handler normalizes the request.
3. The domain orchestrator calls the legacy analysis client.
4. The deterministic fixture-backed client returns a modernization assessment.
5. The Slack renderer formats the assessment as a concise command-center card.
6. The response is returned ephemerally to the Slack user.

## Assessment Output

The assessment includes:

- Module name
- Language
- Platform
- Business purpose
- Modernization risk
- Evidence catalog
- Extracted business rules with confidence, validation status, and evidence refs
- Critical dependencies with evidence refs
- SME questions
- SME validation checklist
- Recommended migration path
- Work packages prepared for future ticket creation, with evidence refs
- Tool-call/audit summary with MCP trace IDs

## Adapter Boundary

The domain layer defines a future-facing adapter shape:

    export interface LegacyAnalysisClient {
      assessModule(moduleId: string): Promise<ModernizationAssessment>;
      extractRules(moduleId: string): Promise<BusinessRuleReport>;
      createModernizationPlan(moduleId: string): Promise<ModernizationPlan>;
    }

The MVP uses deterministic fixtures and does not call Claude or any other model API. A production version could connect this boundary to an LLM, a code-analysis backend, Jira/Linear/ServiceNow, source control, dependency maps, or enterprise knowledge systems.

## Design Principle

The Slack app should remain the workflow-orchestration layer.

It should not be tightly coupled to a specific parser, LLM, mainframe platform, or ticketing system.
