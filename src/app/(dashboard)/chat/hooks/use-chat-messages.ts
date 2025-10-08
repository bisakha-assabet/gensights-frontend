import type { ChatMessage } from "../components/types"

export const useChatMessages = (messages: ChatMessage[]): ChatMessage[] => {
  const combined: ChatMessage[] = []

  for (let i = 0; i < messages.length; i++) {
    const current = messages[i]

    // Only process TEXT, FIGURE, JSON, and REFERENCES messages
    if (
      current.data.type !== "TEXT" &&
      current.data.type !== "FIGURE" &&
      current.data.type !== "JSON" &&
      current.data.type !== "REFERENCES"
    ) {
      continue
    }

    // If current is JSON or REFERENCES (citations) and next is TEXT (both from ASSISTANT), combine them
    if ((current.data.type === "JSON" || current.data.type === "REFERENCES") && current.type === "ASSISTANT") {
      const nextMessage = messages[i + 1]

      if (nextMessage?.data.type === "TEXT" && nextMessage.type === "ASSISTANT") {
        // Create enhanced text message with citations
        combined.push({
          ...nextMessage,
          data: {
            ...nextMessage.data,
            citations:
              typeof current.data.content === "object" && "citations" in current.data.content
                ? current.data.content.citations
                : undefined,
          },
        })
        i++ // Skip the next TEXT message since we combined it
      } else {
        // Standalone JSON or REFERENCES message (shouldn't happen but handle gracefully)
        combined.push(current)
      }
    }
    // If current is FIGURE and next is TEXT (both from ASSISTANT), combine them
    else if (current.data.type === "FIGURE" && current.type === "ASSISTANT") {
      const nextMessage = messages[i + 1]

      if (nextMessage?.data.type === "TEXT" && nextMessage.type === "ASSISTANT") {
        // Create enhanced figure message with text description
        combined.push({
          ...current,
          data: {
            ...current.data,
            textDescription: typeof nextMessage.data.content === "string" ? nextMessage.data.content : undefined,
          },
        })
        i++ // Skip the next TEXT message since we combined it
      } else {
        // Standalone FIGURE message
        combined.push(current)
      }
    } else {
      // Regular TEXT message or USER message
      combined.push(current)
    }
  }
  return combined
}
