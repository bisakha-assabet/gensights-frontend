import type React from "react"
import { renderFormattedText } from "../lib/parse-utils"
// Removed import for ReferencesAccordion as it's now handled by parse.tsx

interface ParsedTableDisplayProps {
  content: string
  // Removed references prop as it's now handled by parse.tsx
}

const ParsedTableDisplay: React.FC<ParsedTableDisplayProps> = ({ content }) => {
  return (
    <div className="prose max-w-none">
      <div 
        className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono text-sm"
        dangerouslySetInnerHTML={renderFormattedText(content)}
      />
      {/* ReferencesAccordion is now rendered in parse.tsx */}
    </div>
  );
};

export default ParsedTableDisplay;
