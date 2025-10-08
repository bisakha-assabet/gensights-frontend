import type * as d3 from "d3"
import type { Node } from "../types"
import { clusterColors, calculateSizes } from "../utils/clusterUtils"
import { getTooltip } from "../../ClusterGraph/ClusterGraphTooltip"

interface ClusterElementsProps {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
  nodes: Node[]
  dimensions: { width: number; height: number }
}

export const createClusterElements = ({ svg, nodes, dimensions }: ClusterElementsProps) => {
  const sizes = calculateSizes(dimensions.width, dimensions.height)
  const clusterNodes = nodes.filter((d) => d.type === "cluster")

  const clusterElements = svg
    .append("g")
    .attr("class", "clusters")
    .selectAll<SVGCircleElement, Node>("circle")
    .data(clusterNodes)
    .join("circle")
    .attr("r", sizes.clusterRadius)
    .attr("cx", (d) => d.x ?? 0)
    .attr("cy", (d) => d.y ?? 0)
    .attr("fill", "white")
    .attr("stroke", (d) => clusterColors[d.clusterId || 0]?.main || "#3b82f6")
    .attr("stroke-width", 3)
    .attr("opacity", 1)
    .style("cursor", "pointer")
    // Add tooltip event handlers
    .on("mouseover", (event, d) => {
      const tooltip = getTooltip()
      if (tooltip) {
        let content = ""

        if (d.type === "cluster") {
          content = `
            <div>
              <strong>${d.label}</strong>
            </div>
          `
        } else if (d.type === "question") {
          content = `
            <div>
              <strong>Country Code:</strong> ${d.country || "N/A"}<br/>
              <strong>Case Created Date:</strong> ${d.date || "N/A"}<br/>
              <strong>Drug Name:</strong> ${d.drug || "N/A"}
            </div>
          `
        }

        tooltip.style("visibility", "visible").html(content)
      }
    })
    .on("mousemove", (event, d) => {
      const tooltip = getTooltip()
      if (tooltip) {
        tooltip.style("top", event.pageY - 10 + "px").style("left", event.pageX + 10 + "px")
      }
    })
    .on("mouseout", () => {
      const tooltip = getTooltip()
      if (tooltip) {
        tooltip.style("visibility", "hidden")
      }
    })
    // Add click handler to prevent event propagation
    .on("click", (event) => {
      event.stopPropagation()
    })

  const clusterLabels = svg
    .append("g")
    .attr("class", "cluster-labels")
    .selectAll("text")
    .data(clusterNodes)
    .join("text")
    .text((d) => d.label)
    .attr("x", (d) => d.x ?? 0)
    .attr("y", (d) => (d.y ?? 0) - 15)
    .attr("text-anchor", "middle")
    .attr("fill", (d) => clusterColors[d.clusterId || 0]?.main || "#3b82f6")
    .attr("opacity", 0.5) // Corrected opacity for highlighting
    .style("font-size", `${sizes.fontSize}px`)
    .style("pointer-events", "none")

  return { clusterElements, clusterLabels }
}
