"use client"

import type React from "react"
import { useState } from "react"
import { ChevronDown, ChevronUp, FileText } from "lucide-react"
import type { Citation } from "./types"

interface CitationsAccordionProps {
  citations: Citation[]
}

const CitationsAccordion: React.FC<CitationsAccordionProps> = ({ citations }) => {
  const [isCitationsOpen, setIsCitationsOpen] = useState(false)

  if (citations.length === 0) return null

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mt-6">
      <button
        onClick={() => setIsCitationsOpen(!isCitationsOpen)}
        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-500" />
          <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">References</span>
          <span className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
            {citations.length}
          </span>
        </div>
        {isCitationsOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {isCitationsOpen && (
        <div className="px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-4">
            {citations.map((citation, index) => (
              <div key={citation.case_no} className="border-l-2 border-blue-200 dark:border-blue-800 pl-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-mono bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                    {citation.case_no}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{citation.question}</p>
                {citation.case_created_date && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Created: {new Date(citation.case_created_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CitationsAccordion
