"use client"

import type React from "react"
import { User, Brain } from "lucide-react"
import { useState } from "react"
import ParsedMedicalResponse from "./parse"
import VisualizationModal from "./VisualizationModal"
import type { ChatMessage, FigureContent } from "./types"
import ChatLoadingIndicator from "./chat-loading-indicator"
import ChartDisplay from "./chart-display"
import ChatActionButtons from "./chat-action-buttons"

interface ExchangeResponses {
  [exchangeIndex: number]: {
    responses: ChatMessage[]
    currentIndex: number
  }
}

interface MessageBubbleProps {
  message: ChatMessage
  isProcessing: boolean
  onRegenerateResponse?: (conversationId: string, exchangeIndex: number) => void // Added callback prop for regenerate
  exchangeResponses?: ExchangeResponses
  onPreviousResponse?: (exchangeIndex: number) => void
  onNextResponse?: (exchangeIndex: number) => void
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isProcessing,
  onRegenerateResponse,
  exchangeResponses,
  onPreviousResponse,
  onNextResponse,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const isUser = message.type === "USER"
  const isAssistant = message.type === "ASSISTANT"
  const isFigure = message.data.type === "FIGURE"
  const hasTextDescription = isFigure && message.data.textDescription

  // Type guard functions
  const isImageContent = (content: any): content is { image_data: string; title: string; chart_type: string } => {
    return typeof content === "object" && content !== null && "image_data" in content
  }

  const isPlotlyContent = (content: any): content is FigureContent => {
    return typeof content === "object" && content !== null && "plotly_config" in content
  }

  const hasImageData = isFigure && isImageContent(message.data.content)
  const hasPlotlyConfig = isFigure && isPlotlyContent(message.data.content)

  const hasNumberedMedicalList =
    message.data.type === "TEXT" &&
    typeof message.data.content === "string" &&
    /\d+\.\s*\*\*[^*]+\*\*:\s*/.test(message.data.content)

  const hasTableWithSources =
    message.data.type === "TEXT" &&
    typeof message.data.content === "string" &&
    message.data.content.includes("|") &&
    message.data.content.includes("**") &&
    (message.data.content.includes("[source](") || message.data.content.includes("[Source:"))
  const hasSources =
    message.data.type === "TEXT" &&
    typeof message.data.content === "string" &&
    (message.data.content.includes("[source](") ||
      message.data.content.includes("[Source:") ||
      message.data.content.includes("**References:**") ||
      message.data.content.includes("References:") ||
      message.data.content.includes("Case Nos.") ||
      message.data.content.includes("GEN-"))

  const isMedicalResponse = isAssistant && hasSources && (hasNumberedMedicalList || hasTableWithSources)

  const downloadImage = () => {
    if (hasImageData && isImageContent(message.data.content)) {
      const link = document.createElement("a")
      link.href = `data:image/png;base64,${message.data.content.image_data}`
      link.download = `${message.data.content.title || "chart"}.png`
      link.click()
    } else if (hasPlotlyConfig && isPlotlyContent(message.data.content)) {
      // For Plotly charts, trigger download from the modal
      const plotElement = document.querySelector(".js-plotly-plot")
      if (plotElement) {
        // @ts-ignore - Plotly global object
        window.Plotly?.downloadImage(plotElement, {
          format: "png",
          filename: message.data.content.plotly_config?.layout?.title?.text || "chart",
          width: 1200,
          height: 800,
        })
      }
    }
  }

  const copyImage = async () => {
    if (hasImageData && isImageContent(message.data.content)) {
      try {
        const response = await fetch(`data:image/png;base64,${message.data.content.image_data}`)
        const blob = await response.blob()
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])
      } catch (err) {
        console.error("Failed to copy image:", err)
      }
    }
    // Note: Copying Plotly charts as images requires different approach
  }

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  const copyText = () => {
    const textToCopy = hasTextDescription
      ? typeof message.data.textDescription === "string"
        ? message.data.textDescription
        : JSON.stringify(message.data.textDescription)
      : typeof message.data.content === "string"
        ? message.data.content
        : JSON.stringify(message.data.content)

    navigator.clipboard.writeText(textToCopy)
  }

  const handleLike = async () => {
    const { message_id, conversation_id, exchange_index } = message

    console.log("Like clicked - message:", {
      message_id,
      conversation_id,
      exchange_index,
    })

    if (!message_id || !conversation_id) {
      console.error("Missing required IDs for like API call")
      return
    }

    try {
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("No authentication token found")
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_MEDGENTICS_API_BASE_URL}/conversations/${conversation_id}/messages/${message_id}/feedback`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            feedback: "like",
          }),
        },
      )

      console.log("Like API response status:", response.status)
      if (!response.ok) {
        const errorText = await response.text()
        console.error("Like API error:", errorText)
      } else {
        console.log("Like submitted successfully")
      }
    } catch (error) {
      console.error("Error submitting like feedback:", error)
    }
  }

  const handleDislike = async () => {
    const { message_id, conversation_id, exchange_index } = message

    console.log("Dislike clicked - message:", {
      message_id,
      conversation_id,
    })

    if (!message_id || !conversation_id) {
      console.error("Missing required IDs for dislike API call")
      return
    }

    try {
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("No authentication token found")
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_MEDGENTICS_API_BASE_URL}/conversations/${conversation_id}/messages/${message_id}/feedback`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            feedback: "dislike",
          }),
        },
      )

      console.log("Dislike API response status:", response.status)
      if (!response.ok) {
        const errorText = await response.text()
        console.error("Dislike API error:", errorText)
      } else {
        console.log("Dislike submitted successfully")
      }
    } catch (error) {
      console.error("Error submitting dislike feedback:", error)
    }
  }

  const handleRegenerate = () => {
    const { conversation_id, exchange_index } = message
    console.log("Regenerate clicked - message:", {
      conversation_id,
      exchange_index,
    })

    if (!conversation_id || exchange_index === undefined) {
      console.error("Missing required IDs for regenerate API call")
      return
    }

    // Call the parent component's regenerate handler
    if (onRegenerateResponse) {
      onRegenerateResponse(conversation_id, exchange_index)
    }
  }

  const handlePreviousResponse = () => {
    if (onPreviousResponse && message.exchange_index !== undefined) {
      onPreviousResponse(message.exchange_index)
    }
  }

  const handleNextResponse = () => {
    if (onNextResponse && message.exchange_index !== undefined) {
      onNextResponse(message.exchange_index)
    }
  }

  const currentExchange =
    exchangeResponses && message.exchange_index !== undefined ? exchangeResponses[message.exchange_index] : null
  const hasMultipleResponses = currentExchange && currentExchange.responses.length > 1 ? true : undefined
  const currentResponseIndex = currentExchange ? currentExchange.currentIndex + 1 : 1
  const totalResponses = currentExchange ? currentExchange.responses.length : 1

  return (
    <div className={`flex gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? "bg-blue-600" : "bg-gradient-to-br from-blue-500 to-purple-600"
        }`}
      >
        {isUser ? <User className="w-4 h-4 text-white" /> : <Brain className="w-4 h-4 text-white" />}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-3xl ${isUser ? "text-right" : "text-left"}`}>
        {/* Message Bubble */}
        <div
          className={`inline-block max-w-full ${
            isUser
              ? "bg-blue-200 text-white rounded-2xl rounded-br-md px-4 py-3"
              : isFigure
                ? "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-md p-6 shadow-sm"
                : isMedicalResponse
                  ? "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-md px-6 py-4 shadow-sm"
                  : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm"
          }`}
        >
          {isProcessing ? (
            <ChatLoadingIndicator />
          ) : (
            <>
              {isFigure && (hasImageData || hasPlotlyConfig) ? (
                <ChartDisplay
                  title={
                    hasImageData && isImageContent(message.data.content)
                      ? message.data.content.title
                      : hasPlotlyConfig && isPlotlyContent(message.data.content)
                        ? message.data.content.plotly_config?.layout?.title?.text || "Chart"
                        : "Chart"
                  }
                  chartType={
                    hasImageData && isImageContent(message.data.content)
                      ? message.data.content.chart_type
                      : hasPlotlyConfig && isPlotlyContent(message.data.content)
                        ? message.data.content.chart_type || "chart"
                        : "chart"
                  }
                  imageData={
                    hasImageData && isImageContent(message.data.content) ? message.data.content.image_data : undefined
                  }
                  plotlyConfig={
                    hasPlotlyConfig && isPlotlyContent(message.data.content)
                      ? message.data.content.plotly_config
                      : undefined
                  }
                  textDescription={message.data.textDescription as string}
                  onImageClick={openModal}
                />
              ) : (
                <ParsedMedicalResponse
                  content={
                    typeof message.data.content === "string"
                      ? message.data.content
                      : JSON.stringify(message.data.content)
                  }
                  citations={message.data.citations}
                />
              )}
            </>
          )}
        </div>

        {/* Action Buttons - Only for Assistant Messages */}
        {isAssistant && !isProcessing && (
          <ChatActionButtons
            isFigure={isFigure}
            hasTextDescription={!!hasTextDescription}
            onCopyImage={copyImage}
            onDownloadImage={downloadImage}
            onCopyText={copyText}
            onLike={handleLike}
            onDislike={handleDislike}
            onRegenerate={handleRegenerate}
            hasMultipleResponses={hasMultipleResponses}
            currentResponseIndex={currentResponseIndex}
            totalResponses={totalResponses}
            onPreviousResponse={handlePreviousResponse}
            onNextResponse={handleNextResponse}
          />
        )}
      </div>
      {/* Visualization Modal */}
      {isFigure && (hasImageData || hasPlotlyConfig) && (
        <VisualizationModal
          isOpen={isModalOpen}
          onClose={closeModal}
          imageData={hasImageData && isImageContent(message.data.content) ? message.data.content.image_data : undefined}
          plotlyConfig={
            hasPlotlyConfig && isPlotlyContent(message.data.content) ? message.data.content.plotly_config : undefined
          }
          title={
            hasImageData && isImageContent(message.data.content)
              ? message.data.content.title
              : hasPlotlyConfig && isPlotlyContent(message.data.content)
                ? message.data.content.plotly_config?.layout?.title?.text || "Chart"
                : "Chart"
          }
          chartType={
            hasImageData && isImageContent(message.data.content)
              ? message.data.content.chart_type
              : hasPlotlyConfig && isPlotlyContent(message.data.content)
                ? message.data.content.chart_type || "chart"
                : "chart"
          }
          description={hasTextDescription ? (message.data.textDescription as string) : undefined}
        />
      )}
    </div>
  )
}

export default MessageBubble
