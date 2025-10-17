import { ClusterPosition, ClusterColor } from "../types";

export const clusterColors: ClusterColor[] = [
  { main: "#4CAAA3", light: "#92d5c4", stroke: "#be185d" }, 
  { main: "#B4A72C", light: "#fff466", stroke: "#1d4ed8" },
  { main: "#2996A3", light: "#47e0f5", stroke: "#15803d" }, 
  { main: "#3DAE4C", light: "#40fc4f", stroke: "#7c3aed" }, 
  { main: "#A84A77", light: "#e557a5", stroke: "#c2410c" }, 
  { main: "#F26D6D", light: "#f58231", stroke: "#0e7490" }, 
  { main: "#801B1B", light: "#C94F4F", stroke: "#a16207" }, 
  { main: "#6454A7", light: "#7f71cb", stroke: "#9d174d" }, 
  { main: "#B5244C", light: "#e6194b", stroke: "#1e3a8a" }, 
  { main: "#C25050", light: "#ff5f5f", stroke: "#365314" },
  { main: "#7CA62E", light: "#bfef45", stroke: "#365314" }, 
  { main: "#949900", light: "#1a1a00", stroke: "#365314" },
  { main: "#763A8E", light: "#911eb4", stroke: "#365314" },
];

export const calculateClusterPositions = (
  width: number, 
  height: number, 
  clusterCount: number
): ClusterPosition[] => {
  const positions: ClusterPosition[] = [];

  if (clusterCount <= 5) {
    const basePositions = [
      { x: 0.5, y: 0.3 },
      { x: 0.25, y: 0.45 },
      { x: 0.75, y: 0.35 },
      { x: 0.35, y: 0.7 },
      { x: 0.65, y: 0.75 },
    ];

    for (let i = 0; i < clusterCount; i++) {
      const pos = basePositions[i] || basePositions[0];
      positions.push({
        x: pos.x * width,
        y: pos.y * height
      });
    }
  } else {
    const cols = Math.ceil(Math.sqrt(clusterCount));
    const rows = Math.ceil(clusterCount / cols);
    
    const xSpacing = (width * 1) / (cols + 1);
    const ySpacing = (height * 1) / (rows + 1);
    const startX = (width - (cols - 1) * xSpacing) / 2;
    const startY = (height - (rows - 1) * ySpacing) / 2;

    for (let i = 0; i < clusterCount; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      
      const randomOffsetX = (Math.random() - 0.5) * xSpacing * 0.6;
      const randomOffsetY = (Math.random() - 0.5) * ySpacing * 0.6;
      
      positions.push({
        x: startX + col * xSpacing + randomOffsetX,
        y: startY + row * ySpacing + randomOffsetY
      });
    }
  }

  return positions;
};

export const getClusterColor = (clusterId: number): ClusterColor => {
  return clusterColors[clusterId] || clusterColors[0];
};

export const calculateSizes = (width: number, height: number) => {
  const minDimension = Math.min(width, height);
  return {
    clusterRadius: minDimension * 0.01,
    focusedClusterRadius: minDimension * 0.025,
  // increased question radii slightly so question circles appear a bit larger
  questionRadius: minDimension * 0.007,
  focusedQuestionRadius: minDimension * 0.01,
    fontSize: minDimension * 0.02,
    questionOrbitRadius: minDimension * 0.08,
    linkDistance: minDimension * 0.12,
    collisionRadius: (d: any) => d.type === "cluster" ? minDimension * 0.06 : minDimension * 0.03
  };
};