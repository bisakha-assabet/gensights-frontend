'use client';
import { useRef, RefObject } from "react";
import { ClusterGraphProps } from "./types";
import type { Dispatch, SetStateAction } from 'react';
import { useClusterSimulation } from "./hooks/useClusterSimulation";
import { useClusterAnimation } from "./hooks/useClusterAnimation";
import { useQuestionInteraction } from "./hooks/useQuestionInteraction";

export default function ClusterGraph({
  data,
  loading,
  dimensions,
  currentStep,
  isDarkMode,
  clickHighlightedClusterIds,
  onQuestionClick,
  setCurrentStep
}: ClusterGraphProps & { setCurrentStep?: Dispatch<SetStateAction<number>> }) {
  const svgRef = useRef<SVGSVGElement>(null) as RefObject<SVGSVGElement>;
 
  const { nodesRef, linksRef } = useClusterSimulation(
    svgRef,
    data,
    loading,
    dimensions,
    isDarkMode,
    currentStep,
    onQuestionClick,
    setCurrentStep // Pass setCurrentStep here
  );

  // Handle cluster animations
  useClusterAnimation({
    svgRef,
    data,
    currentStep,
    dimensions,
    isDarkMode,
    nodesRef,
  });

  // Handle question click interactions for multi-cluster connections
  const { highlightConnectedClusters } = useQuestionInteraction({
    svgRef,
    data,
    currentStep,
    dimensions,
    isDarkMode,
    nodesRef,
    linksRef,
    onQuestionClick: (questionId: string, connectedClusterIds: number[]) => {
      // Highlight the connected clusters visually
      highlightConnectedClusters(connectedClusterIds);
      
      if (onQuestionClick) {
        onQuestionClick(questionId, connectedClusterIds);
      }
    }
  });

  return (
    <div className="w-full h-full relative overflow-hidden">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        ref={svgRef}
        preserveAspectRatio="xMidYMid meet"
      />
    </div>
  );
}