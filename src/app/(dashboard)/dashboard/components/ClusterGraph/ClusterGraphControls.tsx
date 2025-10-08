'use client';
import { useEffect } from 'react';
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

  return (
    <div className="flex justify-between">
      <div className="top-4 left-4 z-10 backdrop-blur-sm rounded-lg p-4 max-w-md">
        <h3 className="text-lg font-semibold mb-2">{getStepTitle()}</h3>
        <div className="text-sm max-h-32 overflow-y-auto">{getCurrentSummary()}</div>
      </div>
    </div>
  );
}