import type React from "react"
import { useState } from "react"
import { ChevronDown, ChevronUp } from 'lucide-react'

interface ReferencesAccordionProps {
  references: string[]
}

const ReferencesAccordion: React.FC<ReferencesAccordionProps> = ({ references }) => {
  const [isReferencesOpen, setIsReferencesOpen] = useState(false);

  if (references.length === 0) return null;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mt-6">
      <button
        onClick={() => setIsReferencesOpen(!isReferencesOpen)}
        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
            References
          </span>
          <span className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
            {references.length}
          </span>
        </div>
        {isReferencesOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>
      
      {isReferencesOpen && (
        <div className="px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-2">
            {references.map((ref, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-gray-400 dark:text-gray-500 text-xs mt-1 min-w-[1rem]">
                  {index + 1}.
                </span>
                <p className="text-gray-600 dark:text-gray-400 text-xs font-mono leading-relaxed">
                  {ref}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferencesAccordion;
