import type * as d3 from "d3"
import type { Node } from "../types"
import { clusterColors, calculateSizes } from "../utils/clusterUtils"
import { getTooltip } from "../../ClusterGraph/ClusterGraphTooltip"

interface ClusterElementsProps {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
  nodes: Node[]
  dimensions: { width: number; height: number }
  currentStep?: number
  data?: any
  setCurrentStep?: (step: number) => void
}

export const createClusterElements = ({ svg, nodes, dimensions, currentStep = 0, data, setCurrentStep }: ClusterElementsProps) => {
  const sizes = calculateSizes(dimensions.width, dimensions.height)
  const clusterNodes = nodes.filter((d) => d.type === "cluster")

  console.log('createClusterElements called with:', { 
    currentStep, 
    hasData: !!data, 
    hasQuestions: !!data?.questions,
    questionsCount: data?.questions?.length,
    clusterNodesCount: clusterNodes.length,
    hasSetCurrentStep: typeof setCurrentStep === 'function'
  })

  const clusterElements = svg
    .append("g")
    .attr("class", "clusters")
    .selectAll<SVGCircleElement, Node>("circle")
    .data(clusterNodes)
    .join("circle")
    .attr("r", (d) => {
      // If in step-by-step view (currentStep > 0) and this is the focused cluster, make it larger
      // currentStep uses 0 for overview and cluster IDs are 0-based in the data,
      // so when currentStep > 0 the focusedClusterId is currentStep - 1
      const focusedClusterId = currentStep > 0 ? currentStep - 1 : -1
      if (d.clusterId === focusedClusterId) return sizes.clusterRadius * 1.4
      return sizes.clusterRadius
    })
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
          // Compute total questions for this cluster if data available
          let countText = ""
          if (data && Array.isArray(data.questions) && typeof d.clusterId === "number") {
            const dataClusterId = d.clusterId + 1 // data uses 1-based cluster ids
            const count = data.questions.filter((q: any) => Array.isArray(q.clusters) && q.clusters.includes(dataClusterId)).length
            countText = `<div style=\"margin-top:6px;opacity:0.9;\"><strong>Total Questions:</strong> ${count}</div>`
          }

          content = `
            <div>
              <strong>${d.label}</strong>
              ${countText}
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

        // Also show the count inside the cluster circle itself while hovered
        if (d.type === "cluster" && data && Array.isArray(data.questions) && typeof d.clusterId === "number") {
          const dataClusterId = d.clusterId + 1
          const count = data.questions.filter((q: any) => Array.isArray(q.clusters) && q.clusters.includes(dataClusterId)).length

          // remove existing hover count for this cluster if present
          svg.selectAll(`.cluster-hover-count-${d.clusterId}`).remove()

          svg
            .append("text")
            .attr("class", `cluster-hover-count cluster-hover-count-${d.clusterId}`)
            .text(String(count))
            .attr("x", d.x ?? 0)
            .attr("y", (d.y ?? 0) + 5)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("fill", clusterColors[d.clusterId]?.main || "#3b82f6")
            .style("font-size", `${sizes.fontSize * 1.6}px`)
            .style("font-weight", "700")
            .style("pointer-events", "none")
            .attr("opacity", 1)
        }
      }
    })
    .on("mousemove", (event, d) => {
      const tooltip = getTooltip()
      if (tooltip) {
        tooltip.style("top", event.pageY - 10 + "px").style("left", event.pageX + 10 + "px")
      }
    })
    .on("mouseout", (event, d) => {
      const tooltip = getTooltip()
      if (tooltip) {
        tooltip.style("visibility", "hidden")
      }

      // Remove any hover count text for this cluster
      try {
        if (d && typeof d.clusterId === "number") {
          svg.selectAll(`.cluster-hover-count-${d.clusterId}`).remove()
        } else {
          svg.selectAll('.cluster-hover-count').remove()
        }
      } catch (e) {
        // ignore
      }
    })
    // Add click handler for cluster nodes
    .on("click", (event, d) => {
      console.log('Cluster clicked:', { 
        type: d.type, 
        clusterId: d.clusterId, 
        currentStep,
        hasSetCurrentStep: typeof setCurrentStep === 'function'
      })
      event.stopPropagation();
      // Handle cluster node clicks
      if (d.type === "cluster" && typeof setCurrentStep === "function" && typeof d.clusterId === "number") {
        console.log('Calling setCurrentStep with:', d.clusterId + 1)
        // currentStep uses 0 for overview; storytelling steps start at 1, so map
        // the 0-based clusterId to the step index by adding 1.
        setCurrentStep(d.clusterId + 1);
      }
    })

  // Labels below clusters 
  const clusterLabels = svg
    .append("g")
    .attr("class", "cluster-labels")
    .selectAll("text")
    .data(clusterNodes)
    .join("text")
    .text((d) => d.label)
    .attr("x", (d) => d.x ?? 0)
    // Place label below the cluster to avoid overlap with the cluster circle
    .attr("y", (d) => (d.y ?? 0) + (sizes.clusterRadius + 18))
    .attr("text-anchor", "middle")
    .attr("fill", (d) => clusterColors[d.clusterId || 0]?.main || "#3b82f6")
    .attr("opacity", 0.5) 
    .style("font-size", `${sizes.fontSize}px`)
    // Allow labels to be clickable so the top-center title (when moved in storytelling)
    // can act as an entry point into the step-by-step view.
    .style("pointer-events", "auto")
    .style("cursor", "pointer")
    .on("click", (event, d) => {
      console.log('Label clicked:', { clusterId: d.clusterId })
      // Prevent underlying svg handlers
      event.stopPropagation()
      if (typeof setCurrentStep === "function" && typeof d.clusterId === "number") {
        console.log('Calling setCurrentStep from label with:', d.clusterId + 1)
        // Map 0-based clusterId to storytelling step index
        setCurrentStep(d.clusterId + 1)
      }
    })

  // Only show question counts in step-by-step view (currentStep > 0)
  if (currentStep > 0 && data?.questions) {
    const focusedClusterId = currentStep - 1
    
    console.log('Rendering counts in step-by-step view:', { currentStep, focusedClusterId })
    
    // Add counts for ALL clusters, but fade out non-focused ones
    clusterNodes.forEach((cluster) => {
      const clusterId = cluster.clusterId ?? 0
      const isFocused = clusterId === focusedClusterId
      
      // Count questions for this cluster
      // Note: cluster IDs in the nodes are 0-based, but in data.questions they start from 1
      const dataClusterId = clusterId + 1
      const count = data.questions.filter((q: any) => {
        return q.clusters && Array.isArray(q.clusters) && q.clusters.includes(dataClusterId)
      }).length
      
      console.log(`Cluster ${clusterId} (node) / ${dataClusterId} (data) (${cluster.label}): ${count} questions, focused: ${isFocused}`)

      // Add text element centered inside the cluster circle
      svg
        .append("text")
        .attr("class", isFocused ? "cluster-count-text-focused" : "cluster-count-text-faded")
        .text(String(count))
        .attr("x", cluster.x ?? 0)
        .attr("y", (cluster.y ?? 0) + 5)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", clusterColors[clusterId]?.main || "#3b82f6")
        .attr("opacity", isFocused ? 1 : 0.2) // Fade out non-focused clusters
        .style("font-size", `${sizes.fontSize * 2}px`)
        .style("font-weight", "700")
        .style("pointer-events", "none")
    })
  } else {
    console.log('Not rendering counts:', { 
      currentStep, 
      hasQuestions: !!data?.questions,
      condition: currentStep > 0 && !!data?.questions 
    })
  }

  return { clusterElements, clusterLabels }
}