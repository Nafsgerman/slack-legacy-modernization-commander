import type { ModernizationAssessment, ValidationStatus } from "../types.ts";

export type GraphNodeKind = "evidence" | "business_rule" | "work_package";

export interface GraphNode {
  id: string;
  kind: GraphNodeKind;
  label: string;
  validationStatus?: ValidationStatus; // claims only; undefined for evidence
}

export interface GraphEdge {
  from: string; // claim id (BR-* or LMC-*)
  to: string; // evidence id (EV-*)
}

export interface UnresolvedRef {
  from: string;
  ref: string;
}

export interface TraceabilityGraphModel {
  nodes: GraphNode[];
  edges: GraphEdge[];
  unresolvedRefs: UnresolvedRef[];
}

const KIND_ORDER: Record<GraphNodeKind, number> = {
  business_rule: 0,
  work_package: 1,
  evidence: 2
};

// Pure derivation. An edge exists IFF the ref resolves to a catalog evidence id.
// Unresolved refs are recorded and excluded — the graph never invents an edge.
export const resolveTraceabilityGraph = (
  assessment: ModernizationAssessment
): TraceabilityGraphModel => {
  const catalogIds = new Set(assessment.evidenceCatalog.evidence.map((e) => e.id));

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const unresolvedRefs: UnresolvedRef[] = [];

  // Evidence nodes — ground truth, no validation color
  for (const evidence of assessment.evidenceCatalog.evidence) {
    nodes.push({
      id: evidence.id,
      kind: "evidence",
      label: `${evidence.id} ${evidence.sourceName}`
    });
  }

  const addClaim = (
    id: string,
    kind: GraphNodeKind,
    label: string,
    validationStatus: ValidationStatus,
    refs: string[]
  ): void => {
    nodes.push({ id, kind, label, validationStatus });
    for (const ref of refs) {
      if (catalogIds.has(ref)) {
        edges.push({ from: id, to: ref });
      } else {
        unresolvedRefs.push({ from: id, ref });
      }
    }
  };

  for (const rule of assessment.extractedBusinessRules) {
    addClaim(rule.id, "business_rule", `${rule.id} ${rule.title}`, rule.validationStatus, rule.evidenceRefs);
  }

  for (const wp of assessment.ticketDraftWorkPackages) {
    addClaim(wp.key, "work_package", `${wp.key} ${wp.title}`, wp.validationStatus, wp.evidenceRefs);
  }

  // Stable order: kind (BR, LMC, EV) then id
  nodes.sort((a, b) => {
    const k = KIND_ORDER[a.kind] - KIND_ORDER[b.kind];
    return k !== 0 ? k : a.id.localeCompare(b.id);
  });
  edges.sort((a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to));

  return { nodes, edges, unresolvedRefs };
};