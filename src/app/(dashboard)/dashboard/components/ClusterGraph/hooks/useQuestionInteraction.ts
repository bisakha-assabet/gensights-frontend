import { useEffect } from "react";
import * as d3 from "d3";
import { Node, Link } from "../types";
import { clusterColors, calculateSizes } from "../utils/clusterUtils";

interface QuestionInteractionProps {
  svgRef: React.RefObject<SVGSVGElement>;
  data: any;
  currentStep: number;
  dimensions: { width: number; height: number };
  isDarkMode: boolean;
  nodesRef: React.RefObject<Node[]>;
  linksRef: React.RefObject<Link[]>;
  onQuestionClick?: (questionId: string, connectedClusterIds: number[]) => void;
}

export const useQuestionInteraction = ({
  svgRef,
  data,
  currentStep,
  dimensions,
  isDarkMode,
  nodesRef,
  linksRef,
  onQuestionClick
}: QuestionInteractionProps) => {
  useEffect(() => {
    if (!svgRef.current || !data) return;

    const svg = d3.select(svgRef.current);
    const sizes = calculateSizes(dimensions.width, dimensions.height);

    // Update cursor style AND add click handler
    svg
      .selectAll<SVGCircleElement, Node>(".questions circle")
      .style("cursor", (d: any) => {
        if (currentStep === 0) {
          return d.clusterIds?.length > 1 ? "pointer" : "default";
        } else {
          const targetClusterId = currentStep - 1;
          const isInCurrentCluster = d.clusterIds?.includes(targetClusterId);
          const hasMultipleConnections = d.clusterIds?.length > 1;
          return (isInCurrentCluster && hasMultipleConnections) ? "pointer" : "default";
        }
      })
      .on("click", (event: MouseEvent, d: any) => {
        event.stopPropagation();
        
        // Only allow clicks for questions with multiple cluster connections
        if (d.clusterIds?.length > 1) {
          if (currentStep === 0) {
            // In overview mode, all multi-cluster questions are clickable
            onQuestionClick?.(d.id, d.clusterIds);
          } else {
            // In storytelling mode, only questions in current cluster
            const targetClusterId = currentStep - 1;
            const isInCurrentCluster = d.clusterIds?.includes(targetClusterId);
            if (isInCurrentCluster) {
              onQuestionClick?.(d.id, d.clusterIds);
            }
          }
        }
      });

  }, [currentStep, data, dimensions, isDarkMode, nodesRef, linksRef, onQuestionClick]);

  // Function to highlight connected clusters (called from outside when question is clicked)
  const highlightConnectedClusters = (connectedClusterIds: number[]) => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const sizes = calculateSizes(dimensions.width, dimensions.height);
    const { width, height } = dimensions;
    const centerX = width / 2;
    const centerY = height / 2;

    // Highlight connected cluster circles
    svg
      .selectAll<SVGCircleElement, Node>(".clusters circle")
      .transition()
      .duration(500)
      .ease(d3.easeCubicInOut)
      .style("opacity", (d: any) => {
        if (currentStep === 0) {
          // In overview mode, highlight all connected clusters
          return connectedClusterIds.includes(d.clusterId) ? 1 : 0.3;
        } else {
          // In storytelling mode
          const targetClusterId = currentStep - 1;
          if (d.clusterId === targetClusterId) return 1; // Keep current cluster highlighted
          return connectedClusterIds.includes(d.clusterId) ? 0.8 : 5;
        }
      })
      .attr("stroke", (d: any) => {
        if (currentStep === 0) {
          return connectedClusterIds.includes(d.clusterId) 
            ? clusterColors[d.clusterId]?.light || "#fff"
            : "none";
        } else {
          const targetClusterId = currentStep - 1;
          if (d.clusterId === targetClusterId) {
            return clusterColors[d.clusterId]?.light || "#fff";
          }
          return connectedClusterIds.includes(d.clusterId) 
            ? clusterColors[d.clusterId]?.light || "#fff"
            : "none";
        }
      })
      .attr("stroke-width", (d: any) => {
        if (currentStep === 0) {
          return connectedClusterIds.includes(d.clusterId) ? 2 : 0;
        } else {
          const targetClusterId = currentStep - 1;
          if (d.clusterId === targetClusterId) return 3;
          return connectedClusterIds.includes(d.clusterId) ? 2 : 0;
        }
      })
      .attr("r", (d: any) => {
        if (currentStep === 0) {
          return connectedClusterIds.includes(d.clusterId) 
            ? sizes.clusterRadius * 1.2 
            : sizes.clusterRadius;
        } else {
          const targetClusterId = currentStep - 1;
          if (d.clusterId === targetClusterId) return sizes.focusedClusterRadius;
          return connectedClusterIds.includes(d.clusterId) 
            ? sizes.clusterRadius * 1.2 
            : sizes.clusterRadius * 0.7;
        }
      });

    // Highlight connected cluster labels
    svg
      .selectAll<SVGTextElement, Node>(".cluster-labels text")
      .transition()
      .duration(500)
      .ease(d3.easeCubicInOut)
      .style("opacity", (d: any) => {
        const targetClusterId = currentStep - 1;
        if (d.clusterId === targetClusterId) return 1;
        return connectedClusterIds.includes(d.clusterId) ? 0.9 : 0.1;
      })
      .style("fill", (d: any) => {
        const targetClusterId = currentStep - 1;
        if (d.clusterId === targetClusterId) return "#000";
        return connectedClusterIds.includes(d.clusterId) 
          ? clusterColors[d.clusterId]?.main || "#000"
          : "#000";
      })
      .style("font-weight", (d: any) => {
        const targetClusterId = currentStep - 1;
        if (d.clusterId === targetClusterId) return "bold";
        return connectedClusterIds.includes(d.clusterId) ? "600" : "normal";
      });

    // Highlight connecting links
    svg
      .selectAll<SVGLineElement, any>(".links line")
      .transition()
      .duration(500)
      .ease(d3.easeCubicInOut)
      .style("opacity", (d: any) => {
        const targetClusterId = currentStep - 1;
        if (d.clusterId === targetClusterId) return 1;
        if (connectedClusterIds.includes(d.clusterId)) return 0.7;
        return 0.05;
      })
      .style("stroke-width", (d: any) => {
        const targetClusterId = currentStep - 1;
        if (d.clusterId === targetClusterId) return 3;
        return connectedClusterIds.includes(d.clusterId) ? 2 : 0.5;
      });

    // Add a visual indicator showing the connection (only in storytelling mode)
    if (currentStep > 0) {
      const connectionLines = svg
        // .selectAll<SVGLineElement, number>(".connection-indicators")
        // .data(connectedClusterIds)
        // .join("line")
        // .attr("class", "connection-indicators")
        // .attr("stroke", (clusterId) => clusterColors[clusterId]?.main || "#999")
        // .attr("stroke-width", 2)
        // // .attr("stroke-dasharray", "5,5")
        // .style("opacity", 1);

      // Animate connection lines
      connectionLines
        .attr("x1", centerX)
        .attr("y1", centerY)
        .attr("x2", (clusterId) => {
          const clusterNode = nodesRef.current?.find(n => n.clusterId === clusterId && n.type === 'cluster');
          return clusterNode?.fixedX || centerX;
        })
        .attr("y2", (clusterId) => {
          const clusterNode = nodesRef.current?.find(n => n.clusterId === clusterId && n.type === 'cluster');
          return clusterNode?.fixedY || centerY;
        })
        .transition()
        .duration(5000)
        .style("opacity", 10);

      // Remove connection indicators after animation
      setTimeout(() => {
        svg.selectAll(".connection-indicators").remove();
      }, 2500);
    }

    // Auto-reset after 3 seconds
    setTimeout(() => {
      resetClusterHighlights();
    }, 3000);
  };

  const resetClusterHighlights = () => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const sizes = calculateSizes(dimensions.width, dimensions.height);

    if (currentStep === 0) {
      // Reset to overview mode
      svg
        .selectAll<SVGCircleElement, Node>(".clusters circle")
        .transition()
        .duration(500)
        .ease(d3.easeCubicInOut)
        .style("opacity", 1)
        .attr("stroke-width", 3)
        .attr("r", sizes.clusterRadius);

      svg
        .selectAll<SVGTextElement, Node>(".cluster-labels text")
        .transition()
        .duration(500)
        .ease(d3.easeCubicInOut)
        .style("opacity", 1)
        .style("fill", "#000")
        .style("font-weight", "normal");

      svg
        .selectAll<SVGLineElement, any>(".links line")
        .transition()
        .duration(500)
        .ease(d3.easeCubicInOut)
        .style("opacity", (d: any) => d.clusterId === -1 ? 0.6 : 0.95)
        .style("stroke-width", 0.5);
    } else {
      // Reset to storytelling mode
      const targetClusterId = currentStep - 1;

      svg
        .selectAll<SVGCircleElement, Node>(".clusters circle")
        .transition()
        .duration(500)
        .ease(d3.easeCubicInOut)
        .style("opacity", (d: any) => d.clusterId === targetClusterId ? 1 : 0.1)
        .attr("stroke-width", 3)
        .attr("r", (d: any) => 
          d.clusterId === targetClusterId
            ? sizes.focusedClusterRadius
            : sizes.clusterRadius * 0.7
        );

      svg
        .selectAll<SVGTextElement, Node>(".cluster-labels text")
        .transition()
        .duration(500)
        .ease(d3.easeCubicInOut)
        .style("opacity", (d: any) => d.clusterId === targetClusterId ? 1 : 0.1)
        .style("fill", "#000")
        .style("font-weight", "normal");

      svg
        .selectAll<SVGLineElement, any>(".links line")
        .transition()
        .duration(500)
        .ease(d3.easeCubicInOut)
        .style("opacity", (d: any) => {
          if (d.clusterId === -1) return 0.4;
          return d.clusterId === targetClusterId ? 1 : 0.15;
        })
        .style("stroke-width", (d: any) => 
          d.clusterId === targetClusterId ? 3 : 0.5
        );
    }
  };

  // Return the highlight function so it can be called from outside
  return { highlightConnectedClusters };
};

export default useQuestionInteraction;