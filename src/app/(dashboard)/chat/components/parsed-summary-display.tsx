import type React from "react"

interface ParsedSummaryDisplayProps {
  summary?: string
}

const ParsedSummaryDisplay: React.FC<ParsedSummaryDisplayProps> = ({ summary }) => {
  if (!summary) return null;

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <p className="text-gray-700 dark:text-gray-300 text-sm italic">
        {summary}
      </p>
    </div>
  );
};

export default ParsedSummaryDisplay;
