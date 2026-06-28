# Architecture Diagram

```mermaid
flowchart TD
    user[Transformation lead / architect in Slack]
    slack[Slack workspace<br/>/legacy assess claims-batch]
    bolt[Slack Bolt app<br/>src/app/slack-app.ts]
    orchestrator[Domain orchestrator<br/>src/domain/orchestrator.ts]
    client[MCP-backed LegacyAnalysisClient<br/>src/domain/mcp-legacy-analysis-client.ts]
    transport[MCP stdio transport]
    server[MCP server<br/>src/mcp/server.ts]
    tools[MCP modernization tools<br/>src/mcp/tools.ts]
    fixtures[Deterministic demo fixtures<br/>src/demo/fixtures.ts]
    renderer[Slack renderer<br/>src/app/render.ts]
    response[Slack modernization assessment<br/>risk, rules, dependencies,<br/>SME questions, work packages]

    user --> slack
    slack --> bolt
    bolt --> orchestrator
    orchestrator --> client
    client --> transport
    transport --> server
    server --> tools
    tools --> fixtures
    fixtures --> tools
    tools --> server
    server --> transport
    transport --> client
    client --> orchestrator
    orchestrator --> renderer
    renderer --> response
    response --> user
```

## Implemented Runtime Path

1. A user invokes `/legacy assess claims-batch` in Slack.
2. The Slack Bolt app receives the slash command through Socket Mode.
3. The domain orchestrator calls the MCP-backed `LegacyAnalysisClient`.
4. The MCP client starts and calls the local MCP server over stdio.
5. The MCP server exposes modernization tools:
   - `legacy.assess_module`
   - `legacy.extract_rules`
   - `legacy.create_plan`
6. The tools read deterministic demo fixture data for repeatable hackathon behavior.
7. The MCP client assembles the final `ModernizationAssessment`.
8. The Slack renderer returns a concise command-center assessment to Slack.
9. The response includes a local MCP tool-call audit summary.

## MVP Boundary

The current MVP intentionally uses deterministic fixture data. The MCP client/server execution path is real; the enterprise data source is synthetic.

Future integrations can replace the fixture-backed tools with real legacy-code analysis services, dependency mappers, Jira/Linear/ServiceNow ticket creation, LLM-backed synthesis, and SME approval workflows.
