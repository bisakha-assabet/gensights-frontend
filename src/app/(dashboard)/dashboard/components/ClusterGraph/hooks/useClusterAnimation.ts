"use client"

import type React from "react"

import { useEffect } from "react"
import * as d3 from "d3"
import type { Node } from "../types"
import { calculateSizes } from "../utils/clusterUtils"
import { calculateQuestionPosition } from "../utils/nodeUtils"

export const useClusterAnimation = ({
  svgRef,
  data,
  currentStep,
  dimensions,
  isDarkMode,
  nodesRef,
}: {
  svgRef: React.RefObject<SVGSVGElement>
  data: any
  currentStep: number
  dimensions: { width: number; height: number }
  isDarkMode: boolean
  nodesRef: React.RefObject<Node[]>
}) => {
  useEffect(() => {
    if (!svgRef.current || !data) return

    const svg = d3.select(svgRef.current)
    const { width, height } = dimensions
    const centerX = width / 2
    const centerY = height / 2
    const sizes = calculateSizes(width, height)

    // Animate clusters
    svg.selectAll<SVGCircleElement, Node>(".clusters circle").each(function (d: any) {
      let newX, newY
      let shouldHighlight = false
      let opacity = 1

      if (currentStep === 0) {
        // Default view - all clusters visible
        newX = d.fixedX
        newY = d.fixedY
        shouldHighlight = true
        opacity = 1
      } else {
        // Step-by-step storytelling mode
  const targetClusterId = currentStep - 1
  shouldHighlight = d.clusterId === targetClusterId
        opacity = shouldHighlight ? 1 : 0.1

        if (d.clusterId === targetClusterId) {
          newX = centerX
          newY = centerY
        } else {
          newX = d.fixedX
          newY = d.fixedY
        }
      }

      d.x = newX
      d.y = newY

      d3.select(this)
        .transition()
        .duration(1000)
        .ease(d3.easeCubicInOut)
        .attr("cx", newX)
        .attr("cy", newY)
        .attr(
          "r",
          currentStep === 0
            ? sizes.clusterRadius
            : d.clusterId === currentStep - 1
              ? sizes.focusedClusterRadius
              : sizes.clusterRadius * 0.7,
        )
        .style("opacity", opacity)
        .attr("stroke-width", 3)
    })

    // Animate cluster labels
    svg.selectAll<SVGTextElement, Node>(".cluster-labels text").each(function (d: any) {
      let newX, newY
      let shouldHighlight = false
      let opacity = 1

      if (currentStep === 0) {
        // Default view
        newX = d.fixedX
        newY = (d.fixedY ?? 0) + (sizes.clusterRadius + 18)
        shouldHighlight = true
        opacity = 1
      } else {
        // Step-by-step storytelling mode: move title to top of screen instead of center
  const targetClusterId = currentStep - 1
  shouldHighlight = d.clusterId === targetClusterId
        opacity = shouldHighlight ? 1 : 0.1

        if (d.clusterId === targetClusterId) {
          // Position title at the top center of the visualization
          newX = centerX
          newY = 60 // Top of the screen with some padding
        } else {
          newX = d.fixedX
          newY = (d.fixedY ?? 0) + (sizes.clusterRadius + 18)
        }
      }

      d3.select(this)
        .transition()
        .duration(1000)
        .ease(d3.easeCubicInOut)
        .attr("x", newX)
        .attr("y", newY)
        .style("opacity", opacity)
        .style("fill", "#000")
    })

    svg.selectAll<SVGTextElement, Node>(".cluster-count-text").each(function (d: any) {
  const targetClusterId = currentStep - 1
  if (d.clusterId === targetClusterId) {
        d3.select(this)
          .transition()
          .duration(1000)
          .ease(d3.easeCubicInOut)
          .attr("x", centerX)
          .attr("y", centerY + 8)
          .style("opacity", 1)
      }
    })

    // Animate questions
    svg.selectAll<SVGCircleElement, Node>(".questions circle").each(function (d: any) {
      let newX, newY
      let shouldHighlight = false

      if (currentStep === 0) {
        // Default view
        newX = d.fixedX
        newY = d.fixedY
        shouldHighlight = true
      } else {
        // Step-by-step storytelling mode
  const targetClusterId = currentStep - 1
  shouldHighlight = d.clusterIds?.includes(targetClusterId)

        if (d.clusterIds?.includes(targetClusterId)) {
          const questionsInCluster =
            nodesRef.current?.filter((n) => n.type === "question" && n.clusterIds?.includes(targetClusterId)) || []

          const questionIndex = questionsInCluster.findIndex((q) => q.id === d.id)
          const totalQuestions = questionsInCluster.length

          const position = calculateQuestionPosition(questionIndex, totalQuestions, centerX, centerY, width, height)

          newX = position.x
          newY = position.y
        } else {
          newX = d.fixedX
          newY = d.fixedY
        }
      }

      d.x = newX
      d.y = newY

      d3.select(this)
        .transition()
        .duration(1000)
        .ease(d3.easeCubicInOut)
        .attr("cx", newX)
        .attr("cy", newY)
        .attr(
          "r",
          currentStep === 0
            ? sizes.questionRadius
      : d.clusterIds?.includes(currentStep)
        ? sizes.focusedQuestionRadius
        : sizes.questionRadius * 0.7,
      )
  .style("opacity", currentStep === 0 ? 1 : d.clusterIds?.includes(currentStep - 1) ? 1 : 0.05)
    })

    svg
      .selectAll<SVGLineElement, any>(".links line")
      .transition()
      .duration(1000)
      .ease(d3.easeCubicInOut)
      .style("stroke", (d: any) => {
        if (d.clusterId === -1) return "#444"
        return isDarkMode ? "#ffffff" : "#000000"
      })
      .style("opacity", (d: any) => {
          if (currentStep === 0) {
            return d.clusterId === -1 ? 0.6 : 0.95
          } else {
            const targetClusterId = currentStep
            if (d.clusterId === -1) return 0.4
            return d.clusterId === targetClusterId ? 1 : 0.15
          }
      })
      .style("stroke-width", (d: any) => {
        if (currentStep === 0) {
          return 0.5
        } else {
          const targetClusterId = currentStep
          return d.clusterId === targetClusterId ? 3 : 0.5
        }
      })
      .attr("x1", (d: any) => {
        const source = d.source as Node
        return source?.x ?? 0
      })
      .attr("y1", (d: any) => {
        const source = d.source as Node
        return source?.y ?? 0
      })
      .attr("x2", (d: any) => {
        const target = d.target as Node
        return target?.x ?? 0
      })
      .attr("y2", (d: any) => {
        const target = d.target as Node
        return target?.y ?? 0
      })
  }, [currentStep, data, dimensions, isDarkMode, nodesRef])
}
