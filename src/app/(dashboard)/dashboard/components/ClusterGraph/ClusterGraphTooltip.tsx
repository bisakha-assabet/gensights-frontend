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
  }, 200);
}

export function showTooltip(content: string, event: MouseEvent) {
  if (!tooltip) return;
  
  clearHideTimeout();
  const wrapped = `<div class="tooltip-inner">${content}</div>`;

  tooltip
    .html(wrapped)
    .style("visibility", "visible");

  positionTooltip(event);
}

export function hideTooltip() {
  scheduleHide();
}

export function updateTooltipPosition(event: MouseEvent) {
  if (!tooltip) return;
  positionTooltip(event);
}

function positionTooltip(event: MouseEvent) {
  if (!tooltip) return;

  tooltip.style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 10) + "px");
  const node = tooltip.node() as HTMLDivElement | null;
  if (!node) return;

  const rect = node.getBoundingClientRect();
  const padding = 8;

  let left = event.pageX + 10;
  let top = event.pageY - 10;

  if (rect.right > window.innerWidth - padding) {
    left = Math.max(padding, event.pageX - rect.width - 10 + window.scrollX);
  }

  if (rect.bottom > window.innerHeight - padding) {
    top = Math.max(padding, event.pageY - rect.height - 10 + window.scrollY);
  }

  tooltip.style("left", left + "px").style("top", top + "px");
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
      .style("max-width", "600px")
      .style("max-height", "100vh")
  .style("overflow", "hidden")
      .style("z-index", "1000")
      .style("pointer-events", "auto")
      .on("mouseenter", function(this: any) {
        clearHideTimeout();
      })
      .on("mouseleave", function(this: any) {
        scheduleHide();
      })
      .on("click", function(this: any, event: any) {
        if (event && typeof event.stopPropagation === 'function') event.stopPropagation();
      });

    tooltip
      .append('style')
      .text(`
.tooltip .tooltip-inner { 
  max-height: 55vh; 
  overflow-y: auto; 
  max-width: 100%; 
  box-sizing: border-box; 
}
.tooltip .tooltip-question, .tooltip .question { 
  max-height: 40vh; 
  overflow-y: auto; 
  box-sizing: border-box; 
  margin-top: 4px;
}
.tooltip { 
  word-break: break-word; 
}
`);


    function onWheel(e: WheelEvent) {
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      if (!el) return;
      const tooltipEl = el.closest('.tooltip') as HTMLElement | null;
      if (!tooltipEl) return;

      // Only handle wheel events inside tooltip
      if (!tooltipEl.contains(el)) return;

      // Find scrollable region under mouse
      const preferredSelectors = ['.tooltip-question', '.question', '.tooltip-inner'];
      let scrollable: HTMLElement | null = null;
      let node: HTMLElement | null = el;
      while (node && node !== document.body) {
        for (const sel of preferredSelectors) {
          if (node.matches && node.matches(sel)) {
            if (node.scrollHeight > node.clientHeight) {
              scrollable = node;
              break;
            }
          }
        }
        if (scrollable) break;
        node = node.parentElement;
      }
      // Fallback: search for any scrollable element in tooltip
      if (!scrollable) {
        for (const sel of preferredSelectors) {
          const cand = tooltipEl.querySelector(sel) as HTMLElement | null;
          if (cand && cand.scrollHeight > cand.clientHeight) {
            scrollable = cand;
            break;
          }
        }
      }
      if (!scrollable) return;

      // Prevent page/visualization scroll
      e.preventDefault();
      e.stopPropagation();

      // Scroll the found scrollable element
      const deltaY = e.deltaY;
      const atTop = scrollable.scrollTop === 0;
      const atBottom = Math.abs(scrollable.scrollTop + scrollable.clientHeight - scrollable.scrollHeight) < 1;
      // Always scroll within tooltip, never propagate to page
      if ((deltaY < 0 && atTop) || (deltaY > 0 && atBottom)) {
        // At scroll boundary, but still prevent page scroll
        return;
      }
      scrollable.scrollTop += deltaY;
    }

    // Attach wheel listener directly on the tooltip element in capture phase so
    // it intercepts wheel events before other handlers (like the visualization)
    const tooltipNode = tooltip.node() as HTMLElement | null;
    if (tooltipNode) {
      tooltipNode.addEventListener('wheel', onWheel as EventListener, { passive: false, capture: true } as AddEventListenerOptions);
    }

    // Also keep the document-level listener as a fallback
    document.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      clearHideTimeout();
      if (tooltip) {
        tooltip.remove();
        tooltip = null;
      }
      if (tooltipNode) {
        // removeEventListener accepts the same listener reference; pass capture flag
        tooltipNode.removeEventListener('wheel', onWheel as any, { capture: true } as any);
      }
      document.removeEventListener('wheel', onWheel as any);
    };
  }, []);
 
  return null;
}