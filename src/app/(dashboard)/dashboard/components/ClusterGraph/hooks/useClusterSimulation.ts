"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import * as d3 from "d3"
import type { Node, Link } from "../types"
import { calculateClusterPositions, calculateSizes } from "../utils/clusterUtils"
import { createClusterNodes, createQuestionNodes } from "../utils/nodeUtils"
import { createClusterLinks, createQuestionLinks } from "../utils/linkUtils"
import { createLinkElements } from "../components/LinkElements"
import { createClusterElements } from "../components/ClusterElements"
import { createQuestionElements } from "../components/QuestionElements"

export const useClusterSimulation = (
  svgRef: React.RefObject<SVGSVGElement>,
  data: any,
  loading: boolean,
  dimensions: { width: number; height: number },
  isDarkMode: boolean,
  onQuestionClick?: (questionId: string, connectedClusterIds: number[]) => void,
) => {
  const simulationRef = useRef<d3.Simulation<Node, Link> | null>(null)
  const nodesRef = useRef<Node[]>([])
  const linksRef = useRef<Link[]>([])

  useEffect(() => {
    if (!data || loading || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const { width, height } = dimensions
    const centerX = width / 2
    const centerY = height / 2
    const sizes = calculateSizes(width, height)

    svg.attr("width", "100%").attr("height", "100%").attr("preserveAspectRatio", "xMidYMid meet")

    // Create nodes and links
    const clusterPositions = calculateClusterPositions(width, height, data?.clusters?.length || 0)
    const clusterNodes = createClusterNodes(data?.clusters || [], clusterPositions)
    const questionNodes = createQuestionNodes(data?.questions || [], clusterNodes, width, height)
    const nodes = [...clusterNodes, ...questionNodes]

    const clusterLinks = createClusterLinks(data?.clusters || [])
    const questionLinks = createQuestionLinks(data?.questions || [], clusterNodes)
    const links = [...clusterLinks, ...questionLinks]

    nodesRef.current = nodes
    linksRef.current = links

    // Create visual elements
    const linkElements = createLinkElements({ svg, links, isDarkMode })
    const { clusterElements, clusterLabels } = createClusterElements({ svg, nodes, dimensions })
    const questionElements = createQuestionElements({ svg, nodes, links, dimensions, onQuestionClick })

    // Create simulation
    const simulation = d3
      .forceSimulation<Node>(nodes)
      .force(
        "link",
        d3
          .forceLink<Node, Link>(links)
          .id((d) => d.id)
          .distance(sizes.linkDistance)
          .strength(0.05),
      )
      .force("charge", d3.forceManyBody().strength(-100))
      .force("collision", d3.forceCollide().radius(sizes.collisionRadius))
      .force("center", d3.forceCenter(centerX, centerY))
      .alpha(0.3)
      .alphaDecay(0.1)

    simulationRef.current = simulation

    // Animation tick
    simulation.on("tick", () => {
      linkElements
        .attr("x1", (d) => (d.source as Node).x ?? 0)
        .attr("y1", (d) => (d.source as Node).y ?? 0)
        .attr("x2", (d) => (d.target as Node).x ?? 0)
        .attr("y2", (d) => (d.target as Node).y ?? 0)

      clusterElements.attr("cx", (d) => d.x ?? 0).attr("cy", (d) => d.y ?? 0)
      questionElements.attr("cx", (d) => d.x ?? 0).attr("cy", (d) => d.y ?? 0)
      clusterLabels.attr("x", (d) => d.x ?? 0).attr("y", (d) => (d.y ?? 0) - 15)
    })

    // Stop simulation after initial settling
    setTimeout(() => {
      simulation.stop()
    }, 1000)

    // Add data attributes for styling
    svg.selectAll(".links line").attr("data-cluster-id", (d: any) => String(d.clusterId || ""))
    svg.selectAll(".clusters circle").attr("data-cluster-id", (d: any) => String((d as Node).clusterId || ""))
    svg.selectAll(".questions circle").attr("data-cluster-id", (d: any) => String(d.clusterIds?.[0] || ""))

    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop()
      }
    }
  }, [data, loading, dimensions, isDarkMode])

  return { simulationRef, nodesRef, linksRef }
}
