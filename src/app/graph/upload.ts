import type { WebClient } from "@slack/web-api";
import type { ModernizationAssessment } from "../../domain/types.ts";
import { resolveTraceabilityGraph } from "../../domain/graph/model.ts";
import { renderTraceabilityGraphSvg } from "./svg.ts";
import { svgToPng } from "./png.ts";

export interface UploadedGraphFile {
  fileId: string;
  permalink: string;
}

export const uploadTraceabilityGraph = async (
  client: WebClient,
  assessment: ModernizationAssessment,
  channelId: string,
  caption = ""
): Promise<UploadedGraphFile> => {
  const model = resolveTraceabilityGraph(assessment);
  const svg = renderTraceabilityGraphSvg(model);
  const png = svgToPng(svg);

  const result = await client.files.uploadV2({
    channel_id: channelId,
    filename: `traceability-${assessment.moduleId}-${Date.now()}.png`,
    file: png,
    initial_comment: caption
  });

  // files.uploadV2 response shape: { files: [ { files: [ { id, permalink, ... } ] } ] }
  const raw = result as unknown as Record<string, unknown>;
  const outer = Array.isArray(raw["files"]) ? (raw["files"] as Record<string, unknown>[]) : [];
  const inner =
    outer[0] && Array.isArray(outer[0]["files"])
      ? (outer[0]["files"] as Record<string, unknown>[])
      : [];
  const file = inner[0];

  const fileId = typeof file?.["id"] === "string" ? (file["id"] as string) : "";
  const permalink = typeof file?.["permalink"] === "string" ? (file["permalink"] as string) : "";

  return { fileId, permalink };
};