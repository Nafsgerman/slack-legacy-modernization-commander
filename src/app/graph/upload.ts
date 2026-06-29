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
  channelId: string
): Promise<UploadedGraphFile> => {
  const model = resolveTraceabilityGraph(assessment);
  const svg = renderTraceabilityGraphSvg(model);
  const png = svgToPng(svg);

  const result = await client.files.uploadV2({
    channel_id: channelId,
    filename: `traceability-${assessment.moduleId}-${Date.now()}.png`,
    file: png,
    initial_comment: ""
  });

  const raw = result as unknown as { files?: Array<{ id?: string; permalink?: string }> };
  const file = raw.files?.[0];
  const fileId = file?.id ?? "";
  const permalink = file?.permalink ?? "";

  if (!fileId) {
    throw new Error("files.uploadV2 did not return a file id");
  }

  return { fileId, permalink };
};