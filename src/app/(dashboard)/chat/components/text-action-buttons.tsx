"use client"

import type React from "react"
import { Copy, Edit, ThumbsUp, ThumbsDown, RotateCcw, Check, CircleChevronRight, CircleChevronLeft } from "lucide-react"
import { useState, useEffect } from "react"

interface TextActionButtonsProps {
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

const TextActionButtons: React.FC<TextActionButtonsProps> = ({
  onCopyText,
  onLike,
  onDislike,
  onRegenerate,
  hasMultipleResponses,
  currentResponseIndex,
  totalResponses,
  onPreviousResponse,
  onNextResponse,
}) => {
  const [showCopyNotification, setShowCopyNotification] = useState(false)
  const [likeState, setLikeState] = useState<"none" | "liked" | "disliked">("none")

  const handleCopyClick = async () => {
    try {
      onCopyText()
      setShowCopyNotification(true)
    } catch (error) {
      console.error("Failed to copy text:", error)
    }
  }

  const handleLike = () => {
    setLikeState("liked")
    onLike()
  }

  const handleDislike = () => {
    setLikeState("disliked")
    onDislike()
  }

  useEffect(() => {
    if (showCopyNotification) {
      const timer = setTimeout(() => {
        setShowCopyNotification(false)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [showCopyNotification])

  return (
    <div className="relative">
      {/* Copy notification popup */}
      {showCopyNotification && (
        <div className="absolute -top-12 left-0 bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-2 rounded-lg shadow-lg z-10 flex items-center gap-2 whitespace-nowrap">
          <Check className="w-3 h-3" />
          Response copied
          {/* Arrow pointing down */}
          <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
        </div>
      )}

      {hasMultipleResponses && (
        <>
          <button
            className={`p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors group ${
              currentResponseIndex === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            title="Previous response"
            onClick={onPreviousResponse}
            disabled={currentResponseIndex === 1}
          >
            <CircleChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
          </button>

          <span className="text-xs text-gray-500 dark:text-gray-400 px-2">
            {currentResponseIndex}/{totalResponses}
          </span>

          <button
            className={`p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors group ${
              currentResponseIndex === totalResponses ? "opacity-50 cursor-not-allowed" : ""
            }`}
            title="Next response"
            onClick={onNextResponse}
            disabled={currentResponseIndex === totalResponses}
          >
            <CircleChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
          </button>
        </>
      )}

      <button
        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors group"
        onClick={handleCopyClick}
        title="Copy"
      >
        <Copy className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
      </button>

      <button
        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors group"
        title="Edit"
      >
        <Edit className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
      </button>

      <button
        className={`p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors group ${
          likeState === "liked" ? "bg-green-100 dark:bg-green-900" : ""
        }`}
        title="Thumbs up"
        onClick={handleLike}
      >
        <ThumbsUp
          className={`w-4 h-4 ${
            likeState === "liked"
              ? "text-green-600 dark:text-green-400"
              : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
          }`}
        />
      </button>

      <button
        className={`p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors group ${
          likeState === "disliked" ? "bg-red-100 dark:bg-red-900" : ""
        }`}
        title="Thumbs down"
        onClick={handleDislike}
      >
        <ThumbsDown
          className={`w-4 h-4 ${
            likeState === "disliked"
              ? "text-red-600 dark:text-red-400"
              : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
          }`}
        />
      </button>

      <button
        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors group ml-2"
        title="Regenerate response"
        onClick={onRegenerate}
      >
        <RotateCcw className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
      </button>

      <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">Regenerate response</span>
    </div>
  )
}

export default TextActionButtons
