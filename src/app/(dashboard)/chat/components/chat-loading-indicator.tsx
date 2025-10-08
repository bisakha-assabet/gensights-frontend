import type React from "react"

const ChatLoadingIndicator: React.FC = () => (
  <div className="flex items-center space-x-2 text-gray-500">
    <div className="flex space-x-1">
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-100"></div>
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-200"></div>
    </div>
    <span className="text-sm">Processing...</span>
  </div>
)

export default ChatLoadingIndicator
