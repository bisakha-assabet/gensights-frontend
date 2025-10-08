'use client';

interface NavigationDotsProps {
  currentStep: number;
  totalSteps: number;
  setCurrentStep: (step: number) => void;
}

export default function NavigationDots({
  currentStep,
  totalSteps,
  setCurrentStep
}: NavigationDotsProps) {
  return (
    <div className="absolute top-1/2 right-4 -translate-y-[70%] z-10 flex flex-col space-y-2">
      {Array.from({ length: totalSteps }, (_, i) => (
        <button
          key={i}
          onClick={() => setCurrentStep(i)}
          className={`w-3 h-3 rounded-full transition-colors ${
            currentStep === i ? "bg-blue-500" : "bg-gray-300 hover:bg-gray-400"
          }`}
        />
      ))}
    </div>
  );
}