'use client';
import { useEffect, useRef } from 'react';
import { ClusterGraphControlsProps } from './types';

export default function ClusterGraphControls({
  currentStep,
  totalSteps,
  getStepTitle,
  getCurrentSummary
}: ClusterGraphControlsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStep, totalSteps]);

  const summaryRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = summaryRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      const deltaY = e.deltaY;
      const atTop = el.scrollTop === 0;
      const atBottom = Math.abs(el.scrollTop + el.clientHeight - el.scrollHeight) < 1;

      if ((deltaY < 0 && !atTop) || (deltaY > 0 && !atBottom)) {
        // Prevent the page/window handler from taking this wheel event
        e.preventDefault();
        e.stopPropagation();
        el.scrollTop += deltaY;
      }
      // Otherwise let it propagate so the window handler can react (or the page can scroll)
    };

    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      el.removeEventListener('wheel', onWheel as EventListener);
    };
  }, []);

  return (
    <div className="flex justify-between">
      <div className="top-4 left-4 z-10 backdrop-blur-sm rounded-lg p-4 max-w-md">
        <h3 className="text-lg font-semibold mb-2">{getStepTitle()}</h3>
        <div ref={summaryRef} className="text-sm max-h-32 overflow-y-auto">{getCurrentSummary()}</div>
      </div>
    </div>
  );
}