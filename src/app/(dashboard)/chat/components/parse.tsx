"use client"

import type React from "react"
import { parseContent } from "../lib/parse-utils"
import ParsedContextsDisplay from "./parsed-contexts-display"
import ParsedSummaryDisplay from "./parsed-summary-display"
import ParsedTableDisplay from "./parsed-table-display"
import ParsedTextDisplay from "./parsed-text-display"
import ReferencesAccordion from "./references-accordion"
import CitationsAccordion from "./citations-accordion"
import type { Citation } from "./types"

interface MedicalContext {
  title: string
  description: string
}

interface ParsedMedicalResponse {
  contexts: MedicalContext[]
  references: string[]
  citations: Citation[]
  summary?: string
  isTable?: boolean
}

interface ParsedResponseProps {
  content: string
  citations?: Citation[]
}

const ParsedMedicalResponse: React.FC<ParsedResponseProps> = ({ content, citations }) => {
  const parsed = parseContent(content, citations)

  return (
    <div className="space-y-6">
      {parsed.contexts.length > 0 && <ParsedContextsDisplay contexts={parsed.contexts} />}
      {parsed.summary && <ParsedSummaryDisplay summary={parsed.summary} />}
      {parsed.isTable ? (
        <ParsedTableDisplay content={content} />
      ) : (
        // Only render ParsedTextDisplay if there's actual text content that isn't contexts/summary/table
        // This avoids rendering an empty div if content was fully parsed into contexts/summary
        parsed.contexts.length === 0 &&
        !parsed.isTable &&
        content.trim().length > 0 && <ParsedTextDisplay content={content} />
      )}

      {/* Render Citations Accordion if citations exist */}
      {parsed.citations.length > 0 && <CitationsAccordion citations={parsed.citations} />}

      {/* Render References Accordion if references exist */}
      {parsed.references.length > 0 && <ReferencesAccordion references={parsed.references} />}
    </div>
  )
}

export default ParsedMedicalResponse
