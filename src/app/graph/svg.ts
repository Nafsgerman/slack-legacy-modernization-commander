import type { GraphNode, TraceabilityGraphModel } from "../../domain/graph/model.ts";
import type { ValidationStatus } from "../../domain/types.ts";

export const STATUS_FILL: Record<ValidationStatus, { fill: string; stroke: string }> = {
  machine_inferred: { fill: "#fef7e0", stroke: "#f9ab00" },
  sme_required: { fill: "#e8f0fe", stroke: "#1a73e8" },
  sme_validated: { fill: "#e6f4ea", stroke: "#34a853" },
  rejected: { fill: "#fce8e6", stroke: "#ea4335" }
};

const EVIDENCE_FILL = { fill: "#f1f3f4", stroke: "#5f6368" };

const W = 860;
const CLAIM_X = 32;
const EV_X = 588;
const NODE_W = 240;
const NODE_H = 38;
const ROW_GAP = 52;
const TOP = 96;
const LEGEND_H = 56;

const escapeXml = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const truncate = (s: string, max = 32): string => (s.length > max ? `${s.slice(0, max - 1)}…` : s);

const nodeColors = (node: GraphNode): { fill: string; stroke: string } =>
  node.kind === "evidence" ? EVIDENCE_FILL : STATUS_FILL[node.validationStatus ?? "machine_inferred"];

export const renderTraceabilityGraphSvg = (model: TraceabilityGraphModel): string => {
  const claims = model.nodes.filter((n) => n.kind !== "evidence");
  const evidence = model.nodes.filter((n) => n.kind === "evidence");

  const pos = new Map<string, { x: number; y: number }>();
  claims.forEach((n, i) => pos.set(n.id, { x: CLAIM_X, y: TOP + i * ROW_GAP }));
  evidence.forEach((n, i) => pos.set(n.id, { x: EV_X, y: TOP + i * ROW_GAP }));

  const rows = Math.max(claims.length, evidence.length);
  const H = TOP + rows * ROW_GAP + LEGEND_H;

  const edgePaths = model.edges
    .map((e) => {
      const from = pos.get(e.from);
      const to = pos.get(e.to);
      if (!from || !to) return "";
      const x1 = from.x + NODE_W;
      const y1 = from.y + NODE_H / 2;
      const x2 = to.x;
      const y2 = to.y + NODE_H / 2;
      const mx = (x1 + x2) / 2;
      return `<path d="M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}" fill="none" stroke="#9aa0a6" stroke-width="1.4" opacity="0.7"/>`;
    })
    .join("\n");

  const nodeRects = model.nodes
    .map((n) => {
      const p = pos.get(n.id);
      if (!p) return "";
      const c = nodeColors(n);
      const fontStyle = n.kind === "evidence" ? ' font-family="ui-monospace, monospace" font-size="12"' : ' font-size="13"';
      return [
        `<rect x="${p.x}" y="${p.y}" width="${NODE_W}" height="${NODE_H}" rx="8" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.6"/>`,
        `<text x="${p.x + 12}" y="${p.y + NODE_H / 2 + 4}" fill="#202124"${fontStyle}>${escapeXml(truncate(n.label))}</text>`
      ].join("\n");
    })
    .join("\n");

  const legendItems: Array<{ label: string; fill: string; stroke: string }> = [
    { label: "Machine inferred", ...STATUS_FILL.machine_inferred },
    { label: "SME required", ...STATUS_FILL.sme_required },
    { label: "SME validated", ...STATUS_FILL.sme_validated },
    { label: "Evidence", ...EVIDENCE_FILL }
  ];

  const legend = legendItems
    .map((item, i) => {
      const lx = 32 + i * 200;
      const ly = H - 32;
      return [
        `<rect x="${lx}" y="${ly}" width="16" height="16" rx="4" fill="${item.fill}" stroke="${item.stroke}" stroke-width="1.6"/>`,
        `<text x="${lx + 24}" y="${ly + 13}" fill="#5f6368" font-size="12">${escapeXml(item.label)}</text>`
      ].join("\n");
    })
    .join("\n");

  return [
    `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">`,
    `<rect x="0" y="0" width="${W}" height="${H}" fill="#ffffff"/>`,
    `<text x="32" y="40" fill="#202124" font-size="18" font-weight="600">Evidence Traceability</text>`,
    `<text x="32" y="62" fill="#5f6368" font-size="12">Claims (left) anchored to line-cited evidence (right) · color = validation status</text>`,
    `<text x="${CLAIM_X}" y="86" fill="#5f6368" font-size="11" font-weight="600">CLAIMS</text>`,
    `<text x="${EV_X}" y="86" fill="#5f6368" font-size="11" font-weight="600">EVIDENCE</text>`,
    edgePaths,
    nodeRects,
    legend,
    `</svg>`
  ].join("\n");
};