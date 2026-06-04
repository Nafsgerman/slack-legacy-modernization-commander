import assert from "node:assert/strict";
import test from "node:test";
import { runIncidentWorkflow } from "../src/domain/orchestrator.ts";
import { demoAlert } from "../src/demo/fixtures.ts";

test("demo incident is triaged as critical with high confidence", () => {
  const brief = runIncidentWorkflow(demoAlert);

  assert.equal(brief.severity, "critical");
  assert.equal(brief.confidence, "high");
  assert.equal(brief.status, "triaged");
  assert.equal(brief.toolTrace.length, 4);
});

test("incident brief remains grounded in synthetic tool facts", () => {
  const brief = runIncidentWorkflow(demoAlert);

  assert.ok(brief.keyFacts.some((fact) => fact.includes("approved=false")));
  assert.ok(brief.keyFacts.some((fact) => fact.includes("Related audit events found: 4")));
  assert.ok(brief.timeline.some((entry) => entry.source === "audit:AE-1003"));
  assert.ok(brief.recommendedTasks.some((task) => task.ownerRole === "Slack workspace administrator"));
});
