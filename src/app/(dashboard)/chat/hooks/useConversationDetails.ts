"use client"

import { useState, useEffect } from "react"

export interface Message {
  message_id: string
  role: string
  content: any[]
  created_at: string
  feedback?: string
  metadata?: Record<string, any>
}

export interface Exchange {
  exchange_id: string
  exchange_index: number
  messages: Message[]
  created_at: string
  updated_at: string
}

export interface ConversationDetails {
  conversation_id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
  exchanges: Exchange[]
}

interface UseConversationDetailsResult {
  conversation: ConversationDetails | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export const useConversationDetails = (conversationId: string | null): UseConversationDetailsResult => {
  const [conversation, setConversation] = useState<ConversationDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchConversationDetails = async () => {
    if (!conversationId) {
      setConversation(null)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_MEDGENTICS_API_BASE_URL}/conversations/${conversationId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Conversation not found")
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ConversationDetails = await response.json()
      setConversation(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("Error fetching conversation details:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConversationDetails()
  }, [conversationId])

  const refetch = () => {
    fetchConversationDetails()
  }

  return {
    conversation,
    loading,
    error,
    refetch,
  }
}
