import type * as d3 from "d3"
import type { Node, Link } from "../types"
import { clusterColors, calculateSizes } from "../utils/clusterUtils"
import { showTooltip, hideTooltip, updateTooltipPosition } from "../../ClusterGraph/ClusterGraphTooltip"

interface QuestionElementsProps {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
  nodes: Node[]
  links: Link[]
  dimensions: { width: number; height: number }
  onQuestionClick?: (questionId: string, connectedClusterIds: number[]) => void
}

export const createQuestionElements = ({ svg, nodes, links, dimensions, onQuestionClick }: QuestionElementsProps) => {
  const sizes = calculateSizes(dimensions.width, dimensions.height)
  const questionNodes = nodes.filter((d) => d.type === "question")

  const questionElements = svg
    .append("g")
    .attr("class", "questions")
    .selectAll<SVGCircleElement, Node>("circle")
    .data(questionNodes)
    .join("circle")
    .attr("r", sizes.questionRadius)
    .attr("fill", (d) => {
      const clusterId = d.clusterIds?.[0] || 0
      return clusterColors[clusterId]?.main || "#000"
    })
    .attr("stroke", "none")
    .style("cursor", "pointer")

    // Add tooltip event handlers for hover
    .on("mouseenter", (event, d) => {
      // Find all clusters this question is actually connected to via links
      const connectedClusterIds = links
        .filter((link) => {
          // Check if this question is the source or target of a link
          const sourceId = typeof link.source === "object" ? link.source.id : link.source
          const targetId = typeof link.target === "object" ? link.target.id : link.target
          return sourceId === d.id || targetId === d.id
        })
        .map((link) => {
          // Get the other end of the link (the cluster)
          const sourceId = typeof link.source === "object" ? link.source.id : link.source
          const targetId = typeof link.target === "object" ? link.target.id : link.target
          return sourceId === d.id ? targetId : sourceId
        })
        .filter((nodeId) => {
          // Only keep cluster nodes
          const node = nodes.find((n) => n.id === nodeId)
          return node && node.type === "cluster"
        })

      // Get cluster labels for all connected clusters
      const clusterLabels = connectedClusterIds.map((clusterId) => {
        const clusterNode = nodes.find((n) => n.id === clusterId && n.type === "cluster")
        return clusterNode ? clusterNode.label : `Cluster ${clusterId}`
      })

      let clusterInfo = ""
      if (clusterLabels.length > 0) {
        if (clusterLabels.length > 1) {
          clusterInfo = `<strong>Connected to Clusters:</strong><br/>
            <div style="margin: 5px 0; padding: 5px; background: rgba(255,255,255,0.1); border-radius: 3px;">
              ${clusterLabels.join("<br/>")}
            </div>`
        } else {
          clusterInfo = `<strong>Connected to Cluster:</strong> ${clusterLabels[0]}<br/>`
        }
      }

      const tooltipContent = `
        <div>
          <strong>Question:</strong><br/>
          <div style="max-height: 150px; overflow-y: auto; margin: 5px 0; padding: 5px; background: rgba(255,255,255,0.1); border-radius: 3px;">
            ${d.label || "N/A"}
          </div>
          ${clusterInfo}
          <strong>Country Code:</strong> ${d.country || "N/A"}<br/>
          <strong>Case Created Date:</strong> ${d.date || "N/A"}<br/>
          <strong>Drug Name:</strong> ${d.drug || "N/A"}
        </div>
      `

      // Use the new showTooltip function
      showTooltip(tooltipContent, event)
    })
    .on("mousemove", (event, d) => {
      // Use the new updateTooltipPosition function
      updateTooltipPosition(event)
    })
    .on("mouseleave", (event, d) => {
      // Use the new hideTooltip function
      hideTooltip()
    })
    // Add click handler for multi-cluster questions
    .on("click", (event, d) => {
      // Prevent event bubbling
      event.stopPropagation()

      // Only handle clicks if we have the callback and this question has multiple clusters
      if (onQuestionClick && d.clusterIds && d.clusterIds.length > 1) {
        // Find all other clusters this question is connected to
        const connectedClusterIds = d.clusterIds.slice() // Copy the array

        // Call the callback with the question ID and connected cluster IDs
        onQuestionClick(d.id, connectedClusterIds)
      }
    })

  return questionElements
}
