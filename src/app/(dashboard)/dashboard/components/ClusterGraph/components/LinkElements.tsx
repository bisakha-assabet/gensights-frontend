import * as d3 from "d3";
import { Link, Node } from "../types";
import { clusterColors } from "../utils/clusterUtils";

interface LinkElementsProps {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  links: Link[];
  isDarkMode: boolean;
}

export const createLinkElements = ({ svg, links, isDarkMode }: LinkElementsProps) => {
  return svg
    .append("g")
    .attr("class", "links")
    .selectAll<SVGLineElement, Link>("line")
    .data(links)
    .join("line")
    .attr("stroke", (d) => {
      if (d.clusterId === -1) return "#999";
      const clusterId = d.clusterId || 0;
      return clusterColors[clusterId]?.main || "#999";
    })
    .attr("stroke-opacity", (d) => (d.clusterId === -1 ? 0.2 : 0.3))
    .attr("stroke-width", (d) => (d.clusterId === -1 ? 0.5 : 0.5));
};
