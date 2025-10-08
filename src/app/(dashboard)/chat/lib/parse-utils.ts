import type { Citation } from "../components/types"

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

export const parseContent = (content: string, citations?: Citation[]): ParsedMedicalResponse => {
  const lines = content.split("\n")

  const contexts: MedicalContext[] = []
  const allReferences: string[] = []
  let summary = ""
  let isTable = false

  // Check for table format
  if (
    content.includes("|") &&
    content.includes("**") &&
    (content.includes("[source](") || content.includes("[Source:"))
  ) {
    isTable = true
  }

  const mainContentLines: string[] = []
  let collectingReferencesSection = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Check for reference section header
    if (
      line.includes("**References:**") ||
      line.includes("References:") ||
      line.includes("**Sources:**") ||
      line.includes("Sources:")
    ) {
      collectingReferencesSection = true
      continue // Skip the header itself
    }

    if (collectingReferencesSection) {
      if (line.length > 0) {
        allReferences.push(line)
      }
    } else {
      let tempLine = line // Use a temporary variable to modify the line

      // Handle inline sources within the main content
      // Regex for [source](URL) - Corrected regex for markdown links
      const sourceUrlRegex = /\[source\]$$([^)]+)$$/g
      let match
      while ((match = sourceUrlRegex.exec(tempLine)) !== null) {
        allReferences.push(match[1]) // Capture the URL
      }
      tempLine = tempLine.replace(sourceUrlRegex, "").trim() // Remove all occurrences of the pattern

      // Regex for [Source: CODE]
      const sourceCodeRegex = /\[Source:\s*([^\]]+)\]/g
      while ((match = sourceCodeRegex.exec(tempLine)) !== null) {
        allReferences.push(match[1]) // Capture the code
      }
      tempLine = tempLine.replace(sourceCodeRegex, "").trim() // Remove all occurrences of the pattern

      // Add to main content lines if not empty after source removal
      if (tempLine.length > 0) {
        mainContentLines.push(tempLine)
      }
    }
  }

  // Now parse the main content lines for contexts and summary
  let currentContext: MedicalContext | null = null
  let isCollectingSummary = false

  for (let i = 0; i < mainContentLines.length; i++) {
    const line = mainContentLines[i]

    const numberedMatch = line.match(/^(\d+)\.\s*\*\*([^*]+)\*\*:\s*(.*)/)

    if (numberedMatch) {
      if (currentContext) {
        contexts.push(currentContext)
      }
      currentContext = {
        title: numberedMatch[2].trim(),
        description: numberedMatch[3].trim(),
      }
      isCollectingSummary = false // Stop collecting summary if a new context starts
    } else if (
      line.includes("These are the noted") ||
      line.includes("These applications") ||
      line.includes("highlight") ||
      line.includes("utility") ||
      line.includes("For specific guidance") ||
      line.includes("Always consult")
    ) {
      if (currentContext) {
        contexts.push(currentContext)
        currentContext = null
      }
      summary += (summary ? " " : "") + line
      isCollectingSummary = true
    } else if (isCollectingSummary) {
      summary += " " + line
    } else if (currentContext) {
      currentContext.description += " " + line
    }
  }

  if (currentContext) {
    contexts.push(currentContext)
  }

  // Ensure references are unique and filter out empty strings
  const uniqueReferences = Array.from(new Set(allReferences.filter((ref) => ref.length > 0)))

  return {
    contexts,
    references: uniqueReferences,
    citations: citations || [],
    summary,
    isTable,
  }
}

export const renderFormattedText = (text: string) => {
  // Replace **text** with bold
  const boldFormatted = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")

  // Replace *text* with italic (but not if it's part of **)
  const italicFormatted = boldFormatted.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>")

  return { __html: italicFormatted }
}
