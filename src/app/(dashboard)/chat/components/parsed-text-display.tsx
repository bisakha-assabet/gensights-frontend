import type React from "react"
import { renderFormattedText } from "../lib/parse-utils"
interface ParsedTextDisplayProps {
  content: string
}

const ParsedTextDisplay: React.FC<ParsedTextDisplayProps> = ({ content }) => {
  return (
    <div className="prose max-w-none">
      <div 
        className="whitespace-pre-wrap text-gray-700 dark:text-gray-300"
        dangerouslySetInnerHTML={renderFormattedText(content)}
      />
    </div>
  );
};

export default ParsedTextDisplay;
