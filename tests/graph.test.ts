import assert from "node:assert/strict";
import test from "node:test";
import { resolveTraceabilityGraph } from "../src/domain/graph/model.ts";
import { renderTraceabilityGraphSvg, STATUS_FILL } from "../src/app/graph/svg.ts";
import { claimsBatchAssessment } from "../src/demo/fixtures.ts";

test("model: one node per evidence, business rule, and work package", () => {
  const model = resolveTraceabilityGraph(claimsBatchAssessment);
  const ev = model.nodes.filter((n) => n.kind === "evidence");
  const br = model.nodes.filter((n) => n.kind === "business_rule");
  const lmc = model.nodes.filter((n) => n.kind === "work_package");

  assert.equal(ev.length, claimsBatchAssessment.evidenceCatalog.evidence.length);
  assert.equal(br.length, claimsBatchAssessment.extractedBusinessRules.length);
  assert.equal(lmc.length, claimsBatchAssessment.ticketDraftWorkPackages.length);
});

test("model: every edge resolves to a catalog evidence id; no unresolved refs in fixture", () => {
  const model = resolveTraceabilityGraph(claimsBatchAssessment);
  const catalogIds = new Set(claimsBatchAssessment.evidenceCatalog.evidence.map((e) => e.id));

  model.edges.forEach((e) => assert.ok(catalogIds.has(e.to), `edge to non-catalog evidence ${e.to}`));
  assert.equal(model.unresolvedRefs.length, 0);

  // 14 resolved refs across the fixture
  assert.equal(model.edges.length, 14);
});

test("model: a ref outside the catalog produces no edge and is recorded as unresolved", () => {
  const tampered = structuredClone(claimsBatchAssessment);
  tampered.extractedBusinessRules.push({
    id: "BR-999",
    title: "Phantom rule citing nonexistent evidence",
    description: "x",
    evidenceRefs: ["EV-999"],
    confidence: "low",
    validationStatus: "machine_inferred"
  });

  const baseline = resolveTraceabilityGraph(claimsBatchAssessment);
  const model = resolveTraceabilityGraph(tampered);

  // Node exists, but the bogus ref draws no edge
  assert.ok(model.nodes.some((n) => n.id === "BR-999"));
  assert.equal(model.edges.length, baseline.edges.length);
  assert.deepEqual(model.unresolvedRefs, [{ from: "BR-999", ref: "EV-999" }]);
});

test("svg: validation status drives claim color; evidence is neutral", () => {
  const model = resolveTraceabilityGraph(claimsBatchAssessment);
  const svg = renderTraceabilityGraphSvg(model);

  // Fixture work packages are sme_required -> blue must appear
  assert.ok(svg.includes(STATUS_FILL.sme_required.stroke));
  // Evidence neutral fill must appear
  assert.ok(svg.includes("#f1f3f4"));
});

test("svg: validated claims render green", () => {
  const validated = structuredClone(claimsBatchAssessment);
  validated.extractedBusinessRules[0]!.validationStatus = "sme_validated";
  const svg = renderTraceabilityGraphSvg(resolveTraceabilityGraph(validated));

  assert.ok(svg.includes(STATUS_FILL.sme_validated.stroke));
});

test("svg: render is deterministic for identical input", () => {
  const model = resolveTraceabilityGraph(claimsBatchAssessment);
  assert.equal(renderTraceabilityGraphSvg(model), renderTraceabilityGraphSvg(model));
});