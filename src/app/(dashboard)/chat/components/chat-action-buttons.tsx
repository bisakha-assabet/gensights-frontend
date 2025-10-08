import type React from "react"
import ChartActionButtons from "./chart-action-buttons"
import TextActionButtons from "./text-action-buttons"

interface ChatActionButtonsProps {
  isFigure: boolean
  hasTextDescription: boolean
  onCopyImage: () => void
  onDownloadImage: () => void
  onCopyText: () => void
  onLike: () => void
  onDislike: () => void
  onRegenerate: () => void
  hasMultipleResponses?: boolean
  currentResponseIndex?: number
  totalResponses?: number
  onPreviousResponse?: () => void
  onNextResponse?: () => void
}

const ChatActionButtons: React.FC<ChatActionButtonsProps> = ({
  isFigure,
  hasTextDescription,
  onCopyImage,
  onDownloadImage,
  onCopyText,
  onLike,
  onDislike,
  onRegenerate,
  hasMultipleResponses,
  currentResponseIndex,
  totalResponses,
  onPreviousResponse,
  onNextResponse,
}) => (
  <div className="flex items-center gap-2 mt-2 ml-1">
    {isFigure ? (
      <ChartActionButtons
        onCopyImage={onCopyImage}
        onDownloadImage={onDownloadImage}
        onCopyDescription={onCopyText}
        hasTextDescription={hasTextDescription}
        onLike={onLike}
        onDislike={onDislike}
        onRegenerate={onRegenerate}
        hasMultipleResponses={hasMultipleResponses}
        currentResponseIndex={currentResponseIndex}
        totalResponses={totalResponses}
        onPreviousResponse={onPreviousResponse}
        onNextResponse={onNextResponse}
      />
    ) : (
      <TextActionButtons
        onCopyText={onCopyText}
        onLike={onLike}
        onDislike={onDislike}
        onRegenerate={onRegenerate}
        hasMultipleResponses={hasMultipleResponses}
        currentResponseIndex={currentResponseIndex}
        totalResponses={totalResponses}
        onPreviousResponse={onPreviousResponse}
        onNextResponse={onNextResponse}
      />
    )}
  </div>
)

export default ChatActionButtons
