import type React from "react"

interface MedicalContext {
  title: string
  description: string
}

interface ParsedContextsDisplayProps {
  contexts: MedicalContext[]
}

const ParsedContextsDisplay: React.FC<ParsedContextsDisplayProps> = ({ contexts }) => {
  if (contexts.length === 0) return null;

  return (
    <div className="space-y-4">
      {contexts.map((context, index) => (
        <div key={index} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-l-4 border-blue-500">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">
              {index + 1}. {context.title}
            </h3>
          </div>
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
            {context.description}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ParsedContextsDisplay;
