"use client"

import type React from "react"
import { Copy, Download, ThumbsUp, ThumbsDown, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

interface ChartActionButtonsProps {
  onCopyImage: () => void
  onDownloadImage: () => void
  onCopyDescription: () => void
  hasTextDescription: boolean
  onLike: () => void
  onDislike: () => void
  onRegenerate: () => void
  hasMultipleResponses?: boolean
  currentResponseIndex?: number
  totalResponses?: number
  onPreviousResponse?: () => void
  onNextResponse?: () => void
}

const ChartActionButtons: React.FC<ChartActionButtonsProps> = ({
  onCopyImage,
  onDownloadImage,
  onCopyDescription,
  hasTextDescription,
  onLike,
  onDislike,
  onRegenerate,
  hasMultipleResponses,
  currentResponseIndex,
  totalResponses,
  onPreviousResponse,
  onNextResponse,
}) => {
  const [likeState, setLikeState] = useState<"none" | "liked" | "disliked">("none")

  const handleLike = () => {
    setLikeState("liked")
    onLike()
  }

  const handleDislike = () => {
    setLikeState("disliked")
    onDislike()
  }

  return (
    <>
      {hasMultipleResponses && (
        <>
          <button
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onPreviousResponse}
            disabled={currentResponseIndex === 1}
            title="Previous response"
          >
            <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
          </button>
          <span className="text-xs text-gray-400 dark:text-gray-500 px-1">
            {currentResponseIndex}/{totalResponses}
          </span>
          <button
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onNextResponse}
            disabled={currentResponseIndex === totalResponses}
            title="Next response"
          >
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
          </button>
        </>
      )}
      <button
        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors group"
        onClick={onCopyImage}
        title="Copy image"
      >
        <Copy className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
      </button>
      <button
        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors group"
        onClick={onDownloadImage}
        title="Download image"
      >
        <Download className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
      </button>
      {hasTextDescription && (
        <button
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors group"
          onClick={onCopyDescription}
          title="Copy description"
        >
          <Copy className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
        </button>
      )}
      <button
        className={`p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors group ${likeState === "liked" ? "bg-green-100 dark:bg-green-900" : ""}`}
        title="Thumbs up"
        onClick={handleLike}
      >
        <ThumbsUp
          className={`w-4 h-4 ${likeState === "liked" ? "text-green-600 dark:text-green-400" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"}`}
        />
      </button>
      <button
        className={`p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors group ${likeState === "disliked" ? "bg-red-100 dark:bg-red-900" : ""}`}
        title="Thumbs down"
        onClick={handleDislike}
      >
        <ThumbsDown
          className={`w-4 h-4 ${likeState === "disliked" ? "text-red-600 dark:text-red-400" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"}`}
        />
      </button>
      <button
        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors group ml-2"
        title="Regenerate chart"
        onClick={onRegenerate}
      >
        <RotateCcw className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
      </button>
      <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">Regenerate chart</span>
    </>
  )
}

export default ChartActionButtons
