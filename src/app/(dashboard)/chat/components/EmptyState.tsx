import type React from "react"
import { Brain } from "lucide-react"

const EmptyState: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Brain className="w-8 h-8 text-pink-500" />
        </div>
        <p className="text-gray-500 text-lg font-medium">What can I help you with?</p>
        <p className="text-gray-400 text-sm mt-2">Type a message to get started</p>
      </div>
    </div>
  )
}

export default EmptyState
