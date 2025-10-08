'use client';
import { useEffect } from 'react';
import * as d3 from 'd3';

let tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, any> | null = null;
let hideTimeout: NodeJS.Timeout | null = null;

export function getTooltip() {
  return tooltip!;
}

function clearHideTimeout() {
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
}

function scheduleHide() {
  clearHideTimeout();
  hideTimeout = setTimeout(() => {
    if (tooltip) {
      tooltip.style("visibility", "hidden");
    }
  }, 200); // 200ms delay before hiding
}

export function showTooltip(content: string, event: MouseEvent) {
  if (!tooltip) return;
  
  clearHideTimeout();
  
  tooltip
    .html(content)
    .style("visibility", "visible")
    .style("left", (event.pageX + 10) + "px")
    .style("top", (event.pageY - 10) + "px");
}

export function hideTooltip() {
  scheduleHide();
}

export function updateTooltipPosition(event: MouseEvent) {
  if (!tooltip) return;
  
  tooltip
    .style("left", (event.pageX + 10) + "px")
    .style("top", (event.pageY - 10) + "px");
}

export default function ClusterGraphTooltip() {
  useEffect(() => {
    tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("max-width", "200px")
      .style("max-height", "300px")
      .style("overflow-y", "auto")
      .style("z-index", "1000")
      .style("pointer-events", "auto")
      .on("mouseenter", function() {
        // Keep tooltip visible when hovering over it
        clearHideTimeout();
      })
      .on("mouseleave", function() {
        // Hide tooltip when leaving it
        scheduleHide();
      })
      .on("click", function(event) {
        event.stopPropagation();
      });

    return () => {
      clearHideTimeout();
      if (tooltip) {
        tooltip.remove();
        tooltip = null;
      }
    };
  }, []);
 
  return null;
}
