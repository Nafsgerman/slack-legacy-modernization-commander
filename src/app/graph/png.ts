import { Resvg } from "@resvg/resvg-js";

export const svgToPng = (svg: string): Buffer => {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width" as const, value: 860 }
  });
  return Buffer.from(resvg.render().asPng());
};