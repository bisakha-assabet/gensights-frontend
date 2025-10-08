"use client"
import { useState } from "react"
import type React from "react"

import { Send, HelpCircle } from 'lucide-react'

interface SendMessageProps {
  onSendMessage: (message: string) => void
  isProcessing: boolean
}

const SendMessage: React.FC<SendMessageProps> = ({ onSendMessage, isProcessing }) => {
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !isProcessing) {
      // Call the parent's send message handler
      onSendMessage(message)
      
      // Clear the input
      setMessage("")
    }
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative flex items-center bg-white border border-gray-200 rounded-full shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={isProcessing ? "Processing..." : "Ask anything"}
            className="flex-1 px-6 py-4 bg-transparent border-none outline-none placeholder-gray-400 text-gray-900"
            disabled={isProcessing}
          />

          {/* Help Icon */}
          <button 
            type="button" 
            className="p-2 hover:bg-gray-50 rounded-full transition-colors mr-2"
            disabled={isProcessing}
          >
            <HelpCircle className="w-5 h-5 text-gray-400" />
          </button>

          {/* Send Button */}
          <button
            type="submit"
            className={`p-3 rounded-full transition-all mr-2 ${
              !isProcessing && message.trim()
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
            disabled={isProcessing || !message.trim()}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )
}

export default SendMessage;