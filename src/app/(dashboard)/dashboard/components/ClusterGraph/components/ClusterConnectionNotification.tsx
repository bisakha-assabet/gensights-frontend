"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { Node } from "../types"

interface ClusterConnectionNotificationProps {
  questionId: string | null
  connectedClusters: Node[]
  onClose: () => void
  isDarkMode: boolean
}

const ClusterConnectionNotification: React.FC<ClusterConnectionNotificationProps> = ({
  questionId,
  connectedClusters,
  onClose,
  isDarkMode,
}) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (questionId && connectedClusters.length > 0) {
      setIsVisible(true)

      // Auto-close after 3 seconds
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 800) // Wait for fade-out animation
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [questionId, connectedClusters, onClose])

  if (!isVisible || !questionId || connectedClusters.length === 0) {
    return null
  }

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 
        max-w-sm p-4 rounded-lg shadow-lg border
        transition-all duration-300 ease-in-out
        ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
        ${isDarkMode ? "bg-gray-800 border-gray-600 text-white" : "bg-white border-gray-200 text-gray-900"}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-sm mb-2">🔗 Question Connected to Multiple Clusters</h4>
          <p className="text-xs mb-3 opacity-80">This question is also connected to:</p>
          <div className="space-y-2">
            {connectedClusters.map((cluster) => (
              <div
                key={cluster.id}
                className={`
                  flex items-center space-x-2 p-2 rounded
                  ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}
                `}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: cluster.color || "#666",
                  }}
                />
                <span className="text-xs font-medium">
                  {cluster.label?.replace(/"/g, "") || `Cluster ${cluster.clusterId}`}
                </span>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(onClose, 300)
          }}
          className={`
            ml-2 p-1 rounded text-xs opacity-60 hover:opacity-100
            ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}
          `}
        >
          ✕
        </button>
      </div>

      <div className="mt-3 pt-2 border-t border-gray-300 dark:border-gray-600">
        <p className="text-xs opacity-60">Connected clusters are temporarily highlighted</p>
      </div>
    </div>
  )
}

export default ClusterConnectionNotification
